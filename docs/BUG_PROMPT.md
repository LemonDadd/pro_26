# Bug 修复提示词

> 复制下方 **「Agent 提示词」** 整段到 Cursor Agent。
> 目标：修复扫描发现的 **5 个 P0（功能异常）+ 2 个 P1（数据完整性）+ 1 个 P2（边界处理）** bug。
> 每修复一个阶段后编译验证，避免连锁问题。

---

## 项目路径

后端代码：`/Users/ext.feixuan3/Desktop/solo/pro_26/server`
技术文档：`docs/backend-tech-doc.md`
接口文档：`docs/backend-api-doc.md`

---

## Agent 提示词（复制从这里开始）

**项目路径**：`/Users/ext.feixuan3/Desktop/solo/pro_26/server`
**栈**：Nest.js 10 + TypeScript + Prisma 5 + SQLite + class-validator

### 修复原则

1. **行为按文档修正**：以 `docs/backend-api-doc.md` 的正确行为作为标准，不超范围修改。
2. **最小可验证步**：每阶段结束 → `npx nest build` 零错误 → 启动服务实测受影响接口。
3. **不改 API 响应结构**：追加字段不破坏已有字段，不做多余重构。

---

## P0 — 功能异常

### 1.1 费用详情/修改/删除缺少成员权限校验

**影响路径**：`GET /expenses/:id`、`PUT /expenses/:id`、`DELETE /expenses/:id`

**文件**：
- `src/modules/expense/expense.controller.ts` 第 44-61 行
- `src/modules/expense/expense.service.ts`

**问题**：
费用控制器仅类级别挂了 `@UseGuards(JwtAuthGuard)`，这三个路由没有挂 `TripAccessGuard`，服务层也没有做 trip member 校验。接口文档要求「需要登录：是（需为行程成员）」，**当前任何已登录用户都可以查看、修改、删除不属于自己的行程中的任意费用记录**，费用隐私完全暴露。

**修改要求**：
- 对于 `PUT /expenses/:id` 和 `DELETE /expenses/:id`：在 service 的 `update()` 和 `remove()` 方法中，通过 expense 查到的 `tripId`，调用 `this.prisma.tripMember` 校验当前用户是否是行程成员
- 同时按接口文档补充"队长或费用创建者"的权限校验：非队长用户只能编辑/删除自己创建的费用（`expense.createdBy === userId`）
- 对于 `GET /expenses/:id`：同样做成员校验（至少是行程成员才能查看）

**验收**：
- 非行程成员访问 `GET /api/v1/expenses/:id` → 返回 403
- 非创建者、非队长访问 `PUT /api/v1/expenses/:id` → 返回 403
- 队长可以编辑任意成员创建的费用
- 创建者可以编辑自己创建的费用

### 1.2 车辆详情/修改/删除缺少权限校验

**影响路径**：`GET /vehicles/:id`、`PUT /vehicles/:id`、`DELETE /vehicles/:id`

**文件**：
- `src/modules/vehicle/vehicle.controller.ts` 第 38-51 行
- `src/modules/vehicle/vehicle.service.ts`

**问题**：
车辆控制器仅 `@UseGuards(JwtAuthGuard)`，这三个路由没有挂 `TripAccessGuard`，服务层也没有校验。接口文档要求`GET /vehicles/:id`「需为行程成员」；`PUT` 和 `DELETE`「需为车主或队长」。**当前任何已登录用户可以看到任意行程的车辆信息，修改和删除车辆也无需授权。**

**修改要求**：
- 三个方法均需通过 vehicle 查到的 `tripId`，校验当前用户是行程成员
- `update()` 和 `remove()` 额外校验：用户必须是车辆 owner 或 trip leader

**验收**：
- 非成员访问 `GET /api/v1/vehicles/:id` → 返回 403
- 非车主、非队长修改车辆 → 返回 403

### 1.3 行程详情统计缺少 `avgPerPerson` 字段

**影响路径**：`GET /api/v1/trips/:id`

**文件**：`src/modules/trip/trip.service.ts` 第 221-225 行

**问题**：
`formatTrip()` 返回的 `stats` 对象只有 `totalExpense`、`expenseCount`、`memberCount` 三个字段。接口文档要求 `stats` 还应包含 `avgPerPerson`（人均花费），格式为 `number`。前端行程详情页的人均花费数据因此永远为 `undefined`。

**修改要求**：
- 在 `formatTrip()` 的 `stats` 中追加 `avgPerPerson`，通过 `getAveragePerPerson(expenses, trip.members?.length ?? 0)` 计算
- 在 `detailInclude()` 的 `expenses` 中确认 `amount` 已被 select（已有），无需改 include

**验收**：
- `GET /api/v1/trips/trip_001` 响应中 `data.stats.avgPerPerson` 为正确数值（2520/4=630）

---

## P1 — 数据完整性问题

### 2.1 费用更新时未重新计算汇率转换金额

**影响路径**：`PUT /api/v1/expenses/:id`

**文件**：`src/modules/expense/expense.service.ts` 第 147-169 行

**问题**：
当用户只更新 `currency` 而不更新 `amount` 时，当前代码只更新了 `currency` 和 `exchangeRate`，但 `cnyAmount` 和 `originalAmount` 仍使用旧的 `expense.amount`。例如：原费用 100 CNY → 改 currency 为 USD，rate 为 7.2，`amount` 保持 100 不变 → 预期是 100 USD，cnyAmount=720，但实际 cnyAmount 仍为 100。**这会导致外币费用切换到人民币后金额计算完全错误。**

**修改要求**：
- 当 `dto.currency` 提供且不等于旧 `expense.currency` 时，将 `dto.amount ?? expense.amount` 按新汇率重新计算 `cnyAmount`
- 若 `dto.currency` 未提供，保持旧汇率逻辑不变

**验收**：
- 创建一笔 CNY 费用，金额 100 → `PUT` 改 currency 为 USD（rate=7.2）不改 amount → `data.amount` 应为 720（cnyAmount），`data.originalAmount` 应为 100（USD），`data.currency` 为 `USD`

### 2.2 费用删除后活动动态 amount 为负数

**影响路径**：`DELETE /api/v1/expenses/:id` → 活动时间线

**文件**：`src/modules/expense/expense.service.ts` 第 217-224 行

**问题**：
删除费用时，`activityService.add` 的 `amount` 传入的是 `-expense.amount`（负数）。活动动态的 `amount` 字段设计为记录关联金额，删除操作使用负数没有实际意义（活动动态应反映"删除了什么"，而非"减了多少钱"）。**前台活动时间线若展示金额绝对值会展示为负数或异常值。**

**修改要求**：
- 删除费用时，`activityService.add` 的 `amount` 参数改为 `undefined`（不传金额），只在 content 中写明"删除了费用：XXX ¥100"
- 或者在 content 中直接拼接金额文字，amount 传 `null`

**验收**：
- 删除一条费用后，活动时间线对应的记录 `amount` 为 `null`（而非 `-100`）

---

## P2 — 边界与健壮性问题

### 3.1 费用列表关键词搜索在 SQLite 下大小写敏感

**影响路径**：`GET /api/v1/trips/:tripId/expenses?keyword=xxx`

**文件**：`src/modules/expense/expense.service.ts` 第 108 行

**问题**：
Prisma/SQLite 的 `contains` 是大小写敏感的（区别于 PostgreSQL）。用户在搜索时输入 `"酒店"` 能匹配 `"康定酒店"`，但输入小写字母关键词时可能匹配不到。**虽然中文无此问题，但英文`description`（如`"Toll fee"`搜`"toll"`不匹配）会导致用户搜索无结果。**

**修改要求**：
- 将第 108 行的 `description: { contains: query.keyword }` 改为 `description: { contains: query.keyword, mode: 'insensitive' }`
- 若 Prisma SQLite provider 不支持 `mode: 'insensitive'`（可能需要特定扩展），改为用 `AND` 条件查询所有费用并在应用层过滤，或在 Prisma schema 中加 `@@schema` 配置

**注意**：SQLite 的 Prisma provider 在 v5 中已支持 `mode: 'insensitive'`（通过 ICU 扩展），默认可直接使用 `{ contains: keyword, mode: 'insensitive' }`。先以这个方式修改，编译后运行时测试。

**验收**：
- 按首字母大小写不同形式搜索同一关键词，返回相同结果集

---

### 验收清单

| # | 验证项 | 命令 / 动作 | 期望 |
|---|--------|-------------|------|
| 1 | 费用详情权限 | 非成员 `GET /api/v1/expenses/:id` | 403 |
| 2 | 费用修改权限 | 非创建者 `PUT /api/v1/expenses/:id` | 403 |
| 3 | 车辆权限 | 非成员 `GET /api/v1/vehicles/:id` | 403 |
| 4 | 车辆修改权限 | 非车主 `PUT /api/v1/vehicles/:id` | 403 |
| 5 | avgPerPerson | 行程详情返回 `stats.avgPerPerson` | 正确数值 |
| 6 | 汇率转换 | 改 currency 后 `data.amount` | 按新汇率换算 |
| 7 | 删除活动金额 | 删除费用后的 activity | `amount` 为 null |
| 8 | 关键词搜索 | 搜索 `"Toll"` 和 `"toll"` | 结果一致 |
| 9 | 编译 | `npx nest build` | 零错误 |

### 工作方式

1. **顺序**：P0 → P1 → P2；每阶段结束 `npx nest build` 一次
2. **阶段内拆小步**：如 P0 的三个问题可以并行修复，每修复一个跑一次编译
3. **先读再改**：读取待改文件全文后再动手
4. 总结格式：**已修复 / 未修复 / 注意事项**

## Agent 提示词（复制到这里结束）

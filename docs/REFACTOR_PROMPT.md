# 代码重构提示词

> 复制下方 **「Agent 提示词」** 整段到 Cursor Agent。
> 目标：**行为不变**（或仅修 §二 已列安全回归 P0）的前提下修类型安全、去重、收启动方式、补单元测试，便于后续迭代。
> 与 `docs/ITERATION_PROMPT.md` 分工：迭代修功能缺口；**重构修架构与可维护性**。
> 每轮重构后更新 `docs/REFACTOR_LOG.md`。

---

## 变更记录

| 轮次 | 日期 | 范围 | 状态 |
|------|------|------|------|
| 1 | 2026-06-21 | TripAccessGuard 修复、类型去 `any`、`toExpenseLike` 去重、邀请码唯一性、登录补充字段、移除 `start.js` 启动垫片 | 待执行 |

---

## Agent 提示词（复制从这里开始）

**项目路径**：`/Users/ext.feixuan3/Desktop/solo/pro_26`
**后端路径**：`/Users/ext.feixuan3/Desktop/solo/pro_26/server`
**栈**：Node.js + TypeScript + Nest.js 10 + Prisma 5 + SQLite + class-validator

### 重构原则（必遵）

1. **行为优先不变**：不重写任何业务逻辑（AA 计算、费用分摊、结算算法），只移动代码、修正类型、删除重复、补类型安全。
2. **最小可验证步**：每完成一个阶段 → `npx nest build` 零错误 → `node start.js` 启动后抽测受影响接口。
3. **删优于留**：重复代码整段删除、死代码整文件删除，不注释保留。
4. **不改 API 响应结构**：所有接口的 JSON 字段名、分页格式、错误码保持与 `docs/backend-api-doc.md` 一致。

### P0 — 重构前需先修的安全回归（来自上轮 §二 审查）

`server/src/common/guards/trip-access.guard.ts` 在第 24 行将参数提取从 `req.params.tripId || req.params.id` 改为 `req.params.tripId`，且无 `tripId` 时提前放行（`return true`）。但由于 `trip.controller.ts` 中的详情、更新、删除、完成、摘要 5 个路由使用 `@Param('id')` 而非 `@Param('tripId')`，**这些路由的成员权限校验被静默绕过**：任何已登录用户都可访问任意行程详情、修改、删除，`@RequireLeader` 也失效。

**修改要求**：
- 恢复 `TripAccessGuard.canActivate` 中 tripId 的提取方式为 `req.params.tripId || req.params.id`
- 去掉无 tripId 时提前放行的逻辑：若请求中有 `:id` 参数但无 `tripId`，尝试按 id 查数据库判断是否为行程 ID，若查不到则 return true（放行非行程路由如 `/settlements/:id/settle`）
- 或者：不在 guard 层处理，改由控制器显式指定 `@UseGuards(TripAccessGuard)` 时为 detail/update/remove/complete/summary 路由注入 tripId

**验收**：
- 未登录用户访问 `/api/v1/trips/trip_001` 返回 401
- 非成员用户访问 `/api/v1/trips/trip_001` 返回权限不足
- 新路由 `POST /settlements/:id/settle` 仍能正常被非成员调用（由服务层做成员校验）

### 当前痛点（为什么要重构）

| 类别 | 位置 | 行数/处数 | 问题 |
|------|------|----------|------|
| 类型安全 | `server/src/` 9 个文件 | ~20 处 `: any` | `formatExpense(e: any)`、`formatTrip(trip: any)`、`formatVehicle(v: any)`、`toExpenseLike(e: any)` 等，IDE 无类型提示，重构无保障 |
| 编译配置 | `tsconfig.json` | `noImplicitAny: false` | 根因：`noImplicitAny` 未开，允许隐式 any 蔓延 |
| 重复代码 | `stats.service.ts` + `settlement.service.ts` | 各 1 份 `toExpenseLike`（10 行） | ExpenseLike 接口 + 转换逻辑完全相同，改分摊逻辑要改两处 |
| 潜在 bug | `trip.service.ts` | `uniqueInviteCode()` | 生成 6 位邀请码后未查数据库确认唯一性，小概率碰撞时 `create` 会因 UNIQUE 约束报 500 |
| 启动方式 | `start.js` | 1 个垫片文件 | 运行时依赖 `@/` 路径别名需 `tsconfig-paths` 注册，当前用 `start.js` 打补丁而非纳入标准启动流程 |
| 测试缺失 | AA 计算核心算法 | 0 个测试 | `aa-calculator.ts` 的 `calculateUserBalances` 和 `simplifyDebts` 是整个项目的核心逻辑，无任何单元测试 |
| 字段缺失（§二 上轮检出的 P1） | `auth.service.ts` | 登录返回 | `/api/v1/auth/wx-login` 响应中缺少接口文档规定的 `refreshToken` 字段（当前只返回 `token`）；`/api/v1/auth/me` 缺少 `phone` 字段 |

### 阶段 A — 类型安全：消灭 `any`（先做，影响面最大）

**要求**：
- 将 `server/tsconfig.json` 的 `noImplicitAny: false` 改为 `true`（若编译报错过多，可以先改 `noImplicitAny: true` 但保持 `strict: false`）
- 运行 `npx nest build`，修复所有新增类型错误
- 逐一消除服务层方法签名中的显式 `any`，替换为 Prisma 生成的类型或自定义 interface：
  - `trip.service.ts`：`formatTrip(trip: any)` → 方法重载或定义 `TripDetailResult` interface（根据 `detailInclude()` 的 include 结构精确声明返回类型）；`stripRelations(trip: any)` → 同理
  - `expense.service.ts`：`formatExpense(e: any)` → 使用 Prisma 的 `Prisma.ExpenseGetPayload<{ include: ... }>` 或自定义 interface
  - `vehicle.service.ts`：`formatVehicle(v: any)` → 同理
  - `settlement.service.ts`：`toExpenseLike(e: any)` → 同上
  - `stats.service.ts`：`toExpenseLike(e: any)` → 同上
  - `template.service.ts`：`format(t: any)` → 同上
  - `auth.service.ts`：`signTokens(..., user: any)` → `Prisma.User` 类型
- 如果某处 Prisma 生成的联合类型过于复杂（如 `include` 带来的嵌套类型），可在文件内用 `type` 别名替代，不要在全局开 `any` 豁免

**验收**：`npx nest build` 零类型错误，`noImplicitAny` 为 `true`；`rg ": any" server/src/` 结果为 0。

### 阶段 B — `toExpenseLike` 去重

**要求**：
- 新建 `server/src/utils/expense-adapter.ts`：
  - export `ExpenseLike` interface（从 `settlement.service.ts` 和 `stats.service.ts` 中提取公共定义）
  - export `toExpenseLike(e: any): ExpenseLike` 函数
- `settlement.service.ts` 和 `stats.service.ts` 删除本地的 `interface ExpenseLike` 和 `toExpenseLike` 方法，改为 `import { ExpenseLike, toExpenseLike } from '@/utils/expense-adapter'`
- 确保两文件的 `toExpenseLike` 行为一致（equal 取 splits.map userId，非 equal 取 splits 详情）

**验收**：`npx nest build` 零新增错误；结算方案计算结果与重构前一致；分类统计计算结果与重构前一致。

### 阶段 C — 邀请码唯一性校验

**要求**：
- `trip.service.ts` 的 `uniqueInviteCode()` 方法改为带唯一性校验的版本：
  - 循环生成邀请码，每次生成后用 `prisma.trip.findUnique({ where: { inviteCode } })` 检查是否存在
  - 最多尝试 10 次，若 10 次后仍碰撞则 `throwBiz(ErrorCodes.INTERNAL_ERROR, '生成邀请码失败，请重试')`
- 同时修复 `inviteCode` 生成方式与接口文档的矛盾：文档示例 `"inviteCode": "A1B2C3"` 是 6 位字母数字，当前实现正好匹配，无需改格式

**验收**：`npx nest build` 零错误；创建行程返回的 inviteCode 长度为 6 且不被空格污染。

### 阶段 D — 登录响应补充字段

**要求**：
- `auth.service.ts` 的 `wxLogin` 和 `refresh` 返回对象已包含 `refreshToken`，但需要确认接口文档：`POST /api/v1/auth/wx-login` 响应应包含 `token`、`refreshToken`、`expiresIn`、`user`。当前 `auth.service.ts` 第 51-54 行已返回这些字段，确认测试中 `refreshToken` 确实返回
- `auth.service.ts` 的 `getCurrentUser` 方法返回对象中补充 `phone` 字段（从 `user.phone` 读取，若未设置则返回 `null`），其响应结构当前缺少该字段

**验收**：
- `curl --noproxy localhost -X POST http://localhost:3000/api/v1/auth/wx-login -H "Content-Type: application/json" -d '{"code":"mock_openid_001"}' ` 返回体中包含 `refreshToken`
- `curl --noproxy localhost http://localhost:3000/api/v1/auth/me -H "Authorization: Bearer $TOKEN"` 返回体中包含 `phone` 字段

### 阶段 E — 移除 `start.js` 启动垫片（可选，不影响功能）

**要求**：
- 安装 `tsconfig-paths` 到 `dependencies`（非 devDependencies，因为运行时需要）
- 修改 `server/package.json` 的 `scripts.start`：从 `"node start.js"` 改为 `"node -r tsconfig-paths/register dist/src/main.js"`（确切的路径取决于编译产物位置）
- 确认 `tsconfig.json` 的 `outDir: "./dist"` 和 `include: ["src/**/*", "prisma/**/*.ts"]` 后，编译产物在 `dist/src/main.js`，注册路径别名后应可直接运行
- 若编译产物确实在 `dist/src/main.js`，将 `package.json` 的 `main` 也同步更新
- 删除 `server/start.js`

**验收**：`npm run build && npm run start` 正常启动，`localhost:3000/api/v1/templates` 返回正确结果。

### 阶段 F — AA 计算核心算法单元测试（可选，保障核心逻辑）

**要求**：
- 安装 Jest 和 ts-jest：`npm install -D jest @types/jest ts-jest`
- 新建 `server/src/utils/aa-calculator.spec.ts`，覆盖以下场景：

**测试用例**（源于技术文档示例）：

```typescript
// 场景 1: 技术文档示例 A:+100, B:-60, C:-40, D:+30, E:-30
// 结果应为 B→A:60, C→A:40, E→D:30 (3 笔)
test('simplifyDebts with 5 members, 2 creditors 3 debtors')

// 场景 2: 全员均摊无结余（每个人都付了等额费用）
// 结果应为空数组
test('simplifyDebts with zero balances returns []')

// 场景 3: 只有一人垫付，其余人什么都没付
// equal 分摊时，所有其他人都是债务人
test('calculateUserBalances single payer equal split')

// 场景 4: percentage 分摊模式
test('calculateUserBalances percentage split')

// 场景 5: custom 分摊模式
test('calculateUserBalances custom split')

// 场景 6: getTotalExpense 无费用返回 0
test('getTotalExpense empty array returns 0')
```

- 注册 npm script：`"test": "jest"`、`"test:watch": "jest --watch"`
- 在 `jest.config.js` 中配置 `ts-jest`：`transform: { '^.+\\.ts$': 'ts-jest' }`

**验收**：`npm test` 全部测试通过。

### 目录目标（重构后）

```
server/
  start.js                      # 删除
  jest.config.js                # 新增
  package.json                  # scripts 更新：start/test
  tsconfig.json                 # noImplicitAny: true
  src/
    utils/
      aa-calculator.ts          # 不变
      aa-calculator.spec.ts     # 新增：单元测试
      expense-adapter.ts        # 新增：ExpenseLike + toExpenseLike
    common/
      guards/
        trip-access.guard.ts    # 修复 P0 安全回归
    modules/
      auth/
        auth.service.ts         # getCurrentUser 补充 phone
      trip/
        trip.service.ts         # uniqueInviteCode 加唯一性校验
      expense/
        expense.service.ts      # 类型去 any
      settlement/
        settlement.service.ts   # 类型去 any + 去重 toExpenseLike
      stats/
        stats.service.ts        # 去重 toExpenseLike
      vehicle/
        vehicle.service.ts      # 类型去 any
      template/
        template.service.ts     # 类型去 any
```

### 不要做的事

- 不要改任何业务逻辑（AA 计算、费用分摊、结算算法、油费补贴计算公式）
- 不要改 API 路由路径（已修复过的 `/settlements/:id/settle` 保持不动）
- 不要改 Prisma schema 和数据库表结构
- 不要引入新依赖（阶段 E/F 引入的 `tsconfig-paths`、Jest 除外）
- 不要动 `.env` 和 `prisma/seed.ts`
- 不要动前端项目代码
- 不要为"将来可能加"的抽象层次提前提取 interface

### 验收清单

| 项 | 命令 / 动作 | 期望 |
|----|-------------|------|
| 类型检查 | `npx nest build` | 零错误 |
| 安全回归 | 非成员访问 `GET /api/v1/trips/trip_001` | 返回权限不足 |
| 安全回归 | 未登录访问 `GET /api/v1/trips/trip_001` | 返回 401 |
| 安全回归 | `POST /settlements/plan.../settle` | 仍可正常调用 |
| 无 any | `rg ": any" server/src/` | 0 个匹配 |
| noImplicitAny | `tsconfig.json` | `noImplicitAny: true` |
| 去重 | `rg "interface ExpenseLike" server/src/` | 仅 `expense-adapter.ts` 1 处 |
| 邀请码 | 创建行程 → 返回的 `inviteCode` | 6 位字母数字，不重复 |
| 登录字段 | `POST /auth/wx-login` 响应 | 含 `refreshToken` |
| auth/me 字段 | `GET /auth/me` 响应 | 含 `phone` 字段 |
| 启动方式 | `rm start.js && npm run build && npm run start` | 服务正常启动 |
| 单元测试 | `npm test` | 全部通过 |
| 文档 | `docs/REFACTOR_LOG.md` | 新建，记录模块划分与删除项 |

### 工作方式

1. **顺序**：P0 安全修复 → A → B → C → D → (E 可选) → (F 可选)；每阶段结束 `npx nest build` 一次
2. **阶段内拆小步**：如阶段 A 逐个文件去 `any`，每改一个跑一次编译
3. **先读再改**：逐个读取待改文件全文后再动手，不要凭印象改
4. 总结格式：**已重构模块 / 未动模块 / 注意事项**

## Agent 提示词（复制到这里结束）

# Bug 修复提示词（前端 · 前后端对齐）

> 复制下方 **「Agent 提示词」** 整段到 Cursor Agent。
> 来源：前后端 8 项差异对齐轮次的 `/不满意原因` 审查（§二）。
> 目标：修复 **4 个 P0（联调阻断）+ 1 个 P1（角色展示）**；每阶段结束 `npx tsc --noEmit` 零错误。

---

## 项目路径

前端代码：`/Users/ext.feixuan3/Desktop/solo/pro_26`
接口文档：`docs/backend-api-doc.md`
技术文档：`docs/backend-tech-doc.md`

---

## Agent 提示词（复制从这里开始）

**项目路径**：`/Users/ext.feixuan3/Desktop/solo/pro_26`
**栈**：Taro 3 + React + TypeScript + Zustand；请求层已有 `src/services/request.ts` 与各模块 API 封装

### 修复原则

1. **只补缺口**：类型、nickname、participants 对象化、inviteCode 字段、request 解包与 Bearer 注入——本轮 diff 已落地，**勿重复改**。
2. **最小可验证步**：每修一个 P0 → `npx tsc --noEmit` → 确认相关页面/Store 已 import 并调用 services。
3. **行为按接口文档**：以 `docs/backend-api-doc.md` 为准；mock 可保留作离线兜底，但主路径必须走 API。

### 已完成（勿重复改）

- `User.name` → `nickname` 全链路迁移
- `Expense.participants` 改为 `Participant[]`（含 splitAmount）
- `Trip.inviteCode` 类型与 mock 已补
- `ApiResponse` 类型 + `request.ts` 统一解包 / token 注入 / 401 刷新
- `src/services/` 下 auth、trip、expense、member、vehicle 等模块文件已存在

---

## P0 — 联调阻断

### 1.1 请求层与业务完全未接通

**影响路径**：首页列表、行程详情、记一笔、同伴管理、车辆管理等所有读写

**文件**：
- `src/store/useTripStore.ts`
- `src/pages/home/index.tsx`
- `src/pages/trip-detail/index.tsx`
- 其他仍只读 `mockTrips` / 只调 store 同步方法的页面

**问题**：
已新增完整 `src/services/`，但全项目 **零处** `import '@/services/...'`。应用仍 100% 走 Zustand + mock，响应解包、Bearer 认证、分模块接口对齐全部停留在「文件在、没人用」，联后端时行为与改造前无异。

**修改要求**：
- 在 `useTripStore`（或独立 `tripApi` 适配层）中，为 **列表拉取、创建、更新、删除** 等核心动作接入对应 service（如 `listTrips`、`createTrip`、`createExpense` 等）。
- 页面继续通过 store 消费数据，但 store 的 **数据来源改为 API 返回**，mock 仅作 `BASE_URL` 不可用时的 fallback（可选）。
- 登录成功后调用 `auth` 模块写入 token（`setToken`），后续请求自动带 Bearer。

**验收**：
- `grep -r "from '@/services" src/` 至少命中 store 或页面中的实际调用
- 启动后端 + 前端 H5 后，首页行程列表来自 `GET /trips`，而非仅 mockTrips 静态数据

---

### 1.2 行程详情仍一次读取嵌套 Trip，未多接口聚合

**影响路径**：`pages/trip-detail/index`

**文件**：
- `src/pages/trip-detail/index.tsx`（当前 `trips.find` 取完整嵌套对象）
- `src/services/trip.ts`、`expense.ts`、`member.ts`、`stats.ts`

**问题**：
后端契约为各模块独立接口、靠 `tripId` 关联；提示词要求「详情页改为多接口聚合拉取」。当前详情页仍从本地 store 一次取出含 members/expenses/days 的嵌套 Trip，与后端拆分模型不一致，也无法展示接口返回的 `stats.avgPerPerson` 等汇总字段。

**修改要求**：
- 详情页进入时（或 store 的 `loadTripDetail(tripId)`）并行/串行调用：
  - `getTripDetail(id)` — 行程基本信息
  - `listMembers` / 成员接口 — 同伴列表
  - `listExpenses` 或 trip 下费用列表 — 费用
  - `getTripSummary` — 总花费、人均等统计（若文档有）
- 在页面或 store 内 **聚合** 为展示所需结构，不要假设一次接口返回全部嵌套数据。
- 加载态与错误态需有基本提示（Toast 或占位文案）。

**验收**：
- 详情页源码中可见对 **≥2 个** 不同 service 方法的调用
- 网络面板中进入详情页会发出多个 `/api/v1/...` 请求，而非只读本地 mock

---

### 1.3 新建实体仍本地 generateId，未用后端 UUID

**影响路径**：创建行程、记一笔、加同伴、加车辆、活动记录

**文件**：
- `src/store/useTripStore.ts`（`addTrip`、`addExpense`、`addMember`、`addVehicle`、`addActivity` 均 `generateId()`）

**问题**：
提示词要求改为「乐观更新 + 用返回 id 替换」或直接用后端 id。当前所有写操作仍在 store 内本地造 id，与后端 UUID 不一致；一旦接入 API，会出现 id 冲突、后续 PUT/DELETE 404。

**修改要求**：
- 写操作先调对应 API（如 `createExpense`），**以响应中的 `id` 写入 store**。
- 若需乐观 UI：可先用临时 id 展示，API 成功后 **替换** 为服务端 id（更新 trips/expenses 数组中的引用）。
- `generateId()` 仅允许留在纯 mock/fallback 分支；主路径不得再写入持久 id。

**验收**：
- `addExpense` / `addTrip` 主路径不再调用 `generateId()` 作为最终 id（mock fallback 除外）
- 创建费用后，store 中该条 `expense.id` 与接口响应 `data.id` 一致

---

### 1.4 认证/token 未接入登录流程

**影响路径**：首次打开、需要登录的操作

**文件**：
- `src/services/auth.ts`
- `src/services/request.ts`
- 登录入口页面（若无则最小实现：启动时 wx login 或 mock login 调 `POST /auth/login`）

**问题**：
`request.ts` 已实现 token 存储与 Header 注入，但没有任何页面或 app 启动逻辑调用 `auth.login` / `setToken`。联调时除 `skipAuth` 接口外一律 401。

**修改要求**：
- 在 app 启动或用户进入需登录页时，调用登录接口并 `setToken` / `setRefreshToken`。
- 401 且 refresh 失败时，清 token 并引导重新登录（已有 toast 可保留）。

**验收**：
- 登录成功后 `Taro.getStorageSync('access_token')` 非空
- 带鉴权的 `GET /trips` 返回 200 而非 401

---

## P1 — 角色字段未完整迁移

### 2.1 队长判断仍依赖 leaderId，role 仅为兼容

**影响路径**：行程详情、行程卡片、同伴列表的「队长」角标

**文件**：
- `src/pages/trip-detail/index.tsx`（`member.id === trip.leaderId`）
- `src/components/TripCard/index.tsx`
- `src/pages/members/index.tsx`（`isLeader = member.id === leaderId` 为主）

**问题**：
类型已加 `User.role`，但 UI 仍以 `trip.leaderId` 比对为主，`role === 'leader'` 只是 members 页兜底。后端若以 `member.role` 为准同步，可能出现 leaderId 与 role 不一致时展示错误。

**修改要求**：
- 展示「队长」统一用 `member.role === 'leader'`（或封装 `isTripLeader(member)`）。
- `leaderId` 可保留在 Trip 类型上供 API 使用，但 **UI 不再单独依赖 id 比对**。
- mock 数据中 leader 的 `role: 'leader'` 与 `leaderId` 保持一致。

**验收**：
- 详情页、TripCard、members 页队长角标逻辑统一基于 `role`
- `npx tsc --noEmit` 通过

---

### 验收清单

| # | 验证项 | 命令 / 动作 | 期望 |
|---|--------|-------------|------|
| 1 | 类型检查 | `npx tsc --noEmit` | 零错误 |
| 2 | services 已接入 | `grep -r "@/services" src/store src/pages` | 有实际 import 与调用 |
| 3 | 详情多接口 | 打开行程详情 + 看 Network | ≥2 个不同 API 请求 |
| 4 | 创建 id | 记一笔后对比响应 | store id === 接口 `data.id` |
| 5 | Token | 登录后查 storage | `access_token` 存在 |
| 6 | 队长展示 | 成员列表 | 仅 `role==='leader'` 显示队长标 |

### 工作方式

1. **顺序**：P0-1.4 登录/token → P0-1.1 Store 接 API → P0-1.2 详情聚合 → P0-1.3 UUID → P1-2.1 role
2. **每步最小 diff**：只改本轮缺口文件，不重写已对齐的类型与 nickname
3. **总结格式**：**已修复 / 未修复 / 需本地联调确认项**（后端需 `npm run start:dev` 在 `server/`）

## Agent 提示词（复制到这里结束）

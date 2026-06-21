# 旅行拼车 AA 后端技术文档

## 1. 项目概述

### 1.1 项目简介

旅行拼车 AA 是一款面向结伴出行人群的费用分摊记账小程序。用户可以创建行程、邀请同伴、记录各类消费，并通过智能算法自动计算每个人的应付/应收金额，生成最优结算方案。

### 1.2 核心功能

- **行程管理**：创建、编辑、查询行程，支持行程模板快速创建
- **成员管理**：多种方式邀请同伴加入行程（扫码、分享链接、手动添加）
- **费用记账**：支持多类别费用记录，多种分摊方式（均摊、按比例、自定义）
- **车辆管理**：车辆信息维护，油费补贴专项录入
- **AA 结算**：智能债务简化算法，生成最优结算方案
- **统计分析**：分类消费统计、个人账单、可视化图表
- **活动动态**：行程内操作记录与时间线

### 1.3 技术栈选型

| 类别 | 技术选型 | 说明 |
|------|---------|------|
| 开发语言 | Node.js + TypeScript | 类型安全，与前端技术栈统一 |
| Web 框架 | Nest.js | 企业级 Node.js 框架，模块化架构 |
| 数据库 | PostgreSQL 15 | 关系型数据库，支持复杂查询和事务 |
| ORM | Prisma | 类型安全的数据库访问层 |
| 缓存 | Redis 7 | 会话管理、热点数据缓存、限流 |
| 认证 | JWT + 微信登录 | 小程序端微信授权登录 |
| 文件存储 | 阿里云 OSS | 小票照片等文件存储 |
| API 风格 | RESTful API | 标准化接口设计 |
| 部署 | Docker + Kubernetes | 容器化部署，弹性扩缩 |

---

## 2. 系统架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                      客户端层                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ 微信小程序│  │  H5 页面  │  │ 支付宝小程序│  │  App   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                      网关层                               │
│                   Nginx / SLB                            │
│              负载均衡、SSL 终止、限流                     │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    应用服务层                             │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Nest.js 应用服务                     │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐        │    │
│  │  │ 用户模块  │ │ 行程模块  │ │ 费用模块  │ ...    │    │
│  │  └──────────┘ └──────────┘ └──────────┘        │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
┌───────────────────┐                   ┌───────────────────┐
│    PostgreSQL     │                   │      Redis        │
│   主从复制 +      │                   │   缓存 + 会话     │
│   读写分离        │                   │                   │
└───────────────────┘                   └───────────────────┘
          │                                       │
          ▼                                       ▼
┌───────────────────┐                   ┌───────────────────┐
│    阿里云 OSS     │                   │   微信开放平台     │
│   文件存储         │                   │   登录/支付        │
└───────────────────┘                   └───────────────────┘
```

### 2.2 模块划分

| 模块 | 职责 | 核心功能 |
|------|------|---------|
| auth | 认证授权 | 微信登录、JWT 签发、令牌刷新、权限校验 |
| user | 用户管理 | 用户信息、头像、昵称管理 |
| trip | 行程管理 | 行程 CRUD、行程状态、行程模板 |
| member | 成员管理 | 成员邀请、加入、移除、角色管理 |
| expense | 费用管理 | 费用 CRUD、分类、分摊计算 |
| vehicle | 车辆管理 | 车辆信息、油费补贴 |
| settlement | 结算管理 | 债务简化、结算记录、结清标记 |
| stats | 统计分析 | 分类统计、个人账单、数据汇总 |
| activity | 活动动态 | 操作记录、时间线 |
| file | 文件管理 | 图片上传、文件存储 |

### 2.3 目录结构

```
src/
├── common/                  # 公共模块
│   ├── decorators/          # 装饰器
│   ├── guards/              # 守卫
│   ├── interceptors/        # 拦截器
│   ├── pipes/               # 管道
│   └── filters/             # 过滤器
├── config/                  # 配置模块
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── jwt.config.ts
├── modules/                 # 业务模块
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   └── guards/
│   ├── user/
│   ├── trip/
│   ├── member/
│   ├── expense/
│   ├── vehicle/
│   ├── settlement/
│   ├── stats/
│   ├── activity/
│   └── file/
├── prisma/                  # 数据库
│   ├── schema.prisma
│   └── migrations/
├── utils/                   # 工具函数
│   ├── aa-calculator.ts     # AA 计算逻辑
│   └── ...
└── main.ts                  # 应用入口
```

---

## 3. 数据库设计

### 3.1 ER 图

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │    Trip     │       │ TripMember  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──┐   │ id (PK)     │───►   │ id (PK)     │
│ openid      │   │   │ title       │       │ trip_id (FK)│
│ nickname    │   │   │ destination │       │ user_id (FK)│
│ avatar      │   │   │ start_date  │       │ role        │
│ created_at  │   │   │ end_date    │       │ joined_at   │
│ updated_at  │   │   │ leader_id   │◄──┐   │ status      │
└─────────────┘   │   │ status      │   │   └─────────────┘
                  │   │ template_id │   │
                  │   │ created_at  │   │
                  │   └─────────────┘   │
                  │         ▲           │
                  │         │           │
        ┌─────────┴───┐     │    ┌─────┴──────────┐
        │   Expense    │     │    │ TripTemplate   │
        ├──────────────┤     │    ├────────────────┤
        │ id (PK)      │     │    │ id (PK)        │
        │ trip_id (FK) ├─────┘    │ name           │
        │ amount       │          │ description    │
        │ category     │          │ cover          │
        │ description  │          │ estimated_days │
        │ payer_id     │───┐      │ budget         │
        │ split_type   │   │      │ categories     │
        │ currency     │   │      │ tags           │
        │ exchange_rate│   │      │ sample_days    │
        │ note         │   │      └────────────────┘
        │ receipt_url  │   │
        │ created_by   │───┤
        │ created_at   │   │
        └──────────────┘   │
                  │        │
        ┌───────▼──────┐  │
        │ ExpenseSplit │  │
        ├──────────────┤  │
        │ id (PK)      │  │
        │ expense_id(FK)│ │
        │ user_id (FK) ├──┘
        │ amount       │
        │ percentage   │
        └──────────────┘

┌─────────────┐       ┌─────────────┐
│   Vehicle   │       │ Settlement  │
├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │
│ trip_id (FK)│       │ trip_id (FK)│
│ plate_number│       │ from_user_id│───┐
│ model       │       │ to_user_id  │───┤
│ capacity    │       │ amount      │   │
│ fuel_consum │       │ status      │   │
│ owner_id    │───┐   │ settled_at  │   │
│ created_at  │   │   │ created_at  │   │
└─────────────┘   │   └─────────────┘   │
                  │                      │
        ┌─────────▼─────┐      ┌───────▼──────┐
        │ FuelSubsidy   │      │   Activity   │
        ├───────────────┤      ├──────────────┤
        │ id (PK)       │      │ id (PK)      │
        │ trip_id (FK)  │      │ trip_id (FK) │
        │ vehicle_id(FK)│      │ user_id (FK) │
        │ fuel_amount   │      │ type         │
        │ fuel_price    │      │ content      │
        │ total_amount  │      │ amount       │
        │ is_split      │      │ created_at   │
        │ note          │      └──────────────┘
        │ created_at    │
        └───────────────┘
```

### 3.2 数据表设计

#### 3.2.1 用户表 (users)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 用户 ID |
| openid | VARCHAR(64) | UNIQUE | 微信 openid |
| unionid | VARCHAR(64) | NULL | 微信 unionid |
| nickname | VARCHAR(64) | NOT NULL | 昵称 |
| avatar | VARCHAR(255) | NULL | 头像 URL |
| phone | VARCHAR(20) | NULL | 手机号 |
| status | SMALLINT | DEFAULT 1 | 状态：1-正常，0-禁用 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

#### 3.2.2 行程表 (trips)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 行程 ID |
| title | VARCHAR(100) | NOT NULL | 行程标题 |
| destination | VARCHAR(100) | NOT NULL | 目的地 |
| start_date | DATE | NOT NULL | 开始日期 |
| end_date | DATE | NOT NULL | 结束日期 |
| leader_id | UUID | FK | 队长用户 ID |
| status | VARCHAR(20) | DEFAULT 'active' | 状态：active/completed |
| template_id | UUID | NULL | 关联模板 ID |
| invite_code | VARCHAR(10) | UNIQUE | 邀请码 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_trips_leader_id` - leader_id
- `idx_trips_status` - status
- `idx_trips_invite_code` - invite_code

#### 3.2.3 行程成员表 (trip_members)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 记录 ID |
| trip_id | UUID | FK | 行程 ID |
| user_id | UUID | FK | 用户 ID |
| role | VARCHAR(20) | DEFAULT 'member' | 角色：leader/member |
| status | VARCHAR(20) | DEFAULT 'active' | 状态：active/left |
| joined_at | TIMESTAMP | DEFAULT NOW() | 加入时间 |

**索引：**
- `uk_trip_user` - (trip_id, user_id) UNIQUE
- `idx_trip_members_trip_id` - trip_id
- `idx_trip_members_user_id` - user_id

#### 3.2.4 费用表 (expenses)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 费用 ID |
| trip_id | UUID | FK | 行程 ID |
| amount | DECIMAL(10,2) | NOT NULL | 金额（人民币） |
| category | VARCHAR(20) | NOT NULL | 类别 |
| description | VARCHAR(200) | NOT NULL | 描述 |
| payer_id | UUID | FK | 付款人 ID |
| split_type | VARCHAR(20) | DEFAULT 'equal' | 分摊方式：equal/percentage/custom |
| currency | VARCHAR(10) | DEFAULT 'CNY' | 币种 |
| exchange_rate | DECIMAL(10,4) | DEFAULT 1 | 汇率 |
| original_amount | DECIMAL(10,2) | NULL | 原币种金额 |
| note | TEXT | NULL | 备注 |
| receipt_url | VARCHAR(255) | NULL | 小票照片 URL |
| created_by | UUID | FK | 创建人 ID |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_expenses_trip_id` - trip_id
- `idx_expenses_payer_id` - payer_id
- `idx_expenses_category` - category
- `idx_expenses_created_at` - created_at

#### 3.2.5 费用分摊明细表 (expense_splits)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 明细 ID |
| expense_id | UUID | FK | 费用 ID |
| user_id | UUID | FK | 用户 ID |
| amount | DECIMAL(10,2) | NOT NULL | 分摊金额 |
| percentage | DECIMAL(5,2) | NULL | 分摊比例 |

**索引：**
- `idx_expense_splits_expense_id` - expense_id
- `idx_expense_splits_user_id` - user_id

#### 3.2.6 车辆表 (vehicles)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 车辆 ID |
| trip_id | UUID | FK | 行程 ID |
| plate_number | VARCHAR(20) | NULL | 车牌号 |
| model | VARCHAR(50) | NOT NULL | 车型 |
| capacity | SMALLINT | DEFAULT 5 | 承载人数 |
| fuel_consumption | DECIMAL(5,1) | NULL | 百公里油耗(L) |
| owner_id | UUID | FK | 车主用户 ID |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_vehicles_trip_id` - trip_id
- `idx_vehicles_owner_id` - owner_id

#### 3.2.7 油费补贴表 (fuel_subsidies)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 记录 ID |
| trip_id | UUID | FK | 行程 ID |
| vehicle_id | UUID | FK | 车辆 ID |
| fuel_date | DATE | NOT NULL | 加油日期 |
| fuel_amount | DECIMAL(6,2) | NOT NULL | 加油量(升) |
| fuel_price | DECIMAL(5,2) | NOT NULL | 油价(元/升) |
| total_amount | DECIMAL(10,2) | NOT NULL | 总金额 |
| is_split | BOOLEAN | DEFAULT TRUE | 是否分摊 |
| expense_id | UUID | NULL | 关联费用记录 ID |
| note | TEXT | NULL | 备注 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

**索引：**
- `idx_fuel_subsidies_trip_id` - trip_id
- `idx_fuel_subsidies_vehicle_id` - vehicle_id

#### 3.2.8 结算记录表 (settlements)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 结算 ID |
| trip_id | UUID | FK | 行程 ID |
| from_user_id | UUID | FK | 付款方用户 ID |
| to_user_id | UUID | FK | 收款方用户 ID |
| amount | DECIMAL(10,2) | NOT NULL | 金额 |
| status | VARCHAR(20) | DEFAULT 'pending' | 状态：pending/settled |
| settled_at | TIMESTAMP | NULL | 结清时间 |
| settled_by | UUID | NULL | 操作人 ID |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

**索引：**
- `idx_settlements_trip_id` - trip_id
- `idx_settlements_from_user` - from_user_id
- `idx_settlements_to_user` - to_user_id
- `idx_settlements_status` - status

#### 3.2.9 行程模板表 (trip_templates)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 模板 ID |
| name | VARCHAR(50) | NOT NULL | 模板名称 |
| description | VARCHAR(200) | NULL | 描述 |
| cover | VARCHAR(255) | NULL | 封面图 URL |
| estimated_days | SMALLINT | NOT NULL | 预计天数 |
| estimated_budget | DECIMAL(10,2) | NULL | 预计预算/人 |
| categories | JSONB | NULL | 推荐类别列表 |
| tags | JSONB | NULL | 标签列表 |
| sample_days | JSONB | NULL | 示例行程日 |
| is_public | BOOLEAN | DEFAULT TRUE | 是否公开 |
| created_by | UUID | NULL | 创建者 ID |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

**索引：**
- `idx_trip_templates_is_public` - is_public

#### 3.2.10 活动动态表 (activities)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 动态 ID |
| trip_id | UUID | FK | 行程 ID |
| user_id | UUID | FK | 操作用户 ID |
| type | VARCHAR(20) | NOT NULL | 类型：expense/member_join/settle |
| content | VARCHAR(255) | NOT NULL | 内容描述 |
| amount | DECIMAL(10,2) | NULL | 关联金额 |
| metadata | JSONB | NULL | 附加数据 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

**索引：**
- `idx_activities_trip_id` - trip_id
- `idx_activities_created_at` - created_at

#### 3.2.11 行程日程表 (trip_day_plans)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 日程 ID |
| trip_id | UUID | FK | 行程 ID |
| day | SMALLINT | NOT NULL | 第几天 |
| date | DATE | NULL | 日期 |
| destination | VARCHAR(100) | NOT NULL | 目的地 |
| description | VARCHAR(500) | NULL | 描述 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_trip_day_plans_trip_id` - trip_id
- `uk_trip_day` - (trip_id, day) UNIQUE

---

## 4. 核心业务逻辑

### 4.1 AA 计算算法

#### 4.1.1 用户余额计算

**计算逻辑：**
1. 遍历所有费用记录
2. 对每个付款人，累加其垫付金额（paid）
3. 对每个参与人，根据分摊方式计算其应付金额（shouldPay）
4. 余额 = 垫付金额 - 应付金额
   - 余额 > 0：应收款（债权人）
   - 余额 < 0：应付款（债务人）

#### 4.1.2 债务简化算法

**算法思想：贪心算法**

1. 将所有用户分为两组：债务人（余额 < 0）和债权人（余额 > 0）
2. 按金额从大到小分别排序
3. 使用双指针，每次取最大的债务人和最大的债权人进行匹配
4. 转账金额为两者中的较小值
5. 重复直到所有债务结清

**时间复杂度：** O(n log n) —— 主要来自排序

**示例：**
```
用户余额：A: +100, B: -60, C: -40, D: +30, E: -30

排序后：
  债权人：A(100), D(30)
  债务人：B(60), C(40), E(30)

匹配过程：
  B → A: 60  (A: 40, B: 0)
  C → A: 40  (A: 0, C: 0)
  E → D: 30  (D: 0, E: 0)

最优转账方案：3 笔交易
```

### 4.2 权限控制模型

采用 **行程级 RBAC** 模型：

**角色：**
- **队长 (leader)**：行程创建者，拥有全部权限
- **成员 (member)**：普通成员，可记账、查看等

**权限矩阵：**

| 操作 | 队长 | 成员 |
|------|------|------|
| 查看行程信息 | ✓ | ✓ |
| 编辑行程信息 | ✓ | ✗ |
| 删除行程 | ✓ | ✗ |
| 添加成员 | ✓ | ✓ |
| 移除成员 | ✓ | ✗ |
| 添加费用 | ✓ | ✓ |
| 编辑/删除费用 | ✓ | 仅自己创建的 |
| 车辆管理 | ✓ | ✓ |
| 标记结算 | ✓ | ✓（仅涉及自己的） |
| 查看统计 | ✓ | ✓ |

### 4.3 邀请机制

支持三种邀请方式：

1. **邀请码**：生成 6 位数字邀请码，用户输入加入
2. **小程序码**：生成带参数的小程序码，扫码加入
3. **分享链接**：生成 H5 分享链接，点击后跳转小程序

**加入流程：**
1. 用户通过邀请方式进入
2. 校验邀请码/参数有效性
3. 校验行程是否存在、是否已满员
4. 用户确认加入
5. 创建成员记录，发布加入动态

---

## 5. 接口规范

### 5.1 通用响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "timestamp": 1719235200000
}
```

- `code`: 业务状态码，0 表示成功
- `message`: 状态描述
- `data`: 响应数据
- `timestamp`: 服务器时间戳

### 5.2 分页格式

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

### 5.3 错误码规范

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 10001 | 参数错误 |
| 10002 | 未授权 |
| 10003 | 令牌过期 |
| 10004 | 权限不足 |
| 20001 | 用户不存在 |
| 20002 | 行程不存在 |
| 20003 | 费用记录不存在 |
| 20004 | 车辆不存在 |
| 30001 | 邀请码无效 |
| 30002 | 行程已满员 |
| 40001 | 文件上传失败 |
| 50000 | 服务器内部错误 |

---

## 6. 非功能设计

### 6.1 安全设计

| 安全维度 | 措施 |
|----------|------|
| 认证 | JWT + 微信登录，令牌过期时间 7 天，支持刷新 |
| 授权 | 基于角色的访问控制，行程级数据隔离 |
| 数据传输 | HTTPS 加密传输 |
| SQL 注入 | 使用 Prisma ORM 参数化查询 |
| XSS 防护 | 输入校验 + 输出转义 |
| 接口限流 | 基于 Redis 的令牌桶算法，限制单用户请求频率 |
| 敏感数据 | 手机号等敏感字段加密存储 |

### 6.2 性能设计

| 优化点 | 方案 |
|--------|------|
| 数据库 | 合理索引设计，读写分离，慢查询监控 |
| 缓存 | Redis 缓存热点数据（用户信息、行程详情） |
| CDN | 静态资源、图片走 CDN |
| 分页 | 列表接口统一分页，避免大数据量查询 |
| 异步 | 文件上传、消息通知等异步处理 |

### 6.3 可用性设计

| 维度 | 方案 |
|------|------|
| 高可用 | 多实例部署，负载均衡 |
| 数据库 | 主从复制，自动故障转移 |
| 监控 | 应用性能监控、错误告警 |
| 日志 | 结构化日志，集中收集分析 |
| 容灾 | 定期数据备份，异地灾备 |

---

## 7. 部署架构

### 7.1 开发环境
- 本地 Docker Compose 一键启动（PostgreSQL + Redis + App）

### 7.2 生产环境
- Kubernetes 集群部署
- 蓝绿发布 / 滚动更新
- 自动扩缩容（基于 CPU/内存使用率）

---

## 8. 开发规范

### 8.1 代码规范
- ESLint + Prettier 代码格式化
- TypeScript 严格模式
- 命名规范：驼峰命名，接口前缀 I，类使用 PascalCase

### 8.2 提交规范
- 遵循 Conventional Commits 规范
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- refactor: 重构
- test: 测试相关

### 8.3 测试策略
- 单元测试：核心业务逻辑（AA 计算等）
- 集成测试：API 接口测试
- E2E 测试：核心流程测试
- 测试覆盖率目标：> 70%

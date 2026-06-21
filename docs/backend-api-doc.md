# 旅行拼车 AA 后端接口文档

## 文档信息

| 项目 | 说明 |
|------|------|
| 接口名称 | 旅行拼车 AA API |
| 版本 | v1.0 |
| 基础路径 | `/api/v1` |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |
| 认证方式 | Bearer Token (JWT) |

---

## 通用说明

### 1. 请求头

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Content-Type | string | 是 | application/json |
| Authorization | string | 否 | Bearer {token}，需要登录的接口必填 |

### 2. 响应格式

**成功响应：**

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "timestamp": 1719235200000
}
```

**分页响应：**

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
  },
  "timestamp": 1719235200000
}
```

**错误响应：**

```json
{
  "code": 10001,
  "message": "参数错误",
  "data": null,
  "timestamp": 1719235200000
}
```

### 3. 错误码表

| 错误码 | 说明 | HTTP 状态码 |
|--------|------|------------|
| 0 | 成功 | 200 |
| 10001 | 参数错误 | 400 |
| 10002 | 未授权 | 401 |
| 10003 | 令牌过期 | 401 |
| 10004 | 权限不足 | 403 |
| 10005 | 资源不存在 | 404 |
| 20001 | 用户不存在 | 404 |
| 20002 | 行程不存在 | 404 |
| 20003 | 费用记录不存在 | 404 |
| 20004 | 车辆不存在 | 404 |
| 20005 | 成员不存在 | 404 |
| 30001 | 邀请码无效 | 400 |
| 30002 | 行程已满员 | 400 |
| 30003 | 已是行程成员 | 400 |
| 40001 | 文件上传失败 | 500 |
| 40002 | 文件格式不支持 | 400 |
| 40003 | 文件大小超限 | 400 |
| 50000 | 服务器内部错误 | 500 |

### 4. 费用类别枚举

| 值 | 说明 | 中文 |
|----|------|------|
| food | 餐饮 | 餐饮 |
| hotel | 住宿 | 住宿 |
| transport | 交通 | 交通 |
| ticket | 门票 | 门票 |
| fuel | 油费 | 油费 |
| toll | 过路费 | 过路费 |
| parking | 停车费 | 停车费 |
| other | 其他 | 其他 |

### 5. 分摊方式枚举

| 值 | 说明 |
|----|------|
| equal | 均摊 |
| percentage | 按比例分摊 |
| custom | 自定义金额 |

### 6. 行程状态枚举

| 值 | 说明 |
|----|------|
| active | 进行中 |
| completed | 已完成 |

### 7. 成员角色枚举

| 值 | 说明 |
|----|------|
| leader | 队长 |
| member | 成员 |

---

## 一、认证模块

### 1.1 微信登录

**接口地址：** `POST /api/v1/auth/wx-login`

**说明：** 小程序端使用 wx.login 获取的 code 进行登录，返回用户信息和令牌。

**请求参数：**

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 微信登录 code |

**请求示例：**

```json
{
  "code": "0a1b2c3d4e5f6g7h8i9j"
}
```

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| token | string | 访问令牌 |
| refreshToken | string | 刷新令牌 |
| expiresIn | number | 过期时间（秒） |
| user | object | 用户信息 |

**user 对象：**

| 名称 | 类型 | 说明 |
|------|------|------|
| id | string | 用户 ID |
| nickname | string | 昵称 |
| avatar | string | 头像 URL |

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800,
    "user": {
      "id": "user_001",
      "nickname": "小明",
      "avatar": "https://example.com/avatar.jpg"
    }
  },
  "timestamp": 1719235200000
}
```

---

### 1.2 刷新令牌

**接口地址：** `POST /api/v1/auth/refresh`

**说明：** 使用刷新令牌获取新的访问令牌。

**请求参数：**

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| refreshToken | string | 是 | 刷新令牌 |

**响应参数：** 同微信登录

---

### 1.3 获取当前用户信息

**接口地址：** `GET /api/v1/auth/me`

**说明：** 获取当前登录用户的详细信息。

**需要登录：** 是

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| id | string | 用户 ID |
| openid | string | 微信 openid |
| nickname | string | 昵称 |
| avatar | string | 头像 URL |
| phone | string | 手机号（脱敏） |
| createdAt | number | 创建时间戳 |

---

### 1.4 更新用户信息

**接口地址：** `PUT /api/v1/auth/profile`

**说明：** 更新当前用户的昵称、头像等信息。

**需要登录：** 是

**请求参数：**

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 否 | 昵称 |
| avatar | string | 否 | 头像 URL |

---

## 二、用户模块

### 2.1 获取用户详情

**接口地址：** `GET /api/v1/users/:id`

**说明：** 根据用户 ID 获取用户信息。

**需要登录：** 是

**路径参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| id | string | 用户 ID |

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| id | string | 用户 ID |
| nickname | string | 昵称 |
| avatar | string | 头像 URL |

---

### 2.2 批量获取用户信息

**接口地址：** `POST /api/v1/users/batch`

**说明：** 根据用户 ID 列表批量获取用户信息。

**需要登录：** 是

**请求参数：**

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userIds | string[] | 是 | 用户 ID 列表 |

---

## 三、行程模块

### 3.1 创建行程

**接口地址：** `POST /api/v1/trips`

**说明：** 创建一个新的行程。

**需要登录：** 是

**请求参数：**

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 行程标题，最大 100 字符 |
| destination | string | 是 | 目的地，最大 100 字符 |
| startDate | string | 是 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 是 | 结束日期，格式：YYYY-MM-DD |
| templateId | string | 否 | 关联模板 ID |
| days | array | 否 | 行程日程列表 |

**days 对象：**

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| day | number | 是 | 第几天 |
| date | string | 否 | 日期 |
| destination | string | 是 | 目的地 |
| description | string | 否 | 描述 |

**响应参数：** 完整的行程信息

**请求示例：**

```json
{
  "title": "川西自驾之旅",
  "destination": "川西环线",
  "startDate": "2024-07-15",
  "endDate": "2024-07-19",
  "templateId": "template_chuanxi",
  "days": [
    {
      "day": 1,
      "date": "2024-07-15",
      "destination": "成都",
      "description": "集合出发"
    },
    {
      "day": 2,
      "date": "2024-07-16",
      "destination": "康定",
      "description": "翻越折多山"
    }
  ]
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "trip_001",
    "title": "川西自驾之旅",
    "destination": "川西环线",
    "startDate": "2024-07-15",
    "endDate": "2024-07-19",
    "leaderId": "user_001",
    "status": "active",
    "templateId": "template_chuanxi",
    "inviteCode": "A1B2C3",
    "createdAt": 1719235200000,
    "updatedAt": 1719235200000,
    "leader": {
      "id": "user_001",
      "nickname": "小明",
      "avatar": "https://example.com/avatar.jpg"
    },
    "members": [
      {
        "id": "user_001",
        "nickname": "小明",
        "avatar": "https://example.com/avatar.jpg",
        "role": "leader"
      }
    ],
    "days": [
      {
        "id": "day_001",
        "day": 1,
        "date": "2024-07-15",
        "destination": "成都",
        "description": "集合出发"
      }
    ]
  },
  "timestamp": 1719235200000
}
```

---

### 3.2 获取行程列表

**接口地址：** `GET /api/v1/trips`

**说明：** 获取当前用户的行程列表。

**需要登录：** 是

**查询参数：**

| 名称 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| status | string | 否 | - | 行程状态：active/completed |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |

**响应参数：** 分页格式，list 中为行程简要信息

---

### 3.3 获取行程详情

**接口地址：** `GET /api/v1/trips/:id`

**说明：** 获取单个行程的详细信息。

**需要登录：** 是（需为行程成员）

**路径参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| id | string | 行程 ID |

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| id | string | 行程 ID |
| title | string | 标题 |
| destination | string | 目的地 |
| startDate | string | 开始日期 |
| endDate | string | 结束日期 |
| leaderId | string | 队长 ID |
| status | string | 状态 |
| templateId | string | 模板 ID |
| inviteCode | string | 邀请码 |
| createdAt | number | 创建时间 |
| updatedAt | number | 更新时间 |
| leader | object | 队长信息 |
| members | array | 成员列表 |
| days | array | 日程列表 |
| stats | object | 统计信息 |

**stats 对象：**

| 名称 | 类型 | 说明 |
|------|------|------|
| totalExpense | number | 总花费 |
| avgPerPerson | number | 人均花费 |
| expenseCount | number | 记账笔数 |
| memberCount | number | 成员数 |

---

### 3.4 更新行程

**接口地址：** `PUT /api/v1/trips/:id`

**说明：** 更新行程信息。

**需要登录：** 是（需为队长）

**请求参数：** 同创建行程，所有字段可选

---

### 3.5 删除行程

**接口地址：** `DELETE /api/v1/trips/:id`

**说明：** 删除行程（软删除）。

**需要登录：** 是（需为队长）

---

### 3.6 完成行程

**接口地址：** `POST /api/v1/trips/:id/complete`

**说明：** 标记行程为已完成状态。

**需要登录：** 是（需为队长）

---

### 3.7 获取行程统计概览

**接口地址：** `GET /api/v1/trips/:id/summary`

**说明：** 获取行程的费用统计概览。

**需要登录：** 是（需为行程成员）

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| totalExpense | number | 总花费 |
| avgPerPerson | number | 人均花费 |
| expenseCount | number | 记账笔数 |
| memberCount | number | 成员数 |
| categoryStats | array | 分类统计 |

**categoryStats 对象：**

| 名称 | 类型 | 说明 |
|------|------|------|
| category | string | 类别 |
| amount | number | 金额 |
| count | number | 笔数 |

---

## 四、成员模块

### 4.1 获取行程成员列表

**接口地址：** `GET /api/v1/trips/:tripId/members`

**说明：** 获取指定行程的所有成员。

**需要登录：** 是（需为行程成员）

**路径参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| tripId | string | 行程 ID |

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| list | array | 成员列表 |
| total | number | 总数 |

**成员对象：**

| 名称 | 类型 | 说明 |
|------|------|------|
| id | string | 用户 ID |
| nickname | string | 昵称 |
| avatar | string | 头像 URL |
| role | string | 角色 |
| joinedAt | number | 加入时间 |
| stats | object | 个人费用统计 |

**stats 对象：**

| 名称 | 类型 | 说明 |
|------|------|------|
| paid | number | 已付金额 |
| spent | number | 分摊金额 |
| balance | number | 余额 |

---

### 4.2 添加成员（手动添加）

**接口地址：** `POST /api/v1/trips/:tripId/members`

**说明：** 手动添加成员到行程。

**需要登录：** 是

**请求参数：**

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 是 | 成员昵称 |
| avatar | string | 否 | 头像 URL |

---

### 4.3 移除成员

**接口地址：** `DELETE /api/v1/trips/:tripId/members/:userId`

**说明：** 从行程中移除成员。

**需要登录：** 是（需为队长）

**路径参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| tripId | string | 行程 ID |
| userId | string | 用户 ID |

---

### 4.4 生成邀请码

**接口地址：** `POST /api/v1/trips/:tripId/invite-code`

**说明：** 生成或刷新行程邀请码。

**需要登录：** 是（需为队长）

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| inviteCode | string | 邀请码 |
| qrCodeUrl | string | 小程序码 URL |
| expireAt | number | 过期时间戳 |

---

### 4.5 使用邀请码加入行程

**接口地址：** `POST /api/v1/trips/join-by-code`

**说明：** 通过邀请码加入行程。

**需要登录：** 是

**请求参数：**

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| inviteCode | string | 是 | 邀请码 |

---

### 4.6 退出行程

**接口地址：** `POST /api/v1/trips/:tripId/leave`

**说明：** 主动退出行程。

**需要登录：** 是（成员自己退出，队长不可退出）

---

## 五、费用模块

### 5.1 添加费用

**接口地址：** `POST /api/v1/trips/:tripId/expenses`

**说明：** 在指定行程中添加一笔费用记录。

**需要登录：** 是（需为行程成员）

**路径参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| tripId | string | 行程 ID |

**请求参数：**

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| amount | number | 是 | 金额（人民币，单位：元） |
| category | string | 是 | 费用类别 |
| description | string | 是 | 描述，最大 200 字符 |
| payerId | string | 是 | 付款人用户 ID |
| splitType | string | 否 | 分摊方式，默认 equal |
| participants | string[] | 是 | 参与人用户 ID 列表 |
| splits | array | 否 | 分摊明细（按比例/自定义时必填） |
| currency | string | 否 | 币种，默认 CNY |
| exchangeRate | number | 否 | 汇率，默认 1 |
| note | string | 否 | 备注 |
| receiptImage | string | 否 | 小票照片 URL |

**splits 对象：**

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | string | 是 | 用户 ID |
| amount | number | 否 | 自定义金额（custom 类型） |
| percentage | number | 否 | 分摊比例（percentage 类型） |

**请求示例：**

```json
{
  "amount": 680.00,
  "category": "hotel",
  "description": "康定酒店两晚",
  "payerId": "user_001",
  "splitType": "equal",
  "participants": ["user_001", "user_002", "user_003", "user_004"],
  "currency": "CNY",
  "exchangeRate": 1,
  "note": "标间双床，含早餐",
  "receiptImage": "https://example.com/receipt.jpg"
}
```

**响应参数：** 完整的费用记录信息

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "exp_001",
    "tripId": "trip_001",
    "amount": 680.00,
    "category": "hotel",
    "description": "康定酒店两晚",
    "payerId": "user_001",
    "splitType": "equal",
    "currency": "CNY",
    "exchangeRate": 1,
    "note": "标间双床，含早餐",
    "receiptUrl": "https://example.com/receipt.jpg",
    "createdBy": "user_001",
    "createdAt": 1719235200000,
    "updatedAt": 1719235200000,
    "payer": {
      "id": "user_001",
      "nickname": "小明",
      "avatar": "https://example.com/avatar.jpg"
    },
    "participants": [
      {
        "id": "user_001",
        "nickname": "小明",
        "avatar": "https://example.com/avatar.jpg",
        "splitAmount": 170.00
      }
    ]
  },
  "timestamp": 1719235200000
}
```

---

### 5.2 获取费用列表

**接口地址：** `GET /api/v1/trips/:tripId/expenses`

**说明：** 获取行程的费用记录列表，支持筛选和分页。

**需要登录：** 是（需为行程成员）

**查询参数：**

| 名称 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| category | string | 否 | - | 费用类别筛选 |
| payerId | string | 否 | - | 付款人筛选 |
| startDate | string | 否 | - | 开始日期 |
| endDate | string | 否 | - | 结束日期 |
| keyword | string | 否 | - | 关键词搜索 |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |

**响应参数：** 分页格式

---

### 5.3 获取费用详情

**接口地址：** `GET /api/v1/expenses/:id`

**说明：** 获取单条费用记录的详细信息。

**需要登录：** 是（需为行程成员）

**路径参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| id | string | 费用 ID |

---

### 5.4 更新费用

**接口地址：** `PUT /api/v1/expenses/:id`

**说明：** 更新费用记录。

**需要登录：** 是（队长或费用创建者）

**请求参数：** 同添加费用，所有字段可选

---

### 5.5 删除费用

**接口地址：** `DELETE /api/v1/expenses/:id`

**说明：** 删除费用记录。

**需要登录：** 是（队长或费用创建者）

---

## 六、车辆模块

### 6.1 添加车辆

**接口地址：** `POST /api/v1/trips/:tripId/vehicles`

**说明：** 向行程中添加车辆。

**需要登录：** 是（需为行程成员）

**请求参数：**

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| plateNumber | string | 否 | 车牌号 |
| model | string | 是 | 车型，最大 50 字符 |
| capacity | number | 否 | 承载人数，默认 5 |
| fuelConsumption | number | 否 | 百公里油耗（L） |
| ownerId | string | 是 | 车主用户 ID |

**响应参数：** 完整的车辆信息

---

### 6.2 获取车辆列表

**接口地址：** `GET /api/v1/trips/:tripId/vehicles`

**说明：** 获取行程的车辆列表。

**需要登录：** 是（需为行程成员）

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| list | array | 车辆列表 |
| total | number | 总数 |

**车辆对象：**

| 名称 | 类型 | 说明 |
|------|------|------|
| id | string | 车辆 ID |
| plateNumber | string | 车牌号 |
| model | string | 车型 |
| capacity | number | 承载人数 |
| fuelConsumption | number | 百公里油耗 |
| ownerId | string | 车主 ID |
| owner | object | 车主信息 |
| fuelCost | number | 累计油费 |

---

### 6.3 获取车辆详情

**接口地址：** `GET /api/v1/vehicles/:id`

**说明：** 获取单车的详细信息。

**需要登录：** 是（需为行程成员）

---

### 6.4 更新车辆

**接口地址：** `PUT /api/v1/vehicles/:id`

**说明：** 更新车辆信息。

**需要登录：** 是（车主或队长）

---

### 6.5 删除车辆

**接口地址：** `DELETE /api/v1/vehicles/:id`

**说明：** 删除车辆。

**需要登录：** 是（车主或队长）

---

### 6.6 录入油费补贴

**接口地址：** `POST /api/v1/trips/:tripId/fuel-subsidy`

**说明：** 录入油费补贴记录，自动生成对应的费用记录。

**需要登录：** 是（需为行程成员）

**请求参数：**

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| vehicleId | string | 是 | 车辆 ID |
| fuelDate | string | 是 | 加油日期，YYYY-MM-DD |
| fuelAmount | number | 是 | 加油量（升） |
| fuelPrice | number | 是 | 油价（元/升） |
| totalAmount | number | 是 | 总金额（元） |
| isSplit | boolean | 否 | 是否分摊，默认 true |
| note | string | 否 | 备注 |

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| id | string | 油费补贴记录 ID |
| expenseId | string | 关联的费用记录 ID |
| ... | ... | 其他油费信息 |

---

### 6.7 获取油费补贴列表

**接口地址：** `GET /api/v1/trips/:tripId/fuel-subsidy`

**说明：** 获取行程的油费补贴记录列表。

**需要登录：** 是（需为行程成员）

---

## 七、结算模块

### 7.1 计算结算方案

**接口地址：** `GET /api/v1/trips/:tripId/settlements`

**说明：** 计算行程的最优结算方案（债务简化）。

**需要登录：** 是（需为行程成员）

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| totalExpense | number | 总花费 |
| memberCount | number | 参与人数 |
| avgPerPerson | number | 人均花费 |
| userBalances | array | 用户余额列表 |
| settlements | array | 结算方案列表 |

**userBalances 对象：**

| 名称 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户 ID |
| user | object | 用户信息 |
| paid | number | 已付金额 |
| shouldPay | number | 应付金额 |
| balance | number | 余额（正为应收，负为应付） |

**settlements 对象：**

| 名称 | 类型 | 说明 |
|------|------|------|
| id | string | 结算记录 ID（如有） |
| fromUserId | string | 付款方 ID |
| fromUser | object | 付款方信息 |
| toUserId | string | 收款方 ID |
| toUser | object | 收款方信息 |
| amount | number | 金额 |
| status | string | 状态：pending/settled |
| settledAt | number | 结清时间 |

---

### 7.2 标记结算为已结清

**接口地址：** `POST /api/v1/settlements/:id/settle`

**说明：** 标记某笔结算为已结清。

**需要登录：** 是（涉及的用户或队长）

**路径参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| id | string | 结算记录 ID |

---

### 7.3 生成结算单分享

**接口地址：** `POST /api/v1/trips/:tripId/settlement/share`

**说明：** 生成结算单分享图片或链接。

**需要登录：** 是（需为行程成员）

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| shareUrl | string | 分享链接 |
| imageUrl | string | 分享图片 URL |
| qrCodeUrl | string | 小程序码 URL |

---

## 八、统计模块

### 8.1 获取个人统计

**接口地址：** `GET /api/v1/stats/personal`

**说明：** 获取当前用户的总体统计数据。

**需要登录：** 是

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| totalTrips | number | 总行程数 |
| totalExpense | number | 累计花费 |
| totalExpenseCount | number | 记账笔数 |
| activeTrips | number | 进行中行程数 |

---

### 8.2 获取行程分类统计

**接口地址：** `GET /api/v1/trips/:tripId/stats/category`

**说明：** 获取行程的分类消费统计。

**需要登录：** 是（需为行程成员）

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| totalExpense | number | 总花费 |
| categoryStats | array | 分类统计列表 |

**categoryStats 对象：**

| 名称 | 类型 | 说明 |
|------|------|------|
| category | string | 类别 |
| amount | number | 金额 |
| count | number | 笔数 |
| percent | number | 占比（百分比） |

---

### 8.3 获取个人账单

**接口地址：** `GET /api/v1/trips/:tripId/stats/my-bill`

**说明：** 获取当前用户在指定行程中的个人账单。

**需要登录：** 是（需为行程成员）

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户 ID |
| paid | number | 垫付金额 |
| shouldPay | number | 消费金额 |
| balance | number | 余额 |
| paidExpenses | array | 垫付的费用列表 |
| participatedExpenses | array | 参与的费用列表 |

---

### 8.4 获取时间趋势统计

**接口地址：** `GET /api/v1/trips/:tripId/stats/trend`

**说明：** 获取按日期的消费趋势统计。

**需要登录：** 是（需为行程成员）

**查询参数：**

| 名称 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| type | string | 否 | day | 统计维度：day/month |

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| list | array | 按日期的统计列表 |

**趋势项对象：**

| 名称 | 类型 | 说明 |
|------|------|------|
| date | string | 日期 |
| amount | number | 金额 |
| count | number | 笔数 |

---

## 九、模板模块

### 9.1 获取模板列表

**接口地址：** `GET /api/v1/templates`

**说明：** 获取行程模板列表。

**需要登录：** 否

**查询参数：**

| 名称 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| tag | string | 否 | - | 标签筛选 |
| keyword | string | 否 | - | 关键词搜索 |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |

**响应参数：** 分页格式

**模板对象：**

| 名称 | 类型 | 说明 |
|------|------|------|
| id | string | 模板 ID |
| name | string | 名称 |
| description | string | 描述 |
| cover | string | 封面图 URL |
| estimatedDays | number | 预计天数 |
| estimatedBudget | number | 预计预算/人 |
| categories | string[] | 推荐类别 |
| tags | string[] | 标签 |
| sampleDays | array | 示例行程日 |

---

### 9.2 获取模板详情

**接口地址：** `GET /api/v1/templates/:id`

**说明：** 获取单个模板的详细信息。

**需要登录：** 否

---

### 9.3 使用模板创建行程

**接口地址：** `POST /api/v1/templates/:id/apply`

**说明：** 基于模板快速创建行程。

**需要登录：** 是

**请求参数：**

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 否 | 自定义标题，默认使用模板名+之旅 |
| destination | string | 否 | 自定义目的地 |
| startDate | string | 是 | 开始日期 |
| endDate | string | 是 | 结束日期 |

---

## 十、活动动态模块

### 10.1 获取活动动态列表

**接口地址：** `GET /api/v1/trips/:tripId/activities`

**说明：** 获取行程的活动动态时间线。

**需要登录：** 是（需为行程成员）

**查询参数：**

| 名称 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| type | string | 否 | - | 类型筛选：expense/member_join/settle |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |

**响应参数：** 分页格式

**活动对象：**

| 名称 | 类型 | 说明 |
|------|------|------|
| id | string | 动态 ID |
| tripId | string | 行程 ID |
| userId | string | 操作用户 ID |
| user | object | 用户信息 |
| type | string | 类型 |
| content | string | 内容描述 |
| amount | number | 关联金额 |
| createdAt | number | 创建时间 |

---

## 十一、文件模块

### 11.1 上传文件

**接口地址：** `POST /api/v1/files/upload`

**说明：** 上传图片或其他文件。

**需要登录：** 是

**请求方式：** multipart/form-data

**请求参数：**

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 文件对象 |
| type | string | 否 | 文件类型：receipt/avatar/other，默认 other |

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| url | string | 文件访问 URL |
| size | number | 文件大小（字节） |
| type | string | 文件类型 |
| name | string | 文件名 |

**限制：**
- 支持格式：jpg、jpeg、png、gif、webp
- 最大大小：10MB

---

### 11.2 获取上传凭证

**接口地址：** `GET /api/v1/files/oss-credentials`

**说明：** 获取 OSS 直传凭证，用于前端直接上传到对象存储。

**需要登录：** 是

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| accessKeyId | string | 临时 AccessKey |
| accessKeySecret | string | 临时密钥 |
| stsToken | string | 安全令牌 |
| bucket | string | 存储桶 |
| region | string | 区域 |
| dir | string | 上传目录 |
| expire | number | 过期时间戳 |

---

## 十二、我的模块

### 12.1 获取我的行程统计

**接口地址：** `GET /api/v1/mine/summary`

**说明：** 获取"我的"页面的统计数据。

**需要登录：** 是

**响应参数：**

| 名称 | 类型 | 说明 |
|------|------|------|
| user | object | 用户信息 |
| stats | object | 统计数据 |

**stats 对象：**

| 名称 | 类型 | 说明 |
|------|------|------|
| totalTrips | number | 总行程数 |
| totalSpent | number | 累计花费 |
| totalExpenseCount | number | 记账笔数 |
| activeTrips | number | 进行中 |

---

## 附录 A：数据字典

### A.1 币种列表

| 代码 | 符号 | 名称 | 默认汇率 |
|------|------|------|---------|
| CNY | ¥ | 人民币 | 1 |
| USD | $ | 美元 | 7.2 |
| EUR | € | 欧元 | 7.8 |
| JPY | ¥ | 日元 | 0.05 |
| GBP | £ | 英镑 | 9.1 |
| HKD | HK$ | 港币 | 0.92 |

### A.2 费用类别详情

| 类别 | 中文名 | emoji | 默认颜色 |
|------|--------|-------|---------|
| food | 餐饮 | 🍜 | #ff7d00 |
| hotel | 住宿 | 🏨 | #165dff |
| transport | 交通 | 🚗 | #722ed1 |
| ticket | 门票 | 🎫 | #00b42a |
| fuel | 油费 | ⛽ | #f53f3f |
| toll | 过路费 | 🛣️ | #13c2c2 |
| parking | 停车费 | 🅿️ | #faad14 |
| other | 其他 | 📦 | #86909c |

---

## 附录 B：分页与排序规范

### B.1 分页参数

所有列表接口统一使用以下分页参数：

| 参数名 | 类型 | 默认值 | 范围 | 说明 |
|--------|------|--------|------|------|
| page | number | 1 | >=1 | 页码 |
| pageSize | number | 20 | 1-100 | 每页数量 |

### B.2 排序参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| sortBy | string | 排序字段 |
| sortOrder | string | 排序方向：asc/desc |

默认排序：按创建时间倒序（createdAt desc）

---

## 附录 C：状态码速查

| 区间 | 类别 | 示例 |
|------|------|------|
| 0 | 成功 | - |
| 10000-19999 | 通用错误 | 参数错误、未授权、权限不足 |
| 20000-29999 | 业务错误 | 用户不存在、行程不存在 |
| 30000-39999 | 邀请/加入错误 | 邀请码无效、已满员 |
| 40000-49999 | 文件错误 | 上传失败、格式不支持 |
| 50000+ | 服务器错误 | 内部错误 |

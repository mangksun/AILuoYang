# AI伴游功能设计方案

## 功能概述

AI伴游是一个基于位置感知的智能旅游陪伴功能，用户可以与AI对话获取周围信息，也可以通过预设按钮快速查看附近的休息点、美食、购物和景点。

## 交互流程

```
进入伴游页面
    ↓
┌─────────────────────────────┐
│  当前在***，已为你开启本地智能旅游陪伴  │
├─────────────────────────────┤
│  [累了休息] [饿了吃饭] [想购物] [附近景点]  │
├─────────────────────────────┤
│          对话区域           │
│  用户: 附近有什么好玩的？      │
│  AI: 根据您的位置...         │
│                             │
├─────────────────────────────┤
│      [输入框] [发送]         │
└─────────────────────────────┘
         │
         │ 点击预设按钮
         ↓
┌─────────────────────────────┐
│         地图区域            │
│    ┌─────────────────┐      │
│    │   地图标记点      │      │
│    └─────────────────┘      │
├─────────────────────────────┤
│         地点列表            │
│  ┌─────┐ 名称              │
│  │ 图片 │ 地址  距离        │
│  └─────┘ 简介              │
└─────────────────────────────┘
```

## 页面结构

### 1. 伴游对话页面 `pages/companion/index.vue`

**布局结构：**
- 顶部：位置提示小字 "当前在***，已为你开启本地智能旅游陪伴"
- 预设按钮区：4个固定按钮
  - 😴 累了，休息吧
  - 🍜 饿了，快吃饭
  - 🛍️ 我想购物了
  - 🏛️ 附近有什么景点呢？
- 对话区域：消息列表（用户消息 + AI回复）
- 底部：输入框 + 发送按钮

**交互逻辑：**
1. 进入页面时获取用户位置（`uni.getLocation`）
2. 位置信息显示在顶部小字（可通过逆地理编码获取地点名称）
3. 发送消息时，将 `message` + `latitude` + `longitude` 传给AI接口
4. AI基于用户位置和知识库返回回答
5. 点击预设按钮，跳转到地图页面，传递类型参数

**预设按钮对应类型：**
| 按钮 | 类型参数 | 查询数据 |
|------|---------|---------|
| 累了，休息吧 | `rest` | 附近的休息场所（茶馆、咖啡厅等） |
| 饿了，快吃饭 | `food` | Food表 |
| 我想购物了 | `shopping` | 附近的购物场所 |
| 附近有什么景点呢？ | `attraction` | Attraction表 |

### 2. 地图+列表页面 `pages/companion/map.vue`

**布局结构：**
- 上半部分：地图组件（展示POI标记点）
- 下半部分：地点列表
  - 每项包含：图片、名称、地址、距离、简介
  - 点击列表项：地图定位到该点
  - 点击地图标记：弹出简要信息卡片

**数据加载：**
1. 接收页面参数 `type`（rest/food/shopping/attraction）
2. 根据类型调用对应API获取POI数据
3. 计算每个POI与用户当前位置的距离
4. 按距离排序展示

## 后端接口设计

### 1. 伴游对话接口

**POST** `/api/ai/companion/chat`

请求体：
```json
{
  "message": "附近有什么好吃的？",
  "latitude": 34.6197,
  "longitude": 112.4539,
  "chat_history": []
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "reply": "根据您的位置，附近500米内有几家不错的餐厅...",
    "chat_log_id": 123
  }
}
```

**实现逻辑：**
1. 接收用户消息和位置
2. 查询附近POI（500米/1公里范围）
3. 构造包含位置信息的system prompt
4. 调用DeepSeek获取回答
5. 记录对话日志

### 2. 查询附近POI接口

**GET** `/api/ai/companion/nearby`

参数：
- `type`: 类型（rest/food/shopping/attraction）
- `latitude`: 纬度
- `longitude`: 经度
- `radius`: 半径（米，默认1000）
- `limit`: 数量限制（默认20）

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "xxx",
        "name": "老洛阳面馆",
        "category": "面食",
        "description": "正宗洛阳水席...",
        "address": "西工区中州中路...",
        "images": ["url1", "url2"],
        "latitude": 34.6200,
        "longitude": 112.4540,
        "distance": 350
      }
    ],
    "total": 15,
    "type": "food"
  }
}
```

**距离计算公式（Haversine）：**
```python
import math

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371000  # 地球半径（米）
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi/2)**2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c
```

## 数据库设计

### 新增表：`companion_rest_place`（休息场所）

```sql
CREATE TABLE companion_rest_place (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  address VARCHAR(255),
  phone VARCHAR(20),
  business_hours VARCHAR(100),
  images JSON,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 新增表：`companion_shopping_place`（购物场所）

```sql
CREATE TABLE companion_shopping_place (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  address VARCHAR(255),
  phone VARCHAR(20),
  business_hours VARCHAR(100),
  images JSON,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 技术实现要点

### 1. 位置感知对话

在调用AI时，构造包含位置信息的prompt：

```python
system_prompt = f"""你是洛阳智能旅游助手"洛灵儿"。

用户当前位置：纬度 {latitude}，经度 {longitude}
附近景点：{nearby_spots}
附近美食：{nearby_foods}

请根据用户的位置和问题，提供准确、有用的旅游建议。
回答要简洁、友好、实用。"""
```

### 2. 地图展示

使用微信小程序原生 `map` 组件：

```vue
<map
  :latitude="centerLatitude"
  :longitude="centerLongitude"
  :markers="markers"
  :scale="14"
  show-location
  style="width: 100%; height: 400rpx;"
/>
```

### 3. 列表与地图联动

- 点击列表项：更新map的center坐标
- 点击标记点：滚动列表到对应项

## 文件结构

```
miniapp/src/
├── pages/
│   └── companion/
│       ├── index.vue          # 伴游对话页面
│       └── map.vue            # 地图+列表页面
├── api/
│   └── companion.ts           # 伴游API封装
└── ...

packages/ai-svc/app/
├── main.py                    # 新增伴游相关路由
├── companion.py               # 伴游业务逻辑（新增）
└── ...
```

## 实现步骤

1. **后端 - 新增伴游表**
   - 在 `prisma/schema.prisma` 添加 RestPlace、ShoppingPlace 模型
   - 运行 `npx prisma db push`

2. **后端 - 实现伴游API**
   - 在 `packages/ai-svc/app/main.py` 添加 `/api/ai/companion/chat` 和 `/api/ai/companion/nearby` 路由
   - 实现距离计算和附近POI查询逻辑

3. **小程序 - 新增页面**
   - 创建 `pages/companion/index.vue`（对话页面）
   - 创建 `pages/companion/map.vue`（地图+列表页面）
   - 在 `pages.json` 注册新页面

4. **小程序 - API封装**
   - 创建 `api/companion.ts`

5. **小程序 - 交互完善**
   - 实现位置获取和显示
   - 实现对话功能
   - 实现地图标记和列表联动

## 后续扩展

- [ ] 语音输入/播报
- [ ] 个性化推荐（基于用户偏好）
- [ ] 游览路线记录
- [ ] 打卡集章功能
- [ ] 分享游记生成

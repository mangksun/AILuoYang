# 景区票务管理系统

基于微服务架构的景区智慧票务管理平台。

## 技术栈

- **后端**: Node.js + Express + TypeScript + Prisma
- **前端**: Vue 3 + Element Plus + Vite
- **数据库**: MySQL 8.0 + Redis 7
- **部署**: Docker + Docker Compose

## 微服务架构

| 服务 | 端口 | 职责 |
|------|------|------|
| gateway | 3000 | API网关、鉴权、路由 |
| ticket-svc | 3001 | 票种管理、会员卡、项目管理 |
| order-svc | 3002 | 订单、退款、对账 |
| user-svc | 3003 | 用户、商户、权限 |
| check-svc | 3004 | 检票、核销、闸机交互 |
| ota-svc | 3005 | OTA渠道对接、产品映射 |

## 快速开始

### Docker Compose 部署

```bash
# 复制环境变量
cp .env.example .env

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

访问 http://localhost:8080 打开管理后台。

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动基础设施
docker-compose up -d mysql redis

# 启动后端服务
cd packages/ticket-svc
npx prisma db push
pnpm dev

# 启动前端
cd web-admin
pnpm dev
```

## 核心功能

- 票种管理（单日票、联票、限购票、预约票）
- 会员卡（年卡、次卡、储值卡、计时收费）
- 订单管理与退款
- 检票记录与核销
- OTA渠道对接（抖音、美团、携程）
- 财务对账报表

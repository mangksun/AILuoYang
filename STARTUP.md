# 本地启动指南

## 前置条件

- Node.js 18+
- npm（随 Node.js 安装）
- Python 3.10+（用于 ai-svc）
- MySQL（已运行，端口 3306）
- Redis（已运行，端口 6379）

## 1. 配置环境变量

复制 `.env.example` 为 `.env`，按实际环境修改：

```bash
cp .env.example .env
```

关键配置项：

```env
DATABASE_URL=mysql://root:1234@localhost:3306/ticketing
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret-change-in-production
```

## 2. 安装依赖

```bash
npm install
```

## 3. 同步数据库

确保 MySQL 中 `ticketing` 数据库存在：

```bash
mysql -u root -p1234 -e "CREATE DATABASE IF NOT EXISTS ticketing"
```

使用根目录的完整 Prisma Schema 同步所有表：

```bash
npx prisma db push --schema=prisma/schema.prisma
```

## 4. 生成 Prisma Client

由于是 pnpm monorepo，每个服务有独立的 `@prisma/client`，需要逐个生成。先将根 schema 复制到各服务目录，再分别生成：

```bash
# 复制根 schema 到各服务
for svc in user-svc ticket-svc order-svc check-svc ota-svc miniapp-svc; do
  cp prisma/schema.prisma packages/$svc/prisma/schema.prisma
done

# 逐个生成 Prisma Client
for svc in user-svc ticket-svc order-svc check-svc ota-svc miniapp-svc; do
  npx prisma generate --schema=packages/$svc/prisma/schema.prisma
done
```

## 5. 启动服务

所有服务通过 `ts-node-dev` 运行，支持热重载。每个服务需要在独立终端中启动：

```bash
# 终端 1 - API 网关 (:3000)
cd packages/gateway && npx ts-node-dev --respawn src/app.ts

# 终端 2 - 票务服务 (:3001)
cd packages/ticket-svc && npx ts-node-dev --respawn src/app.ts

# 终端 3 - 订单服务 (:3002)
cd packages/order-svc && npx ts-node-dev --respawn src/app.ts

# 终端 4 - 用户服务 (:3003)
cd packages/user-svc && npx ts-node-dev --respawn src/app.ts

# 终端 5 - 检票服务 (:3004)
cd packages/check-svc && npx ts-node-dev --respawn src/app.ts

# 终端 6 - OTA 渠道服务 (:3005)
cd packages/ota-svc && npx ts-node-dev --respawn src/app.ts

# 终端 7 - 小程序服务 (:3006)
cd packages/miniapp-svc && npx ts-node-dev --respawn src/app.ts

# 终端 8 - AI 服务 (:3010)
cd packages/ai-svc && python -m uvicorn app.main:app --host 0.0.0.0 --port 3010 --reload

# 终端 9 - 管理后台前端 (:8080)
cd web-admin && npx vite --host
```

## 6. 验证

所有服务启动后，访问以下地址：

| 服务 | 地址 |
|------|------|
| 管理后台 | http://localhost:8080 |
| API 网关 | http://localhost:3000 |
| 票务服务 | http://localhost:3001 |
| 订单服务 | http://localhost:3002 |
| 用户服务 | http://localhost:3003 |
| 检票服务 | http://localhost:3004 |
| OTA 服务 | http://localhost:3005 |
| 小程序服务 | http://localhost:3006 |
| AI 服务 | http://localhost:3010 |

## 常见问题

### Prisma generate 报 EPERM 错误

DLL 文件被正在运行的 node 进程锁住。先停掉所有服务进程，再重新生成：

```bash
# 停掉所有 node 进程
taskkill /F /IM node.exe

# 重新生成
for svc in user-svc ticket-svc order-svc check-svc ota-svc miniapp-svc; do
  npx prisma generate --schema=packages/$svc/prisma/schema.prisma
done
```

### check-svc Redis 认证错误

如果 Redis 设了密码，修改 `.env` 中的 `REDIS_URL`：

```env
REDIS_URL=redis://:your-password@localhost:6379
```

### prisma db push 提示数据丢失

每个服务的 Prisma Schema 只定义了自己负责的表，直接推送会删除其他服务的表。务必使用根目录的完整 Schema：

```bash
npx prisma db push --schema=prisma/schema.prisma
```

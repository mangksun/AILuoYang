# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

景区票务管理系统 — a microservice-based ticketing platform for tourist attractions. Built with Node.js/Express/TypeScript backends and a Vue 3 + Element Plus admin frontend.

## Commands

```bash
# Docker (recommended for full stack)
docker compose up -d              # start all services
docker compose down               # stop all services
docker compose logs -f <service>  # tail logs for a service
docker compose build --no-cache <service>  # rebuild one service
docker compose ps -a              # check container status

# Local development (each service independently)
cd packages/<service>
pnpm install
npx prisma db push                # sync schema to database
pnpm dev                          # runs ts-node-dev

# Frontend
cd web-admin
pnpm install
pnpm dev                          # Vite dev server on :8080

# Root monorepo
pnpm install                      # install all workspace deps
pnpm build                        # build all packages
```

## Architecture

**pnpm monorepo** with workspaces defined in `pnpm-workspace.yaml`:
- `packages/*` — 6 backend microservices
- `web-admin` — Vue 3 admin frontend
- `shared/` — shared TypeScript types and utilities

### Services

| Service | Port | Database | Purpose |
|---------|------|----------|---------|
| gateway | 3000 | — | API gateway: JWT auth, rate limiting, reverse proxy to other services |
| ticket-svc | 3001 | MySQL + Redis | Ticket types, groups, projects, member cards |
| order-svc | 3002 | MySQL + Redis | Orders, refunds, reconciliation |
| user-svc | 3003 | MySQL | Auth (login/JWT), admin users, merchants, roles |
| check-svc | 3004 | MySQL + Redis | Check-in records, verification, gate interaction |
| ota-svc | 3005 | MySQL | OTA channel integration (Douyin, Meituan, Ctrip) |

All services share a single MySQL database (`ticketing`) but each has its own Prisma schema. Redis is used for check-in counters and anti-fraud intervals.

### Request Flow

```
Client → gateway (:3000) → [JWT auth] → proxy to target service
                                    ↓
                              service → Prisma → MySQL
```

Gateway routes are defined in `packages/gateway/src/app.ts`. Only `/api/auth` is unauthenticated; all other routes require a Bearer token.

### Service Internal Structure

Each service in `packages/<name>/` follows the same pattern:
```
src/
  app.ts              # Express app setup, route mounting
  prisma/client.ts    # PrismaClient singleton
  middleware/          # errorHandler, validate (Joi)
  routes/             # Express Router definitions
  controllers/        # Business logic (async handlers)
prisma/
  schema.prisma       # Database schema
```

### Frontend Structure

`web-admin/src/`:
- `api/request.ts` — Axios instance with interceptors; response unwraps `{ code, message, data }` envelope (code=0 means success)
- `api/*.ts` — one file per domain (ticket, order, member, check, ota, user, auth)
- `router/index.ts` — all routes; auth guard redirects to `/login` if no token
- `stores/user.ts` — Pinia store for auth state
- `layout/index.vue` — sidebar + header shell
- `views/<domain>/<page>.vue` — page components

## Key Conventions

**API Response Format**: All endpoints return `{ code: number, message: string, data: any }`. Code `0` = success. Frontend Axios interceptor handles this automatically.

**Database**: Prisma schemas use `@map("snake_case")` for table and column names. Each service's schema is independent — no cross-service Prisma relations. JSON fields are stored as `String @db.Text` and serialized/deserialized in controllers.

**Auth**: JWT payload is `{ userId, username, role, merchantId }`. Gateway passes user info to downstream services via `X-User-Id`, `X-User-Role`, `X-Merchant-Id` headers.

**Status Fields**: All entities use a `status` varchar field (`active`/`disabled`/`frozen`/`expired`). Ticket types are **never deleted** — only disabled — to preserve historical order references.

**Prisma Commands**: After changing a schema, run `npx prisma db push` (not migrate) to sync. Run `npx prisma generate` to regenerate the client.

**Check-in Logic** (check-svc): Uses Redis atomic counters (`ticket:{orderId}:project:{projectId}` and `ticket:{orderId}:total`) to enforce usage limits. Anti-fraud interval tracked via `card:{cardId}:last_check`.

**Docker**: Services use `node:18` base image (not Alpine — Prisma requires glibc). MySQL exposed on host port 3307, Redis on 6380 to avoid conflicts with local instances.

## Environment Variables

Key variables in `.env` (copy from `.env.example`):
- `DATABASE_URL` — MySQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_SECRET` — shared secret for token signing (must be same in gateway and user-svc)
- `<SERVICE>_PORT` — per-service port override

FROM node:18
WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/order-svc/package.json packages/order-svc/package.json
COPY prisma/schema.prisma packages/order-svc/prisma/schema.prisma
RUN pnpm install --no-frozen-lockfile

COPY packages/order-svc/src ./packages/order-svc/src
COPY packages/order-svc/tsconfig.json ./packages/order-svc/tsconfig.json

WORKDIR /app/packages/order-svc
RUN npx prisma generate
RUN npx tsc

EXPOSE 3002
CMD ["node", "dist/app.js"]

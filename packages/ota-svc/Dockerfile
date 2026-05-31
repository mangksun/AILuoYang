FROM node:18
WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/ota-svc/package.json packages/ota-svc/package.json
COPY prisma/schema.prisma packages/ota-svc/prisma/schema.prisma
RUN pnpm install --no-frozen-lockfile

COPY packages/ota-svc/src ./packages/ota-svc/src
COPY packages/ota-svc/tsconfig.json ./packages/ota-svc/tsconfig.json

WORKDIR /app/packages/ota-svc
RUN npx prisma generate
RUN npx tsc

EXPOSE 3005
CMD ["node", "dist/app.js"]

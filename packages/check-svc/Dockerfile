FROM node:18
WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/check-svc/package.json packages/check-svc/package.json
COPY prisma/schema.prisma packages/check-svc/prisma/schema.prisma
RUN pnpm install --no-frozen-lockfile

COPY packages/check-svc/src ./packages/check-svc/src
COPY packages/check-svc/tsconfig.json ./packages/check-svc/tsconfig.json

WORKDIR /app/packages/check-svc
RUN npx prisma generate
RUN npx tsc

EXPOSE 3004
CMD ["node", "dist/app.js"]

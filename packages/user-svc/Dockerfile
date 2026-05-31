FROM node:18
WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/user-svc/package.json packages/user-svc/package.json
COPY prisma/schema.prisma packages/user-svc/prisma/schema.prisma
RUN pnpm install --no-frozen-lockfile

COPY packages/user-svc/src ./packages/user-svc/src
COPY packages/user-svc/tsconfig.json ./packages/user-svc/tsconfig.json

WORKDIR /app/packages/user-svc
RUN npx prisma generate
RUN npx tsc

EXPOSE 3003
CMD ["node", "dist/app.js"]

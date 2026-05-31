FROM node:18
WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/ticket-svc/package.json packages/ticket-svc/package.json
COPY prisma/schema.prisma packages/ticket-svc/prisma/schema.prisma
RUN pnpm install --no-frozen-lockfile

COPY packages/ticket-svc/src ./packages/ticket-svc/src
COPY packages/ticket-svc/tsconfig.json ./packages/ticket-svc/tsconfig.json

WORKDIR /app/packages/ticket-svc
RUN npx prisma generate
RUN npx tsc

EXPOSE 3001
CMD ["node", "dist/app.js"]

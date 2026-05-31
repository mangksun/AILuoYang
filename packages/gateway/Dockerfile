FROM node:18
WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/gateway/package.json packages/gateway/package.json
RUN pnpm install --no-frozen-lockfile

COPY packages/gateway/src ./packages/gateway/src
COPY packages/gateway/tsconfig.json ./packages/gateway/tsconfig.json

WORKDIR /app/packages/gateway
RUN npx tsc

EXPOSE 3000
CMD ["node", "dist/app.js"]

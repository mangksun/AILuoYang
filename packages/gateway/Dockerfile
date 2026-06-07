FROM node:18
WORKDIR /app
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com \
    PNPM_HOME=/root/.local/share/pnpm \
    PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
ENV PATH=$PNPM_HOME:$PATH
RUN npm install -g pnpm && pnpm config set registry https://registry.npmmirror.com

COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/gateway/package.json packages/gateway/package.json
RUN pnpm install --no-frozen-lockfile

COPY packages/gateway/src ./packages/gateway/src
COPY packages/gateway/tsconfig.json ./packages/gateway/tsconfig.json

WORKDIR /app/packages/gateway
RUN npx tsc

EXPOSE 3000
CMD ["node", "dist/app.js"]

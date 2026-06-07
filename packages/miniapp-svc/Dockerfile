FROM node:18
WORKDIR /app
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com \
    PNPM_HOME=/root/.local/share/pnpm \
    PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
ENV PATH=$PNPM_HOME:$PATH
RUN npm install -g pnpm && pnpm config set registry https://registry.npmmirror.com

COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/miniapp-svc/package.json packages/miniapp-svc/package.json
COPY packages/miniapp-svc/prisma/schema.prisma packages/miniapp-svc/prisma/schema.prisma
RUN pnpm install --no-frozen-lockfile

COPY packages/miniapp-svc/src ./packages/miniapp-svc/src
COPY packages/miniapp-svc/tsconfig.json ./packages/miniapp-svc/tsconfig.json

WORKDIR /app/packages/miniapp-svc
RUN npx prisma generate
RUN npx tsc

EXPOSE 3006
CMD ["node", "dist/app.js"]

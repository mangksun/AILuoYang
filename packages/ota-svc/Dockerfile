FROM node:18
WORKDIR /app
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com \
    PNPM_HOME=/root/.local/share/pnpm \
    PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
ENV PATH=$PNPM_HOME:$PATH
RUN npm install -g pnpm && pnpm config set registry https://registry.npmmirror.com

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

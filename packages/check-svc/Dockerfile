FROM node:18
WORKDIR /app
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com \
    PNPM_HOME=/root/.local/share/pnpm \
    PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
ENV PATH=$PNPM_HOME:$PATH
RUN npm install -g pnpm && pnpm config set registry https://registry.npmmirror.com

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

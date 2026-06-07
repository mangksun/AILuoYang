FROM node:18
WORKDIR /app
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com \
    PNPM_HOME=/root/.local/share/pnpm \
    PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
ENV PATH=$PNPM_HOME:$PATH
RUN npm install -g pnpm && pnpm config set registry https://registry.npmmirror.com

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

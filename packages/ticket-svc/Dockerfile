FROM node:18
WORKDIR /app
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com \
    PNPM_HOME=/root/.local/share/pnpm \
    PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
ENV PATH=$PNPM_HOME:$PATH
RUN npm install -g pnpm && pnpm config set registry https://registry.npmmirror.com

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

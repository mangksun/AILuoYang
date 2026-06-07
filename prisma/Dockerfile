FROM node:18
WORKDIR /app
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com \
    PNPM_HOME=/root/.local/share/pnpm \
    PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
ENV PATH=$PNPM_HOME:$PATH
RUN npm install -g pnpm && pnpm config set registry https://registry.npmmirror.com
COPY prisma/package.json ./
RUN pnpm install --no-frozen-lockfile
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npx prisma generate
CMD ["sh", "-c", "npx prisma db push && echo 'Database schema synced successfully'"]

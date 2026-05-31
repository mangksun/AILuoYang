FROM node:18
WORKDIR /app
RUN npm install -g pnpm
COPY prisma/package.json ./
RUN pnpm install --no-frozen-lockfile
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npx prisma generate
CMD ["sh", "-c", "npx prisma db push && echo 'Database schema synced successfully'"]

FROM node:18 AS build
WORKDIR /app
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com \
    PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN npm install -g pnpm && pnpm config set registry https://registry.npmmirror.com

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY web-admin/ web-admin/
RUN pnpm install --filter @ticketing/web-admin... --prod=false --no-frozen-lockfile
WORKDIR /app/web-admin
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/web-admin/dist /usr/share/nginx/html
COPY web-admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

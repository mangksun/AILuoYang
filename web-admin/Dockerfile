FROM node:18 AS build
WORKDIR /app
RUN npm install -g pnpm

COPY web-admin/package.json ./
RUN pnpm install --no-frozen-lockfile

COPY web-admin/ .
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY web-admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

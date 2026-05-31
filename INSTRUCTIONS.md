 # 进入项目目录
  cd D:/Projects/AILuoYang

  # =服务管理=

  # 启动所有服务
  docker compose up -d

  # 停止所有服务
  docker compose down

  # 重启所有服务
  docker compose restart

  # 重启单个服务
  docker compose restart ticket-svc

  # 查看所有容器状态
  docker compose ps -a

  # = 日志查看 =

  # 查看所有服务日志
  docker compose logs -f

  # 查看单个服务日志
  docker compose logs -f ticket-svc
  docker compose logs -f gateway

  # 查看最近50行日志
  docker compose logs --tail 50 ticket-svc

  # = 构建相关 =

  # 重新构建所有镜像
  docker compose build --no-cache

  # 重新构建单个服务
  docker compose build --no-cache ticket-svc

  # 构建并启动
  docker compose up -d --build

  # = 数据库操作 =

  # 进入 MySQL 命令行
  docker exec -it ticketing-mysql mysql -uroot -proot123456 ticketing

  # 进入 Redis 命令行
  docker exec -it ticketing-redis redis-cli

  # 查看数据库表
  docker exec -it ticketing-mysql mysql -uroot -proot123456 -e "USE ticketing; SHOW TABLES;"

  # = 调试排查 =

  # 进入容器内部
  docker exec -it ticketing-ticket-svc sh

  # 查看容器资源占用
  docker stats

  # 清理未使用的镜像
  docker image prune -f

  # 完全重置（删除所有数据）
  docker compose down -v
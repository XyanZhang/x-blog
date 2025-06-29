#!/bin/bash

# Prisma Studio 管理脚本
# 用于启动、停止、重启 Prisma Studio

set -e

PRISMA_STUDIO_NAME="prisma-studio"
PRISMA_STUDIO_PORT="5555"

case "$1" in
  start)
    echo "🚀 启动 Prisma Studio..."
    pm2 delete $PRISMA_STUDIO_NAME 2>/dev/null || true
    pm2 start npx --name $PRISMA_STUDIO_NAME -- prisma studio --port $PRISMA_STUDIO_PORT
    pm2 save
    echo "✅ Prisma Studio 已启动，访问地址: http://localhost:$PRISMA_STUDIO_PORT"
    ;;
  stop)
    echo "🛑 停止 Prisma Studio..."
    pm2 stop $PRISMA_STUDIO_NAME
    pm2 save
    echo "✅ Prisma Studio 已停止"
    ;;
  restart)
    echo "🔄 重启 Prisma Studio..."
    pm2 restart $PRISMA_STUDIO_NAME
    echo "✅ Prisma Studio 已重启"
    ;;
  status)
    echo "📊 Prisma Studio 状态:"
    pm2 status $PRISMA_STUDIO_NAME
    ;;
  logs)
    echo "📝 Prisma Studio 日志:"
    pm2 logs $PRISMA_STUDIO_NAME
    ;;
  *)
    echo "用法: $0 {start|stop|restart|status|logs}"
    echo ""
    echo "命令说明:"
    echo "  start   - 启动 Prisma Studio"
    echo "  stop    - 停止 Prisma Studio"
    echo "  restart - 重启 Prisma Studio"
    echo "  status  - 查看状态"
    echo "  logs    - 查看日志"
    exit 1
    ;;
esac 
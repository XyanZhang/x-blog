#!/bin/bash

# 简化版 Next.js 项目部署脚本
# 仅支持IP访问，无需域名配置

set -e

echo "🚀 开始简化部署 Next.js 项目..."

# 获取服务器IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
echo "📡 检测到服务器IP: $SERVER_IP"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，正在安装..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 安装 pnpm..."
    npm install -g pnpm
fi

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    echo "⚡ 安装 PM2..."
    npm install -g pm2
fi

# 配置防火墙
echo "🔥 配置防火墙..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 3000/tcp
    sudo ufw allow 5555/tcp
    echo "✅ UFW防火墙已配置"
elif command -v iptables &> /dev/null; then
    sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
    sudo iptables -A INPUT -p tcp --dport 5555 -j ACCEPT
    echo "✅ iptables防火墙已配置"
else
    echo "⚠️  未检测到防火墙，请手动确保3000和5555端口开放"
fi

# 创建应用目录
APP_DIR="/var/www/x-blog"
echo "📁 创建应用目录: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# 进入应用目录
cd $APP_DIR

# 如果项目已存在，拉取最新代码
if [ -d ".git" ]; then
    echo "📥 拉取最新代码..."
    git pull origin main
else
    echo "📥 克隆项目代码..."
    # 请替换为你的实际Git仓库地址
    echo "⚠️  请手动将项目代码复制到此目录: $APP_DIR"
    echo "   或者修改此脚本中的Git仓库地址"
    exit 1
fi

# 安装依赖
echo "📦 安装项目依赖..."
pnpm install

# 创建环境变量文件
echo "🔧 创建环境变量文件..."
cat > .env.local << EOF
# 数据库配置
DATABASE_URL="file:./blog.db"

# NextAuth 配置
NEXTAUTH_URL="http://$SERVER_IP:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# 其他配置
NODE_ENV="production"
HOSTNAME="0.0.0.0"
PORT="3000"
EOF

echo "✅ 环境变量文件已创建: .env.local"

# 构建项目
echo "🔨 构建项目..."
pnpm build

# 数据库迁移
echo "🗄️  运行数据库迁移..."
pnpm db:push

# 停止现有进程
echo "🛑 停止现有进程..."
pm2 delete my-next 2>/dev/null || true
pm2 delete prisma-studio 2>/dev/null || true

# 启动应用
echo "🚀 启动应用..."
pm2 start ecosystem.config.js
pm2 save

# 等待应用启动
echo "⏳ 等待应用启动..."
sleep 5

# 检查应用状态
echo "🔍 检查应用状态..."
if pm2 list | grep -q "my-next.*online"; then
    echo "✅ Next.js应用启动成功"
else
    echo "❌ Next.js应用启动失败"
    echo "📝 查看错误日志:"
    pm2 logs my-next --lines 20
    exit 1
fi

# 检查端口是否可访问
echo "🔍 检查端口可访问性..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 本地3000端口可访问"
else
    echo "❌ 本地3000端口无法访问"
    echo "📝 查看应用日志:"
    pm2 logs my-next --lines 10
fi

# 配置PM2开机自启
pm2 startup 2>/dev/null || echo "⚠️  PM2开机自启配置失败，请手动运行: pm2 startup"

echo ""
echo "🎉 部署完成！"
echo "📊 查看应用状态: pm2 status"
echo "📝 查看日志: pm2 logs my-next"
echo "🌐 应用访问地址: http://$SERVER_IP:3000"
echo "🗄️  Prisma Studio 地址: http://$SERVER_IP:5555"
echo ""
echo "🔧 常用命令:"
echo "   重启应用: pm2 restart my-next"
echo "   重启 Prisma Studio: pm2 restart prisma-studio"
echo "   停止应用: pm2 stop my-next"
echo "   停止 Prisma Studio: pm2 stop prisma-studio"
echo "   查看状态: pm2 status"
echo "   查看日志: pm2 logs my-next"
echo "   查看 Prisma Studio 日志: pm2 logs prisma-studio"
echo ""
echo "⚠️  注意事项:"
echo "   1. 已自动配置防火墙开放3000和5555端口"
echo "   2. 如果使用云服务器，请在安全组中开放3000和5555端口"
echo "   3. Prisma Studio 仅用于开发/管理，生产环境建议关闭"
echo "   4. 如需通过80端口访问，请配置Nginx反向代理"
echo "   5. 如果仍然无法访问，请检查云服务器安全组设置" 
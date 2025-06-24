#!/bin/bash

# Next.js 项目部署脚本
# 适用于 Ubuntu/Debian 服务器，支持IP访问

set -e

echo "🚀 开始部署 Next.js 项目..."

# 检查 Node.js 版本
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，正在安装..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo "📦 安装 pnpm..."
    npm install -g pnpm
fi

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "⚡ 安装 PM2..."
    npm install -g pm2
fi

# 创建应用目录
APP_DIR="/var/www/my-next"
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
    # 替换为你的 Git 仓库地址
    git clone https://github.com/yourusername/my-next.git .
fi

# 安装依赖
echo "📦 安装项目依赖..."
pnpm install

# 设置环境变量
if [ ! -f ".env.local" ]; then
    echo "🔧 创建环境变量文件..."
    cat > .env.local << EOF
# 数据库配置
DATABASE_URL="file:./blog.db"

# NextAuth 配置（使用IP地址）
NEXTAUTH_URL="http://$(curl -s ifconfig.me):3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# 其他配置
NODE_ENV="production"
EOF
    echo "⚠️  请编辑 .env.local 文件，设置正确的环境变量"
    echo "📝 当前服务器IP: $(curl -s ifconfig.me)"
fi

# 构建项目
echo "🔨 构建项目..."
pnpm build

# 数据库迁移
echo "🗄️  运行数据库迁移..."
pnpm db:push

# 启动应用
echo "🚀 启动应用..."
pm2 delete my-next 2>/dev/null || true
pm2 start npm --name "my-next" -- start
pm2 save
pm2 startup

echo "✅ 部署完成！"
echo "📊 查看应用状态: pm2 status"
echo "📝 查看日志: pm2 logs my-next"
echo "🌐 应用运行在: http://$(curl -s ifconfig.me):3000"
echo "🔧 如需通过Nginx访问，请配置Nginx反向代理" 
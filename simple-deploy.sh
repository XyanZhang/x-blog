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
    echo "✅ Node.js 安装完成"
else
    echo "✅ Node.js 已安装: $(node --version)"
fi

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm 未安装，正在安装..."
    npm install -g pnpm
    echo "✅ pnpm 安装完成"
else
    echo "✅ pnpm 已安装: $(pnpm --version)"
fi

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    echo "⚡ PM2 未安装，正在安装..."
    npm install -g pm2
    echo "✅ PM2 安装完成"
else
    echo "✅ PM2 已安装: $(pm2 --version | head -n1)"
fi

# 配置防火墙
echo "🔥 配置防火墙..."
if command -v ufw &> /dev/null; then
    # 检查端口是否已经开放
    if ! sudo ufw status | grep -q "3000/tcp"; then
        sudo ufw allow 3000/tcp
        echo "✅ 已开放3000端口"
    else
        echo "✅ 3000端口已开放"
    fi
    if ! sudo ufw status | grep -q "5555/tcp"; then
        sudo ufw allow 5555/tcp
        echo "✅ 已开放5555端口"
    else
        echo "✅ 5555端口已开放"
    fi
    echo "✅ UFW防火墙已配置"
elif command -v iptables &> /dev/null; then
    # 检查iptables规则是否已存在
    if ! sudo iptables -L -n | grep -q "3000"; then
        sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
        echo "✅ 已添加3000端口规则"
    else
        echo "✅ 3000端口规则已存在"
    fi
    if ! sudo iptables -L -n | grep -q "5555"; then
        sudo iptables -A INPUT -p tcp --dport 5555 -j ACCEPT
        echo "✅ 已添加5555端口规则"
    else
        echo "✅ 5555端口规则已存在"
    fi
    echo "✅ iptables防火墙已配置"
else
    echo "⚠️  未检测到防火墙，请手动确保3000和5555端口开放"
fi

# 创建应用目录
APP_DIR="/var/www/x-blog"
echo "📁 检查应用目录: $APP_DIR"
if [ ! -d "$APP_DIR" ]; then
    echo "📁 创建应用目录..."
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
    echo "✅ 应用目录已创建"
else
    echo "✅ 应用目录已存在"
fi

# 进入应用目录
cd $APP_DIR

# 如果项目已存在，拉取最新代码
if [ -d ".git" ]; then
    echo "📥 拉取最新代码..."
    git pull origin main
    echo "✅ 代码已更新"
else
    echo "📥 克隆项目代码..."
    # 请替换为你的实际Git仓库地址
    echo "⚠️  请手动将项目代码复制到此目录: $APP_DIR"
    echo "   或者修改此脚本中的Git仓库地址"
    exit 1
fi

# 检查并安装依赖
echo "📦 检查项目依赖..."
if [ ! -d "node_modules" ] || [ ! -f "pnpm-lock.yaml" ]; then
    echo "📦 安装项目依赖..."
    pnpm install
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装，跳过安装步骤"
fi

# 检查并生成Prisma客户端
echo "🔧 检查Prisma客户端..."
if [ ! -d "node_modules/@prisma/client" ]; then
    echo "🔧 生成Prisma客户端..."
    pnpm prisma generate
    echo "✅ Prisma客户端已生成"
else
    echo "✅ Prisma客户端已存在"
fi

# 检查并创建环境变量文件
echo "🔧 检查环境变量文件..."
if [ ! -f ".env.local" ]; then
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
else
    echo "✅ 环境变量文件已存在"
    # 检查是否需要更新NEXTAUTH_URL
    if ! grep -q "NEXTAUTH_URL.*$SERVER_IP" .env.local; then
        echo "🔄 更新NEXTAUTH_URL..."
        sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=\"http://$SERVER_IP:3000\"|" .env.local
        echo "✅ NEXTAUTH_URL已更新"
    fi
fi

# 检查并构建项目
echo "🔨 检查构建文件..."
if [ ! -f ".next/standalone/server.js" ]; then
    echo "🔨 构建项目..."
    pnpm build
    echo "✅ 项目构建完成"
else
    echo "✅ 构建文件已存在，跳过构建步骤"
fi

# 检查standalone文件
echo "🔍 检查standalone文件..."
if [ ! -f ".next/standalone/server.js" ]; then
    echo "❌ 未找到server.js文件，构建可能失败"
    echo "📝 检查构建日志..."
    exit 1
else
    echo "✅ 找到server.js文件: .next/standalone/server.js"
fi

# 设置文件权限
echo "🔧 设置文件权限..."
chmod +x .next/standalone/server.js

# 检查并创建数据库
echo "🗄️  检查数据库..."
if [ ! -f "prisma/blog.db" ]; then
    echo "🗄️  创建数据库..."
    pnpm db:push
    echo "✅ 数据库已创建"
else
    echo "✅ 数据库文件已存在"
fi

# 停止现有进程
echo "🛑 停止现有进程..."
pm2 delete my-next 2>/dev/null || echo "✅ 无现有my-next进程"
pm2 delete prisma-studio 2>/dev/null || echo "✅ 无现有prisma-studio进程"

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
echo "🔧 配置PM2开机自启..."
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
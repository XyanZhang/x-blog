#!/bin/bash

# 简化版 Next.js 项目部署脚本
# 仅支持IP访问，无需域名配置

# 导入工具函数
source scripts/utils.sh

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
    # 尝试其他可能的pnpm路径
    if [ -f "$HOME/.nvm/versions/node/$(node --version)/bin/pnpm" ]; then
        echo "✅ pnpm 已安装 (通过nvm): $HOME/.nvm/versions/node/$(node --version)/bin/pnpm"
        # 创建软链接到PATH
        sudo ln -sf "$HOME/.nvm/versions/node/$(node --version)/bin/pnpm" /usr/local/bin/pnpm
        echo "✅ 已创建pnpm软链接"
    elif [ -f "$HOME/.local/share/pnpm/pnpm" ]; then
        echo "✅ pnpm 已安装 (本地安装): $HOME/.local/share/pnpm/pnpm"
        # 添加到PATH
        export PATH="$HOME/.local/share/pnpm:$PATH"
    elif [ -f "/usr/local/bin/pnpm" ]; then
        echo "✅ pnpm 已安装 (全局安装): /usr/local/bin/pnpm"
    else
        echo "📦 pnpm 未安装，正在安装..."
        npm install -g pnpm
        echo "✅ pnpm 安装完成"
    fi
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

# 检查并安装必要工具
check_and_install_tools

# 检查项目依赖
check_project_dependencies

# 检查Prisma客户端
check_prisma_client

# 检查数据库文件
check_database

# 检查环境变量文件
check_env_file

# 检查构建文件
check_build_files

# 修复静态资源问题
fix_static_assets

# 配置防火墙
echo "🔥 配置防火墙..."
if command -v ufw &> /dev/null; then
    echo "使用 UFW 配置防火墙..."
    sudo ufw allow 3000/tcp
    sudo ufw allow 5555/tcp
    echo "✅ UFW 防火墙规则已配置"
elif command -v iptables &> /dev/null; then
    echo "使用 iptables 配置防火墙..."
    sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
    sudo iptables -A INPUT -p tcp --dport 5555 -j ACCEPT
    echo "✅ iptables 防火墙规则已配置"
else
    echo "⚠️  未找到防火墙工具，请手动配置端口 3000 和 5555"
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

# 复制public目录
if [ -d "public" ] && [ ! -d ".next/standalone/public" ]; then
    echo "📝 复制public目录..."
    cp -r public .next/standalone/
    echo "✅ public目录已复制"
fi

# 设置文件权限
echo "🔧 设置文件权限..."
chmod +x .next/standalone/server.js
chmod -R 755 .next/standalone/.next/static 2>/dev/null || true
chmod -R 755 .next/standalone/public 2>/dev/null || true

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

# 重启应用
restart_application

# 等待应用启动
wait_for_app

# 测试应用访问
test_app_access

# 显示完成信息
show_completion_message

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
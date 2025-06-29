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

# 检查项目依赖
echo "📦 检查项目依赖..."
if [ ! -d "node_modules" ] || [ ! -f "pnpm-lock.yaml" ]; then
    echo "📦 安装项目依赖..."
    pnpm install
    echo "✅ 依赖安装完成"
else
    echo "✅ 项目依赖已安装"
fi

# 检查Prisma客户端
echo "🔍 检查Prisma客户端..."
if [ ! -d "node_modules/@prisma/client" ]; then
    echo "❌ Prisma客户端未安装"
    echo "🔧 生成Prisma客户端..."
    pnpm prisma generate
    echo "✅ Prisma客户端已生成"
else
    echo "✅ Prisma客户端已安装"
    # 检查是否需要重新生成
    if [ ! -f "node_modules/@prisma/client/index.js" ]; then
        echo "⚠️  Prisma客户端文件不完整，重新生成..."
        pnpm prisma generate
        echo "✅ Prisma客户端已重新生成"
    fi
fi

# 检查数据库文件
echo "🗄️  检查数据库文件..."
if [ ! -f "prisma/blog.db" ]; then
    echo "❌ 数据库文件不存在"
    echo "📝 创建数据库..."
    pnpm db:push
    echo "✅ 数据库已创建"
else
    echo "✅ 数据库文件存在"
    ls -la prisma/blog.db
fi

# 检查环境变量文件
echo "🔧 检查环境变量文件..."
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local文件不存在"
    echo "📝 创建环境变量文件..."
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
    echo "✅ 已创建.env.local文件"
else
    echo "✅ .env.local文件存在"
    # 检查是否需要更新NEXTAUTH_URL
    if ! grep -q "NEXTAUTH_URL" .env.local; then
        echo "🔄 更新NEXTAUTH_URL..."
        echo "NEXTAUTH_URL=\"http://$SERVER_IP:3000\"" >> .env.local
        echo "✅ NEXTAUTH_URL已添加"
    fi
fi

# 检查构建文件
echo "🔍 检查构建文件..."
if [ ! -f ".next/standalone/server.js" ]; then
    echo "❌ standalone服务器文件不存在"
    echo "🔨 构建项目..."
    pnpm build
    echo "✅ 项目构建完成"
else
    echo "✅ standalone服务器文件存在"
fi

# 修复静态资源问题
echo "🔧 修复静态资源问题..."
if [ ! -d ".next/standalone/.next/static" ] && [ -d ".next/static" ]; then
    echo "📝 复制静态资源..."
    mkdir -p .next/standalone/.next/static
    cp -r .next/static/* .next/standalone/.next/static/
    echo "✅ 静态资源已复制"
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

# 重启应用
echo "🔄 重启应用..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "my-next"; then
        echo "🔄 重启现有应用..."
        pm2 restart my-next
    else
        echo "🚀 启动新应用..."
        pm2 start ecosystem.config.js
    fi
    echo "✅ 应用已重启"
else
    echo "⚠️  PM2未安装"
fi

# 等待应用启动
echo "⏳ 等待应用启动..."
sleep 5

# 测试应用访问
echo "🧪 测试应用访问..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 应用可访问"
else
    echo "❌ 应用无法访问"
    echo "📝 查看应用日志:"
    pm2 logs my-next --lines 10
fi

# 显示完成信息
echo ""
echo "🎉 部署完成！"
echo ""
echo "📝 常用命令:"
echo "   查看应用状态: pm2 status"
echo "   查看应用日志: pm2 logs my-next"
echo "   重启应用: pm2 restart my-next"
echo "   停止应用: pm2 stop my-next" 
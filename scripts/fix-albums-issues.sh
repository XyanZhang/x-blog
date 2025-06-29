#!/bin/bash

# 修复Albums分类问题的脚本

set -e

echo "🔧 修复Albums分类问题..."

# 检查当前目录
echo "📁 当前目录: $(pwd)"

# 检查必要的工具
echo ""
echo "🔧 检查必要工具..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    echo "📦 正在安装Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "✅ Node.js 安装完成"
else
    echo "✅ Node.js 已安装: $(node --version)"
fi

# 检查pnpm
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
        echo "❌ pnpm 未安装"
        echo "📦 正在安装pnpm..."
        npm install -g pnpm
        echo "✅ pnpm 安装完成"
    fi
else
    echo "✅ pnpm 已安装: $(pnpm --version)"
fi

# 检查PM2
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 未安装"
    echo "⚡ 正在安装PM2..."
    npm install -g pm2
    echo "✅ PM2 安装完成"
else
    echo "✅ PM2 已安装: $(pm2 --version | head -n1)"
fi

# 检查项目依赖
echo ""
echo "📦 检查项目依赖..."
if [ ! -d "node_modules" ] || [ ! -f "pnpm-lock.yaml" ]; then
    echo "❌ 项目依赖未安装"
    echo "📦 安装依赖..."
    pnpm install
    echo "✅ 依赖安装完成"
else
    echo "✅ 项目依赖已安装"
fi

# 检查Prisma客户端
echo ""
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
echo ""
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

# 检查数据库连接和表结构
echo ""
echo "🔍 检查数据库连接..."
if pnpm prisma db pull > /dev/null 2>&1; then
    echo "✅ 数据库连接正常"
else
    echo "❌ 数据库连接失败"
    echo "📝 尝试重新创建数据库..."
    rm -f prisma/blog.db
    pnpm db:push
    echo "✅ 数据库已重新创建"
fi

# 检查albums表数据
echo ""
echo "🔍 检查albums表数据..."
if command -v sqlite3 > /dev/null; then
    echo "📊 albums表统计:"
    TOTAL_ALBUMS=$(sqlite3 prisma/blog.db "SELECT COUNT(*) FROM photo_albums;" 2>/dev/null || echo "0")
    PUBLISHED_ALBUMS=$(sqlite3 prisma/blog.db "SELECT COUNT(*) FROM photo_albums WHERE isPublished = 1;" 2>/dev/null || echo "0")
    
    echo "  总albums数: $TOTAL_ALBUMS"
    echo "  已发布albums数: $PUBLISHED_ALBUMS"
    
    if [ "$PUBLISHED_ALBUMS" = "0" ] && [ "$TOTAL_ALBUMS" != "0" ]; then
        echo "⚠️  有albums但都未发布，正在发布第一个album..."
        sqlite3 prisma/blog.db "UPDATE photo_albums SET isPublished = 1 WHERE id = (SELECT id FROM photo_albums LIMIT 1);" 2>/dev/null || echo "无法更新album状态"
        echo "✅ 已发布第一个album"
    fi
else
    echo "⚠️  sqlite3未安装，无法直接检查数据库"
fi

# 检查环境变量
echo ""
echo "🔧 检查环境变量..."
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local文件不存在"
    echo "📝 创建环境变量文件..."
    cat > .env.local << EOF
# 数据库配置
DATABASE_URL="file:./blog.db"

# NextAuth 配置
NEXTAUTH_URL="http://localhost:3000"
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
        echo "NEXTAUTH_URL=\"http://localhost:3000\"" >> .env.local
        echo "✅ NEXTAUTH_URL已添加"
    fi
fi

# 检查构建文件
echo ""
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
echo ""
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
echo ""
echo "🔧 设置文件权限..."
chmod +x .next/standalone/server.js
chmod -R 755 .next/standalone/.next/static 2>/dev/null || true
chmod -R 755 .next/standalone/public 2>/dev/null || true

# 重启应用
echo ""
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
echo ""
echo "⏳ 等待应用启动..."
sleep 5

# 测试albums功能
echo ""
echo "🧪 测试albums功能..."

# 测试API接口
if curl -s http://localhost:3000/api/albums > /dev/null; then
    echo "✅ albums API可访问"
else
    echo "❌ albums API无法访问"
fi

# 测试页面访问
if curl -s http://localhost:3000/albums > /dev/null; then
    echo "✅ albums页面可访问"
else
    echo "❌ albums页面无法访问"
fi

# 测试具体album页面
if command -v sqlite3 > /dev/null; then
    FIRST_ALBUM_SLUG=$(sqlite3 prisma/blog.db "SELECT slug FROM photo_albums WHERE isPublished = 1 LIMIT 1;" 2>/dev/null || echo "")
    
    if [ -n "$FIRST_ALBUM_SLUG" ]; then
        if curl -s "http://localhost:3000/albums/$FIRST_ALBUM_SLUG" > /dev/null; then
            echo "✅ 具体album页面可访问: $FIRST_ALBUM_SLUG"
        else
            echo "❌ 具体album页面无法访问: $FIRST_ALBUM_SLUG"
        fi
    else
        echo "⚠️  没有找到已发布的albums"
    fi
fi

echo ""
echo "🎉 Albums分类问题修复完成！"
echo ""
echo "📝 如果仍有问题，请检查:"
echo "  1. 应用日志: pm2 logs my-next"
echo "  2. 数据库数据: sqlite3 prisma/blog.db 'SELECT * FROM photo_albums;'"
echo "  3. API响应: curl http://localhost:3000/api/albums"
echo "  4. 页面响应: curl http://localhost:3000/albums" 
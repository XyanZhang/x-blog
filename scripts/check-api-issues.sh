#!/bin/bash

# API接口问题诊断脚本

set -e

echo "🔍 开始诊断API接口问题..."

# 获取服务器IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
echo "📡 服务器IP: $SERVER_IP"

# 检查应用是否运行
echo ""
echo "📊 检查应用状态..."
if pm2 list | grep -q "my-next.*online"; then
    echo "✅ Next.js应用正在运行"
else
    echo "❌ Next.js应用未运行"
    echo "📝 启动应用..."
    pm2 start ecosystem.config.js
    sleep 3
fi

# 检查端口是否可访问
echo ""
echo "🔍 检查端口可访问性..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 本地3000端口可访问"
else
    echo "❌ 本地3000端口无法访问"
fi

# 测试API接口
echo ""
echo "🧪 测试API接口..."

# 测试分类接口
echo "📝 测试分类接口..."
if curl -s http://localhost:3000/api/categories > /dev/null; then
    echo "✅ /api/categories 可访问"
    # 显示响应内容
    echo "📄 响应内容:"
    curl -s http://localhost:3000/api/categories | head -c 200
    echo "..."
else
    echo "❌ /api/categories 无法访问"
fi

# 测试认证接口
echo ""
echo "📝 测试认证接口..."
if curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"login":"test","password":"test"}' > /dev/null; then
    echo "✅ /api/auth/login 可访问"
else
    echo "❌ /api/auth/login 无法访问"
fi

# 测试文章接口
echo ""
echo "📝 测试文章接口..."
if curl -s http://localhost:3000/api/admin/posts > /dev/null; then
    echo "✅ /api/admin/posts 可访问"
else
    echo "❌ /api/admin/posts 无法访问"
fi

# 测试相册接口
echo ""
echo "📝 测试相册接口..."
if curl -s http://localhost:3000/api/albums > /dev/null; then
    echo "✅ /api/albums 可访问"
else
    echo "❌ /api/albums 无法访问"
fi

# 测试照片接口
echo ""
echo "📝 测试照片接口..."
if curl -s http://localhost:3000/api/photos > /dev/null; then
    echo "✅ /api/photos 可访问"
else
    echo "❌ /api/photos 无法访问"
fi

# 检查应用日志
echo ""
echo "📝 检查应用日志 (最近20行)..."
pm2 logs my-next --lines 20 --nostream || echo "无法获取应用日志"

# 检查数据库连接
echo ""
echo "🗄️  检查数据库连接..."
if [ -f "prisma/blog.db" ]; then
    echo "✅ 数据库文件存在"
    ls -la prisma/blog.db
else
    echo "❌ 数据库文件不存在"
fi

# 检查环境变量
echo ""
echo "🔧 检查环境变量..."
echo "DATABASE_URL: ${DATABASE_URL:-'未设置'}"
echo "NODE_ENV: ${NODE_ENV:-'未设置'}"

# 检查Prisma客户端
echo ""
echo "🔍 检查Prisma客户端..."
if [ -d "node_modules/@prisma/client" ]; then
    echo "✅ Prisma客户端已安装"
else
    echo "❌ Prisma客户端未安装"
fi

# 检查构建文件
echo ""
echo "🔍 检查构建文件..."
if [ -f ".next/standalone/server.js" ]; then
    echo "✅ standalone服务器文件存在"
else
    echo "❌ standalone服务器文件不存在"
fi

# 提供修复建议
echo ""
echo "🔧 修复建议:"
echo "1. 如果数据库文件不存在，运行: pnpm db:push"
echo "2. 如果Prisma客户端未安装，运行: pnpm install"
echo "3. 如果构建文件不存在，运行: pnpm build"
echo "4. 重启应用: pm2 restart my-next"
echo "5. 检查环境变量文件 .env.local"

# 提供快速修复选项
echo ""
read -p "是否要尝试自动修复? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔧 开始自动修复..."
    
    # 检查并安装依赖
    if [ ! -d "node_modules/@prisma/client" ]; then
        echo "📦 安装Prisma客户端..."
        pnpm install
    fi
    
    # 检查并生成Prisma客户端
    echo "🔧 生成Prisma客户端..."
    pnpm prisma generate
    
    # 检查并推送数据库
    if [ ! -f "prisma/blog.db" ]; then
        echo "🗄️  创建数据库..."
        pnpm db:push
    fi
    
    # 检查并构建项目
    if [ ! -f ".next/standalone/server.js" ]; then
        echo "🔨 构建项目..."
        pnpm build
    fi
    
    # 重启应用
    echo "🔄 重启应用..."
    pm2 restart my-next
    
    # 等待启动
    sleep 5
    
    echo "🎉 修复完成！请再次测试API接口"
fi 
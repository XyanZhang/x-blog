#!/bin/bash

# Albums分类访问异常诊断脚本

set -e

echo "🔍 诊断Albums分类访问异常..."

# 检查应用是否运行
echo ""
echo "📊 检查应用状态..."
if pm2 list | grep -q "my-next.*online"; then
    echo "✅ Next.js应用正在运行"
else
    echo "❌ Next.js应用未运行"
    exit 1
fi

# 检查数据库连接
echo ""
echo "🗄️  检查数据库连接..."
if [ -f "prisma/blog.db" ]; then
    echo "✅ 数据库文件存在"
    ls -la prisma/blog.db
else
    echo "❌ 数据库文件不存在"
    exit 1
fi

# 检查albums API接口
echo ""
echo "🔍 检查albums API接口..."
if curl -s http://localhost:3000/api/albums > /dev/null; then
    echo "✅ /api/albums 接口可访问"
    
    # 获取albums数据
    ALBUMS_RESPONSE=$(curl -s http://localhost:3000/api/albums)
    echo "📄 API响应状态:"
    echo "$ALBUMS_RESPONSE" | head -c 200
    echo "..."
else
    echo "❌ /api/albums 接口无法访问"
fi

# 检查albums页面访问
echo ""
echo "🔍 检查albums页面访问..."
if curl -s http://localhost:3000/albums > /dev/null; then
    echo "✅ /albums 页面可访问"
else
    echo "❌ /albums 页面无法访问"
fi

# 检查数据库中的albums数据
echo ""
echo "🔍 检查数据库中的albums数据..."
if command -v sqlite3 > /dev/null; then
    echo "📊 数据库中的albums统计:"
    sqlite3 prisma/blog.db "SELECT COUNT(*) as total_albums FROM photo_albums;" 2>/dev/null || echo "无法查询数据库"
    
    echo "📊 已发布的albums统计:"
    sqlite3 prisma/blog.db "SELECT COUNT(*) as published_albums FROM photo_albums WHERE isPublished = 1;" 2>/dev/null || echo "无法查询数据库"
    
    echo "📊 albums的slug列表:"
    sqlite3 prisma/blog.db "SELECT slug, title, isPublished FROM photo_albums LIMIT 10;" 2>/dev/null || echo "无法查询数据库"
else
    echo "⚠️  sqlite3未安装，无法直接查询数据库"
fi

# 检查Prisma客户端
echo ""
echo "🔍 检查Prisma客户端..."
if [ -d "node_modules/@prisma/client" ]; then
    echo "✅ Prisma客户端已安装"
else
    echo "❌ Prisma客户端未安装"
fi

# 检查环境变量
echo ""
echo "🔧 检查环境变量..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local文件存在"
    echo "📄 DATABASE_URL: $(grep DATABASE_URL .env.local || echo '未设置')"
else
    echo "❌ .env.local文件不存在"
fi

# 检查应用日志
echo ""
echo "📝 检查应用日志 (最近20行)..."
pm2 logs my-next --lines 20 --nostream || echo "无法获取应用日志"

# 测试具体的album页面访问
echo ""
echo "🧪 测试具体album页面访问..."
if command -v sqlite3 > /dev/null; then
    # 获取第一个已发布的album slug
    FIRST_ALBUM_SLUG=$(sqlite3 prisma/blog.db "SELECT slug FROM photo_albums WHERE isPublished = 1 LIMIT 1;" 2>/dev/null || echo "")
    
    if [ -n "$FIRST_ALBUM_SLUG" ]; then
        echo "📄 测试访问album: $FIRST_ALBUM_SLUG"
        if curl -s "http://localhost:3000/albums/$FIRST_ALBUM_SLUG" > /dev/null; then
            echo "✅ /albums/$FIRST_ALBUM_SLUG 可访问"
        else
            echo "❌ /albums/$FIRST_ALBUM_SLUG 无法访问"
        fi
    else
        echo "⚠️  没有找到已发布的albums"
    fi
else
    echo "⚠️  无法测试具体album页面（sqlite3未安装）"
fi

# 检查文件权限
echo ""
echo "🔧 检查文件权限..."
if [ -f "prisma/blog.db" ]; then
    echo "📄 数据库文件权限:"
    ls -la prisma/blog.db
fi

# 检查构建文件
echo ""
echo "🔍 检查构建文件..."
if [ -f ".next/standalone/server.js" ]; then
    echo "✅ standalone服务器文件存在"
else
    echo "❌ standalone服务器文件不存在"
fi

# 检查组件文件
echo ""
echo "🔍 检查组件文件..."
if [ -f "src/components/photos/album-grid.tsx" ]; then
    echo "✅ album-grid组件存在"
else
    echo "❌ album-grid组件不存在"
fi

if [ -f "src/app/(pages)/albums/page.tsx" ]; then
    echo "✅ albums页面存在"
else
    echo "❌ albums页面不存在"
fi

# 提供修复建议
echo ""
echo "🔧 修复建议:"
echo "1. 如果API接口无法访问，检查Prisma连接: pnpm prisma db pull"
echo "2. 如果页面无法访问，检查构建文件: pnpm build"
echo "3. 如果数据库查询失败，检查数据库文件: ls -la prisma/blog.db"
echo "4. 重启应用: pm2 restart my-next"
echo "5. 检查应用日志: pm2 logs my-next"

# 提供快速修复选项
echo ""
read -p "是否要尝试自动修复? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔧 开始自动修复..."
    
    # 检查Prisma客户端
    if [ ! -d "node_modules/@prisma/client" ]; then
        echo "🔧 生成Prisma客户端..."
        pnpm prisma generate
    fi
    
    # 检查数据库连接
    echo "🔍 测试数据库连接..."
    if pnpm prisma db pull > /dev/null 2>&1; then
        echo "✅ 数据库连接正常"
    else
        echo "❌ 数据库连接失败，尝试重新创建..."
        pnpm db:push
    fi
    
    # 重新构建项目
    echo "🔨 重新构建项目..."
    pnpm build
    
    # 重启应用
    echo "🔄 重启应用..."
    pm2 restart my-next
    
    # 等待启动
    sleep 5
    
    # 再次测试
    echo "🧪 再次测试albums访问..."
    if curl -s http://localhost:3000/api/albums > /dev/null; then
        echo "✅ albums API现在可访问"
    else
        echo "❌ albums API仍然无法访问"
    fi
    
    if curl -s http://localhost:3000/albums > /dev/null; then
        echo "✅ albums页面现在可访问"
    else
        echo "❌ albums页面仍然无法访问"
    fi
    
    echo "🎉 修复完成！"
fi 
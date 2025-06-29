#!/bin/bash

# 修复standalone模式下静态资源404问题的脚本

set -e

echo "🔧 修复静态资源404问题..."

# 检查当前目录
echo "📁 当前目录: $(pwd)"

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

# 检查静态资源目录
echo ""
echo "🔍 检查静态资源..."
if [ -d ".next/static" ]; then
    echo "✅ 源静态资源目录存在"
    ls -la .next/static/
else
    echo "❌ 源静态资源目录不存在"
    echo "🔨 重新构建项目..."
    pnpm build
fi

# 检查standalone中的静态资源
echo ""
echo "🔍 检查standalone中的静态资源..."
if [ -d ".next/standalone/.next/static" ]; then
    echo "✅ standalone中的静态资源目录存在"
    ls -la .next/standalone/.next/static/
else
    echo "❌ standalone中的静态资源目录不存在"
    echo "📝 复制静态资源..."
    
    # 创建目录
    mkdir -p .next/standalone/.next/static
    
    # 复制静态资源
    if [ -d ".next/static" ]; then
        cp -r .next/static/* .next/standalone/.next/static/
        echo "✅ 静态资源已复制"
    else
        echo "❌ 源静态资源目录不存在，重新构建..."
        pnpm build
        if [ -d ".next/static" ]; then
            cp -r .next/static/* .next/standalone/.next/static/
            echo "✅ 静态资源已复制"
        else
            echo "❌ 构建后仍无静态资源，检查构建配置"
            exit 1
        fi
    fi
fi

# 检查public目录
echo ""
echo "🔍 检查public目录..."
if [ -d "public" ]; then
    echo "✅ public目录存在"
    if [ ! -d ".next/standalone/public" ]; then
        echo "📝 复制public目录..."
        cp -r public .next/standalone/
        echo "✅ public目录已复制"
    else
        echo "✅ standalone中的public目录已存在"
    fi
else
    echo "⚠️  public目录不存在"
fi

# 检查文件权限
echo ""
echo "🔧 设置文件权限..."
chmod +x .next/standalone/server.js
chmod -R 755 .next/standalone/.next/static
chmod -R 755 .next/standalone/public 2>/dev/null || true
echo "✅ 文件权限已设置"

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

# 测试静态资源访问
echo ""
echo "🧪 测试静态资源访问..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 主页可访问"
    
    # 获取页面中的JS文件链接
    echo "🔍 检查页面中的JS文件..."
    JS_FILES=$(curl -s http://localhost:3000 | grep -o 'src="[^"]*\.js[^"]*"' | head -5)
    
    if [ -n "$JS_FILES" ]; then
        echo "📄 发现的JS文件:"
        echo "$JS_FILES" | while read -r js_file; do
            # 提取文件名
            filename=$(echo "$js_file" | sed 's/src="//' | sed 's/"//')
            echo "  - $filename"
            
            # 测试文件是否可访问
            if curl -s "http://localhost:3000$filename" > /dev/null; then
                echo "    ✅ 可访问"
            else
                echo "    ❌ 不可访问"
            fi
        done
    else
        echo "⚠️  未发现JS文件"
    fi
else
    echo "❌ 主页不可访问"
fi

echo ""
echo "🎉 静态资源修复完成！"
echo ""
echo "📝 如果仍有404问题，请检查:"
echo "  1. 浏览器开发者工具中的网络请求"
echo "  2. 应用日志: pm2 logs my-next"
echo "  3. 重新构建项目: pnpm build" 
#!/bin/bash

# 静态资源问题诊断脚本

set -e

echo "🔍 诊断静态资源问题..."

# 检查应用是否运行
echo ""
echo "📊 检查应用状态..."
if pm2 list | grep -q "my-next.*online"; then
    echo "✅ Next.js应用正在运行"
else
    echo "❌ Next.js应用未运行"
    exit 1
fi

# 检查主页访问
echo ""
echo "🔍 检查主页访问..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 主页可访问"
else
    echo "❌ 主页不可访问"
    exit 1
fi

# 获取页面内容并分析静态资源
echo ""
echo "🔍 分析页面静态资源..."
PAGE_CONTENT=$(curl -s http://localhost:3000)

# 查找JS文件
echo "📄 页面中的JS文件:"
JS_FILES=$(echo "$PAGE_CONTENT" | grep -o 'src="[^"]*\.js[^"]*"' | sort | uniq)
if [ -n "$JS_FILES" ]; then
    echo "$JS_FILES" | while read -r js_file; do
        filename=$(echo "$js_file" | sed 's/src="//' | sed 's/"//')
        echo "  - $filename"
        
        # 测试文件访问
        if curl -s "http://localhost:3000$filename" > /dev/null; then
            echo "    ✅ 可访问"
        else
            echo "    ❌ 404错误"
        fi
    done
else
    echo "  ⚠️  未发现JS文件"
fi

# 查找CSS文件
echo ""
echo "📄 页面中的CSS文件:"
CSS_FILES=$(echo "$PAGE_CONTENT" | grep -o 'href="[^"]*\.css[^"]*"' | sort | uniq)
if [ -n "$CSS_FILES" ]; then
    echo "$CSS_FILES" | while read -r css_file; do
        filename=$(echo "$css_file" | sed 's/href="//' | sed 's/"//')
        echo "  - $filename"
        
        # 测试文件访问
        if curl -s "http://localhost:3000$filename" > /dev/null; then
            echo "    ✅ 可访问"
        else
            echo "    ❌ 404错误"
        fi
    done
else
    echo "  ⚠️  未发现CSS文件"
fi

# 检查构建文件
echo ""
echo "🔍 检查构建文件..."
if [ -f ".next/standalone/server.js" ]; then
    echo "✅ standalone服务器文件存在"
else
    echo "❌ standalone服务器文件不存在"
fi

if [ -d ".next/static" ]; then
    echo "✅ 源静态资源目录存在"
    echo "📁 静态资源内容:"
    ls -la .next/static/
else
    echo "❌ 源静态资源目录不存在"
fi

if [ -d ".next/standalone/.next/static" ]; then
    echo "✅ standalone中的静态资源目录存在"
    echo "📁 standalone静态资源内容:"
    ls -la .next/standalone/.next/static/
else
    echo "❌ standalone中的静态资源目录不存在"
fi

# 检查public目录
echo ""
echo "🔍 检查public目录..."
if [ -d "public" ]; then
    echo "✅ public目录存在"
    if [ -d ".next/standalone/public" ]; then
        echo "✅ standalone中的public目录存在"
    else
        echo "❌ standalone中的public目录不存在"
    fi
else
    echo "⚠️  public目录不存在"
fi

# 检查PM2配置
echo ""
echo "🔍 检查PM2配置..."
if [ -f "ecosystem.config.js" ]; then
    echo "✅ PM2配置文件存在"
    echo "📄 当前配置:"
    cat ecosystem.config.js
else
    echo "❌ PM2配置文件不存在"
fi

# 提供修复建议
echo ""
echo "🔧 修复建议:"
echo "1. 如果使用standalone模式，运行: ./scripts/fix-static-assets.sh"
echo "2. 如果使用npm start模式，确保package.json中有start脚本"
echo "3. 重新构建项目: pnpm build"
echo "4. 重启应用: pm2 restart my-next"

# 提供快速修复选项
echo ""
read -p "是否要尝试自动修复? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔧 开始自动修复..."
    
    # 运行静态资源修复脚本
    if [ -f "scripts/fix-static-assets.sh" ]; then
        echo "🔄 运行静态资源修复脚本..."
        ./scripts/fix-static-assets.sh
    else
        echo "📝 手动修复静态资源..."
        
        # 重新构建
        echo "🔨 重新构建项目..."
        pnpm build
        
        # 复制静态资源
        if [ -d ".next/static" ]; then
            echo "📝 复制静态资源..."
            mkdir -p .next/standalone/.next/static
            cp -r .next/static/* .next/standalone/.next/static/
        fi
        
        # 复制public目录
        if [ -d "public" ]; then
            echo "📝 复制public目录..."
            cp -r public .next/standalone/
        fi
        
        # 重启应用
        echo "🔄 重启应用..."
        pm2 restart my-next
    fi
    
    echo "�� 修复完成！请再次测试页面访问"
fi 
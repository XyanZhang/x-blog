#!/bin/bash

# 测试PM2配置脚本

set -e

echo "🧪 测试PM2配置..."

# 检查当前目录
echo "📁 当前目录: $(pwd)"

# 检查server.js文件是否存在
echo "🔍 检查server.js文件..."
if [ -f ".next/standalone/server.js" ]; then
    echo "✅ 找到server.js文件"
    ls -la .next/standalone/server.js
else
    echo "❌ 未找到server.js文件"
    echo "📝 检查.next/standalone目录内容:"
    ls -la .next/standalone/ 2>/dev/null || echo "standalone目录不存在"
    exit 1
fi

# 检查ecosystem.config.js
echo ""
echo "🔍 检查ecosystem.config.js..."
if [ -f "ecosystem.config.js" ]; then
    echo "✅ 找到ecosystem.config.js"
    echo "📝 配置内容:"
    cat ecosystem.config.js
else
    echo "❌ 未找到ecosystem.config.js"
    exit 1
fi

# 测试PM2配置语法
echo ""
echo "🔍 测试PM2配置语法..."
if pm2 ecosystem ecosystem.config.js --dry-run 2>/dev/null; then
    echo "✅ PM2配置语法正确"
else
    echo "❌ PM2配置语法错误"
    echo "📝 尝试解析配置..."
    node -e "
    try {
        const config = require('./ecosystem.config.js');
        console.log('配置解析成功:', JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('配置解析失败:', error.message);
    }
    "
fi

# 检查环境变量
echo ""
echo "🔍 检查环境变量..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "HOSTNAME: $HOSTNAME"

# 模拟启动测试（不实际启动）
echo ""
echo "🧪 模拟启动测试..."
echo "PM2将使用以下配置启动:"
echo "  脚本: .next/standalone/server.js"
echo "  工作目录: $(pwd)"
echo "  环境变量: NODE_ENV=production, PORT=3000, HOSTNAME=0.0.0.0"

echo ""
echo "✅ 配置测试完成！"
echo "📝 如果一切正常，可以运行: pm2 start ecosystem.config.js" 
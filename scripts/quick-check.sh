#!/bin/bash

# 快速环境检查脚本

set -e

echo "🔍 快速环境检查..."

# 检查基本工具
echo ""
echo "🔧 基本工具检查:"
echo -n "Node.js: "
if command -v node &> /dev/null; then
    echo "✅ $(node --version)"
else
    echo "❌ 未安装"
fi

echo -n "pnpm: "
if command -v pnpm &> /dev/null; then
    echo "✅ $(pnpm --version)"
else
    echo "❌ 未安装"
fi

echo -n "PM2: "
if command -v pm2 &> /dev/null; then
    echo "✅ $(pm2 --version | head -n1)"
else
    echo "❌ 未安装"
fi

# 检查项目文件
echo ""
echo "📁 项目文件检查:"
echo -n "package.json: "
if [ -f "package.json" ]; then
    echo "✅ 存在"
else
    echo "❌ 不存在"
fi

echo -n "node_modules: "
if [ -d "node_modules" ]; then
    echo "✅ 存在"
else
    echo "❌ 不存在"
fi

echo -n "Prisma客户端: "
if [ -d "node_modules/@prisma/client" ]; then
    echo "✅ 已安装"
else
    echo "❌ 未安装"
fi

echo -n "Prisma schema: "
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ 存在"
else
    echo "❌ 不存在"
fi

echo -n "数据库文件: "
if [ -f "prisma/blog.db" ]; then
    echo "✅ 存在"
else
    echo "❌ 不存在"
fi

echo -n "环境变量文件: "
if [ -f ".env.local" ]; then
    echo "✅ 存在"
else
    echo "❌ 不存在"
fi

echo -n "构建文件: "
if [ -f ".next/standalone/server.js" ]; then
    echo "✅ 存在"
else
    echo "❌ 不存在"
fi

echo -n "PM2配置: "
if [ -f "ecosystem.config.js" ]; then
    echo "✅ 存在"
else
    echo "❌ 不存在"
fi

# 检查应用状态
echo ""
echo "📊 应用状态检查:"
if command -v pm2 &> /dev/null; then
    echo "PM2进程状态:"
    pm2 list | grep -E "(my-next|prisma-studio)" || echo "  无相关进程"
else
    echo "PM2未安装"
fi

# 检查端口状态
echo ""
echo "🔍 端口状态检查:"
echo -n "3000端口: "
if netstat -tlnp | grep -q ":3000"; then
    echo "✅ 被占用"
else
    echo "❌ 未被占用"
fi

echo -n "5555端口: "
if netstat -tlnp | grep -q ":5555"; then
    echo "✅ 被占用"
else
    echo "❌ 未被占用"
fi

# 检查防火墙
echo ""
echo "🔥 防火墙检查:"
if command -v ufw &> /dev/null; then
    echo "UFW状态:"
    if sudo ufw status | grep -q "3000/tcp"; then
        echo "  ✅ 3000端口已开放"
    else
        echo "  ❌ 3000端口未开放"
    fi
    if sudo ufw status | grep -q "5555/tcp"; then
        echo "  ✅ 5555端口已开放"
    else
        echo "  ❌ 5555端口未开放"
    fi
elif command -v iptables &> /dev/null; then
    echo "iptables状态:"
    if sudo iptables -L -n | grep -q "3000"; then
        echo "  ✅ 3000端口规则存在"
    else
        echo "  ❌ 3000端口规则不存在"
    fi
    if sudo iptables -L -n | grep -q "5555"; then
        echo "  ✅ 5555端口规则存在"
    else
        echo "  ❌ 5555端口规则不存在"
    fi
else
    echo "未检测到防火墙"
fi

# 测试本地访问
echo ""
echo "🧪 本地访问测试:"
echo -n "本地3000端口: "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 可访问"
else
    echo "❌ 不可访问"
fi

# 总结
echo ""
echo "📋 检查总结:"
echo "如果看到 ❌ 的项目，请运行相应的修复脚本:"
echo "  - 端口访问问题: ./scripts/fix-port-access.sh"
echo "  - API接口问题: ./scripts/check-api-issues.sh"
echo "  - Prisma问题: ./scripts/fix-prisma-issues.sh"
echo "  - 完整部署: ./simple-deploy.sh" 
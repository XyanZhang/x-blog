#!/bin/bash

# Prisma问题修复脚本

set -e

echo "🔧 开始修复Prisma问题..."

# 检查当前目录
echo "📁 当前目录: $(pwd)"

# 检查Prisma schema文件
echo ""
echo "🔍 检查Prisma schema..."
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ Prisma schema文件存在"
else
    echo "❌ Prisma schema文件不存在"
    exit 1
fi

# 检查环境变量
echo ""
echo "🔧 检查环境变量..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local文件存在"
    echo "📄 DATABASE_URL: $(grep DATABASE_URL .env.local || echo '未设置')"
else
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
fi

# 检查Prisma客户端
echo ""
echo "🔍 检查Prisma客户端..."
if [ -d "node_modules/@prisma/client" ]; then
    echo "✅ Prisma客户端已安装"
else
    echo "❌ Prisma客户端未安装"
    echo "📦 安装依赖..."
    pnpm install
fi

# 生成Prisma客户端
echo ""
echo "🔧 生成Prisma客户端..."
pnpm prisma generate

# 检查数据库文件
echo ""
echo "🗄️  检查数据库文件..."
if [ -f "prisma/blog.db" ]; then
    echo "✅ 数据库文件存在"
    ls -la prisma/blog.db
else
    echo "❌ 数据库文件不存在"
    echo "📝 创建数据库..."
    pnpm db:push
fi

# 检查数据库连接
echo ""
echo "🔍 测试数据库连接..."
if pnpm prisma db pull > /dev/null 2>&1; then
    echo "✅ 数据库连接正常"
else
    echo "❌ 数据库连接失败"
    echo "📝 尝试重新创建数据库..."
    rm -f prisma/blog.db
    pnpm db:push
fi

# 检查数据库表结构
echo ""
echo "🔍 检查数据库表结构..."
if pnpm prisma db pull > /dev/null 2>&1; then
    echo "✅ 数据库表结构正常"
else
    echo "❌ 数据库表结构有问题"
    echo "📝 重置数据库..."
    pnpm prisma migrate reset --force
fi

# 检查Prisma Studio
echo ""
echo "🔍 检查Prisma Studio..."
if command -v npx > /dev/null; then
    echo "✅ npx可用"
    echo "📝 可以通过以下命令启动Prisma Studio:"
    echo "   pnpm prisma studio"
else
    echo "❌ npx不可用"
fi

# 检查应用中的Prisma导入
echo ""
echo "🔍 检查Prisma导入一致性..."
PRISMA_IMPORTS=$(grep -r "from '@/lib/prisma'" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)
DB_IMPORTS=$(grep -r "from '@/lib/db'" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)

if [ -n "$PRISMA_IMPORTS" ]; then
    echo "⚠️  发现使用@/lib/prisma的文件:"
    echo "$PRISMA_IMPORTS"
    echo "📝 建议统一使用@/lib/db"
fi

if [ -n "$DB_IMPORTS" ]; then
    echo "✅ 发现使用@/lib/db的文件:"
    echo "$DB_IMPORTS"
fi

# 重启应用
echo ""
echo "🔄 重启应用..."
if command -v pm2 > /dev/null; then
    pm2 restart my-next 2>/dev/null || echo "⚠️  PM2未运行或应用未启动"
else
    echo "⚠️  PM2未安装"
fi

# 测试API接口
echo ""
echo "🧪 测试API接口..."
sleep 3

# 测试分类接口
if curl -s http://localhost:3000/api/categories > /dev/null; then
    echo "✅ /api/categories 工作正常"
else
    echo "❌ /api/categories 无法访问"
fi

# 测试认证接口
if curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"login":"test","password":"test"}' > /dev/null; then
    echo "✅ /api/auth/login 工作正常"
else
    echo "❌ /api/auth/login 无法访问"
fi

echo ""
echo "🎉 Prisma问题修复完成！"
echo ""
echo "📝 常用Prisma命令:"
echo "   查看数据库: pnpm prisma studio"
echo "   重置数据库: pnpm prisma migrate reset --force"
echo "   推送schema: pnpm db:push"
echo "   生成客户端: pnpm prisma generate"
echo "   查看状态: pnpm prisma db pull" 
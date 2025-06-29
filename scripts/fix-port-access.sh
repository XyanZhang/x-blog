#!/bin/bash

# 端口访问问题诊断和修复脚本

set -e

echo "🔍 开始诊断端口访问问题..."

# 获取服务器IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
echo "📡 服务器IP: $SERVER_IP"

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
    echo "❌ pnpm 未安装"
    echo "📦 正在安装pnpm..."
    npm install -g pnpm
    echo "✅ pnpm 安装完成"
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

# 检查PM2进程状态
echo ""
echo "📊 PM2进程状态:"
pm2 list

# 检查端口占用情况
echo ""
echo "🔍 端口占用情况:"
netstat -tlnp | grep -E ":(3000|5555)" || echo "未发现3000或5555端口占用"

# 检查防火墙状态
echo ""
echo "🔥 防火墙状态:"
if command -v ufw &> /dev/null; then
    echo "UFW状态:"
    sudo ufw status
    # 检查是否需要开放端口
    if ! sudo ufw status | grep -q "3000/tcp"; then
        echo "⚠️  3000端口未开放，正在开放..."
        sudo ufw allow 3000/tcp
        echo "✅ 3000端口已开放"
    fi
    if ! sudo ufw status | grep -q "5555/tcp"; then
        echo "⚠️  5555端口未开放，正在开放..."
        sudo ufw allow 5555/tcp
        echo "✅ 5555端口已开放"
    fi
elif command -v iptables &> /dev/null; then
    echo "iptables规则:"
    sudo iptables -L -n | grep -E "(3000|5555)" || echo "未发现相关iptables规则"
    # 检查是否需要添加规则
    if ! sudo iptables -L -n | grep -q "3000"; then
        echo "⚠️  3000端口规则不存在，正在添加..."
        sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
        echo "✅ 3000端口规则已添加"
    fi
    if ! sudo iptables -L -n | grep -q "5555"; then
        echo "⚠️  5555端口规则不存在，正在添加..."
        sudo iptables -A INPUT -p tcp --dport 5555 -j ACCEPT
        echo "✅ 5555端口规则已添加"
    fi
else
    echo "未检测到防火墙"
fi

# 检查应用日志
echo ""
echo "📝 应用日志 (最近20行):"
pm2 logs my-next --lines 20 --nostream || echo "无法获取应用日志"

# 测试本地端口访问
echo ""
echo "🔍 测试本地端口访问:"
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 本地3000端口可访问"
else
    echo "❌ 本地3000端口无法访问"
fi

# 测试外部端口访问
echo ""
echo "🔍 测试外部端口访问:"
if curl -s http://$SERVER_IP:3000 > /dev/null; then
    echo "✅ 外部3000端口可访问"
else
    echo "❌ 外部3000端口无法访问"
fi

# 检查应用文件
echo ""
echo "🔍 检查应用文件..."
if [ -f ".next/standalone/server.js" ]; then
    echo "✅ standalone服务器文件存在"
else
    echo "❌ standalone服务器文件不存在"
fi

if [ -f "ecosystem.config.js" ]; then
    echo "✅ PM2配置文件存在"
else
    echo "❌ PM2配置文件不存在"
fi

# 修复建议
echo ""
echo "🔧 修复建议:"
echo "1. 如果PM2进程未运行，请运行: pm2 start ecosystem.config.js"
echo "2. 如果防火墙阻止，请运行: sudo ufw allow 3000/tcp"
echo "3. 如果是云服务器，请在安全组中开放3000端口"
echo "4. 如果应用启动失败，请检查日志: pm2 logs my-next"
echo "5. 重启应用: pm2 restart my-next"

# 提供快速修复选项
echo ""
read -p "是否要尝试自动修复? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔧 开始自动修复..."
    
    # 重启应用
    echo "🔄 重启应用..."
    pm2 restart my-next
    
    # 等待启动
    sleep 3
    
    # 检查状态
    if pm2 list | grep -q "my-next.*online"; then
        echo "✅ 应用重启成功"
    else
        echo "❌ 应用重启失败"
        echo "📝 尝试重新启动..."
        pm2 delete my-next 2>/dev/null || true
        pm2 start ecosystem.config.js
        sleep 3
    fi
    
    # 配置防火墙
    echo "🔥 配置防火墙..."
    if command -v ufw &> /dev/null; then
        sudo ufw allow 3000/tcp
        sudo ufw allow 5555/tcp
        echo "✅ UFW防火墙已配置"
    elif command -v iptables &> /dev/null; then
        sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
        sudo iptables -A INPUT -p tcp --dport 5555 -j ACCEPT
        echo "✅ iptables防火墙已配置"
    fi
    
    # 再次测试端口访问
    echo "🔍 再次测试端口访问..."
    sleep 2
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ 本地3000端口现在可访问"
    else
        echo "❌ 本地3000端口仍然无法访问"
    fi
    
    echo "🎉 修复完成！请再次测试访问 http://$SERVER_IP:3000"
fi 
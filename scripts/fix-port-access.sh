#!/bin/bash

# 端口访问问题诊断和修复脚本

set -e

echo "🔍 开始诊断端口访问问题..."

# 获取服务器IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
echo "📡 服务器IP: $SERVER_IP"

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
elif command -v iptables &> /dev/null; then
    echo "iptables规则:"
    sudo iptables -L -n | grep -E "(3000|5555)" || echo "未发现相关iptables规则"
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
    
    echo "🎉 修复完成！请再次测试访问 http://$SERVER_IP:3000"
fi 
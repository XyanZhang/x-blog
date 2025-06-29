# Debian 部署指南 - 解决端口访问和Prisma问题

## 问题描述

在Debian系统上部署Next.js项目后，可能遇到以下问题：
1. 无法通过3000端口访问应用
2. 某些API接口无法访问
3. Prisma数据库连接问题

## 常见原因

1. **防火墙阻止**：Debian默认防火墙可能阻止3000端口
2. **应用绑定问题**：应用可能只绑定到localhost而不是0.0.0.0
3. **云服务器安全组**：云服务商的安全组未开放3000端口
4. **PM2配置问题**：PM2配置不适合Next.js standalone模式
5. **Prisma客户端问题**：Prisma客户端未正确生成或导入不一致
6. **数据库文件问题**：数据库文件不存在或权限问题

## 解决方案

### 1. 使用更新后的部署脚本

```bash
# 运行更新后的部署脚本
./simple-deploy.sh
```

### 2. 使用诊断脚本

```bash
# 诊断端口访问问题
./scripts/fix-port-access.sh

# 诊断API接口问题
./scripts/check-api-issues.sh

# 诊断Prisma问题
./scripts/fix-prisma-issues.sh
```

### 3. 手动检查和修复

#### 检查PM2进程状态
```bash
pm2 list
```

#### 检查端口占用
```bash
netstat -tlnp | grep 3000
```

#### 检查防火墙状态
```bash
# UFW防火墙
sudo ufw status

# iptables防火墙
sudo iptables -L -n | grep 3000
```

#### 配置防火墙
```bash
# UFW防火墙
sudo ufw allow 3000/tcp
sudo ufw allow 5555/tcp

# iptables防火墙
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5555 -j ACCEPT
```

#### 检查Prisma问题
```bash
# 检查Prisma客户端
ls -la node_modules/@prisma/client

# 生成Prisma客户端
pnpm prisma generate

# 检查数据库文件
ls -la prisma/blog.db

# 推送数据库schema
pnpm db:push

# 测试数据库连接
pnpm prisma db pull
```

### 4. 手动重启应用

```bash
# 停止应用
pm2 stop my-next

# 删除应用
pm2 delete my-next

# 重新启动
pm2 start ecosystem.config.js

# 保存配置
pm2 save
```

## Prisma问题详细解决方案

### 问题1：Prisma客户端未生成
```bash
# 生成Prisma客户端
pnpm prisma generate

# 检查生成的文件
ls -la node_modules/@prisma/client
```

### 问题2：数据库文件不存在
```bash
# 创建数据库
pnpm db:push

# 或者使用迁移
pnpm prisma migrate dev
```

### 问题3：导入不一致
确保所有API路由都使用统一的Prisma导入：
```typescript
// 推荐使用
import { prisma } from '@/lib/db'

// 而不是
import { prisma } from '@/lib/prisma'
```

### 问题4：环境变量问题
确保`.env.local`文件包含正确的配置：
```env
DATABASE_URL="file:./blog.db"
NODE_ENV="production"
```

## 云服务器配置

### 阿里云
1. 登录阿里云控制台
2. 进入ECS实例管理
3. 点击"安全组"
4. 添加入方向规则：
   - 端口范围：3000/3000
   - 授权对象：0.0.0.0/0

### 腾讯云
1. 登录腾讯云控制台
2. 进入云服务器CVM
3. 点击"安全组"
4. 添加入站规则：
   - 类型：自定义
   - 来源：0.0.0.0/0
   - 协议端口：TCP:3000

### AWS
1. 登录AWS控制台
2. 进入EC2实例
3. 点击"安全组"
4. 添加入站规则：
   - 类型：自定义TCP
   - 端口：3000
   - 来源：0.0.0.0/0

## 验证步骤

1. **检查本地访问**
```bash
curl http://localhost:3000
```

2. **检查外部访问**
```bash
curl http://YOUR_SERVER_IP:3000
```

3. **检查应用日志**
```bash
pm2 logs my-next
```

4. **测试API接口**
```bash
# 测试分类接口
curl http://localhost:3000/api/categories

# 测试认证接口
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"test","password":"test"}'
```

## 常见错误和解决方案

### 错误1：EADDRINUSE
```
Error: listen EADDRINUSE: address already in use :::3000
```
**解决方案**：
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或者重启PM2
pm2 restart my-next
```

### 错误2：ECONNREFUSED
```
curl: (7) Failed to connect to localhost port 3000: Connection refused
```
**解决方案**：
```bash
# 检查应用是否启动
pm2 list

# 查看错误日志
pm2 logs my-next

# 重新启动应用
pm2 restart my-next
```

### 错误3：Prisma Client not found
```
Cannot find module '@prisma/client'
```
**解决方案**：
```bash
# 安装依赖
pnpm install

# 生成Prisma客户端
pnpm prisma generate
```

### 错误4：Database connection failed
```
Error: P1001: Can't reach database server
```
**解决方案**：
```bash
# 检查数据库文件
ls -la prisma/blog.db

# 重新创建数据库
pnpm db:push

# 检查环境变量
cat .env.local
```

### 错误5：Permission denied
```
Error: EACCES: permission denied
```
**解决方案**：
```bash
# 检查文件权限
ls -la /var/www/x-blog

# 修改权限
sudo chown -R $USER:$USER /var/www/x-blog
```

## 环境变量配置

确保`.env.local`文件包含正确的配置：

```env
# 数据库配置
DATABASE_URL="file:./blog.db"

# NextAuth 配置
NEXTAUTH_URL="http://YOUR_SERVER_IP:3000"
NEXTAUTH_SECRET="your-secret-key"

# 其他配置
NODE_ENV="production"
HOSTNAME="0.0.0.0"
PORT="3000"
```

## 性能优化建议

1. **使用Nginx反向代理**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

2. **启用PM2集群模式**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-next',
    script: '.next/standalone/server.js',
    instances: 'max', // 使用所有CPU核心
    exec_mode: 'cluster'
  }]
}
```

## 监控和维护

### 查看应用状态
```bash
pm2 status
pm2 monit
```

### 查看日志
```bash
# 实时日志
pm2 logs my-next -f

# 历史日志
pm2 logs my-next --lines 100
```

### 自动重启
```bash
# 配置PM2开机自启
pm2 startup
pm2 save
```

## 故障排除清单

- [ ] PM2进程是否运行？
- [ ] 端口是否被占用？
- [ ] 防火墙是否开放端口？
- [ ] 云服务器安全组是否配置？
- [ ] 应用是否绑定到0.0.0.0？
- [ ] 环境变量是否正确？
- [ ] Prisma客户端是否生成？
- [ ] 数据库文件是否存在？
- [ ] 数据库连接是否正常？
- [ ] API路由导入是否一致？
- [ ] 日志中是否有错误？

如果以上步骤都无法解决问题，请运行诊断脚本获取详细报告：

```bash
# 端口访问问题
./scripts/fix-port-access.sh

# API接口问题
./scripts/check-api-issues.sh

# Prisma问题
./scripts/fix-prisma-issues.sh
``` 
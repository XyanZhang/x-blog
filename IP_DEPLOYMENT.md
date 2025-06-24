# Next.js 项目 IP 访问部署指南

## 概述

本指南专门针对通过IP地址访问的部署方案，无需配置域名和SSL证书。

## 快速部署

### 方案一：直接部署（推荐）

1. **上传项目文件到服务器**
   ```bash
   # 方法1：使用scp上传
   scp -r ./my-next user@your-server-ip:/tmp/
   
   # 方法2：使用git克隆
   git clone https://github.com/yourusername/my-next.git
   ```

2. **运行简化部署脚本**
   ```bash
   # 给脚本执行权限
   chmod +x simple-deploy.sh
   
   # 运行部署
   ./simple-deploy.sh
   ```

3. **访问应用**
   ```
   http://your-server-ip:3000
   ```

### 方案二：Docker部署

1. **安装Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

2. **构建和运行**
   ```bash
   # 构建镜像
   docker-compose build
   
   # 启动服务
   docker-compose up -d
   ```

3. **访问应用**
   ```
   http://your-server-ip:3000
   ```

## 服务器配置

### 1. 防火墙设置

```bash
# Ubuntu/Debian
sudo ufw allow 3000
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### 2. 云服务器安全组

如果使用云服务器（阿里云、腾讯云、AWS等），需要在安全组中开放3000端口：

- **入站规则**：允许TCP 3000端口
- **源**：0.0.0.0/0（或特定IP段）

### 3. 环境变量配置

创建 `.env.local` 文件：

```env
# 数据库配置
DATABASE_URL="file:./blog.db"

# NextAuth 配置
NEXTAUTH_URL="http://your-server-ip:3000"
NEXTAUTH_SECRET="your-secret-key"

# 其他配置
NODE_ENV="production"
```

## 可选：Nginx反向代理

如果你希望通过80端口访问（无需端口号），可以配置Nginx：

1. **安装Nginx**
   ```bash
   sudo apt install nginx
   ```

2. **配置Nginx**
   ```bash
   # 复制配置文件
   sudo cp nginx.conf /etc/nginx/sites-available/my-next
   sudo ln -s /etc/nginx/sites-available/my-next /etc/nginx/sites-enabled/
   
   # 测试配置
   sudo nginx -t
   
   # 重启Nginx
   sudo systemctl restart nginx
   ```

3. **开放80端口**
   ```bash
   sudo ufw allow 80
   ```

4. **访问应用**
   ```
   http://your-server-ip
   ```

## 管理命令

### PM2 管理

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs my-next

# 重启应用
pm2 restart my-next

# 停止应用
pm2 stop my-next

# 删除应用
pm2 delete my-next
```

### Docker 管理

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f app

# 重启服务
docker-compose restart

# 停止服务
docker-compose down
```

## 故障排除

### 1. 端口被占用

```bash
# 查看端口占用
sudo netstat -tlnp | grep :3000

# 杀死进程
sudo kill -9 <PID>
```

### 2. 权限问题

```bash
# 修复文件权限
sudo chown -R $USER:$USER /var/www/my-next
chmod +x /var/www/my-next/simple-deploy.sh
```

### 3. 内存不足

```bash
# 增加Node.js内存限制
export NODE_OPTIONS="--max-old-space-size=2048"
```

### 4. 无法访问

检查以下几点：
- 防火墙是否开放3000端口
- 云服务器安全组是否配置正确
- 应用是否正常启动
- 服务器IP是否正确

## 备份和恢复

### 备份数据

```bash
# 备份数据库
cp prisma/blog.db backup/blog-$(date +%Y%m%d).db

# 备份上传文件
tar -czf backup/uploads-$(date +%Y%m%d).tar.gz public/uploads/

# 备份环境变量
cp .env.local backup/env-$(date +%Y%m%d).local
```

### 恢复数据

```bash
# 恢复数据库
cp backup/blog-YYYYMMDD.db prisma/blog.db

# 恢复上传文件
tar -xzf backup/uploads-YYYYMMDD.tar.gz

# 恢复环境变量
cp backup/env-YYYYMMDD.local .env.local
```

## 性能优化

### 1. 启用压缩

在 `next.config.ts` 中：

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  // ... 其他配置
};
```

### 2. 配置缓存

```bash
# 设置静态文件缓存
# 已在nginx.conf中配置
```

### 3. 监控资源使用

```bash
# 查看内存使用
pm2 monit

# 查看系统资源
htop
```

## 安全建议

1. **定期更新**
   ```bash
   sudo apt update && sudo apt upgrade
   pnpm update
   ```

2. **限制访问IP**
   ```bash
   # 在防火墙中只允许特定IP访问
   sudo ufw allow from your-ip to any port 3000
   ```

3. **定期备份**
   - 设置自动备份脚本
   - 备份到远程存储

4. **监控日志**
   ```bash
   # 设置日志轮转
   pm2 install pm2-logrotate
   ```

---

**部署完成后的访问地址**：`http://your-server-ip:3000`

**注意事项**：
- 确保服务器有足够的内存（建议2GB+）
- 定期备份重要数据
- 监控应用运行状态
- 考虑后续升级到域名+HTTPS 
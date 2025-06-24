# Next.js 项目部署指南

## 概述

这是一个基于 Next.js 15 + Prisma + SQLite 的博客系统。本文档提供了多种部署方案。

## 部署方案

### 方案一：Vercel 部署（推荐）

#### 优点
- 零配置部署
- 自动 HTTPS
- 全球 CDN
- 自动构建和部署
- 免费计划可用

#### 步骤

1. **准备代码**
   ```bash
   # 确保代码已推送到 GitHub
   git add .
   git commit -m "准备部署"
   git push origin main
   ```

2. **连接 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录
   - 点击 "New Project"
   - 选择你的仓库

3. **配置环境变量**
   ```
   DATABASE_URL=file:./blog.db
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-secret-key
   ```

4. **部署**
   - Vercel 会自动检测 Next.js 项目
   - 点击 "Deploy" 开始部署

### 方案二：传统服务器部署

#### 服务器要求
- Ubuntu 20.04+ 或 CentOS 8+
- 2GB+ RAM
- 20GB+ 存储空间
- 域名（可选）

#### 步骤

1. **服务器准备**
   ```bash
   # 更新系统
   sudo apt update && sudo apt upgrade -y
   
   # 安装必要软件
   sudo apt install -y curl git nginx certbot python3-certbot-nginx
   ```

2. **运行部署脚本**
   ```bash
   # 给脚本执行权限
   chmod +x deploy.sh
   
   # 运行部署脚本
   ./deploy.sh
   ```

3. **配置 Nginx**
   ```bash
   # 复制 Nginx 配置
   sudo cp nginx.conf /etc/nginx/sites-available/my-next
   sudo ln -s /etc/nginx/sites-available/my-next /etc/nginx/sites-enabled/
   
   # 测试配置
   sudo nginx -t
   
   # 重启 Nginx
   sudo systemctl restart nginx
   ```

4. **配置 SSL 证书**
   ```bash
   # 使用 Let's Encrypt 获取免费 SSL 证书
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

### 方案三：Docker 部署

#### 步骤

1. **安装 Docker**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # 安装 Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **构建和运行**
   ```bash
   # 构建镜像
   docker-compose build
   
   # 启动服务
   docker-compose up -d
   ```

3. **查看日志**
   ```bash
   docker-compose logs -f app
   ```

## 环境变量配置

创建 `.env.local` 文件：

```env
# 数据库配置
DATABASE_URL="file:./blog.db"

# NextAuth 配置
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key-here"

# 其他配置
NODE_ENV="production"
```

## 数据库迁移

### 生产环境建议

对于生产环境，建议将 SQLite 替换为 PostgreSQL：

1. **修改 Prisma 配置**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **更新环境变量**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/mynext"
   ```

3. **运行迁移**
   ```bash
   pnpm prisma migrate deploy
   ```

## 文件上传配置

确保上传目录存在并有正确权限：

```bash
# 创建上传目录
mkdir -p public/uploads

# 设置权限
chmod 755 public/uploads
```

## 性能优化

### 1. 启用 Next.js 输出独立模式

在 `next.config.ts` 中添加：

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  // ... 其他配置
};
```

### 2. 配置缓存

- 静态资源缓存
- API 响应缓存
- 数据库查询缓存

### 3. 图片优化

- 使用 Next.js Image 组件
- 配置图片 CDN
- 压缩图片

## 监控和维护

### 1. 日志管理

```bash
# 查看应用日志
pm2 logs my-next

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. 性能监控

- 使用 PM2 监控
- 配置 Nginx 状态页面
- 设置告警

### 3. 备份策略

```bash
# 备份数据库
cp prisma/blog.db backup/blog-$(date +%Y%m%d).db

# 备份上传文件
tar -czf backup/uploads-$(date +%Y%m%d).tar.gz public/uploads/
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   sudo netstat -tlnp | grep :3000
   
   # 杀死进程
   sudo kill -9 <PID>
   ```

2. **权限问题**
   ```bash
   # 修复文件权限
   sudo chown -R $USER:$USER /var/www/my-next
   ```

3. **内存不足**
   ```bash
   # 增加 Node.js 内存限制
   export NODE_OPTIONS="--max-old-space-size=2048"
   ```

## 安全建议

1. **防火墙配置**
   ```bash
   # 只开放必要端口
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

2. **定期更新**
   ```bash
   # 更新系统
   sudo apt update && sudo apt upgrade
   
   # 更新依赖
   pnpm update
   ```

3. **安全扫描**
   ```bash
   # 使用 npm audit 检查安全漏洞
   pnpm audit
   ```

## 联系支持

如果遇到部署问题，请检查：

1. 服务器日志
2. 应用日志
3. 网络连接
4. 环境变量配置
5. 文件权限

---

**注意**: 部署前请确保：
- 代码已测试通过
- 环境变量正确配置
- 数据库已迁移
- SSL 证书已配置
- 备份策略已制定 
# My Next.js Blog

这是一个使用 Next.js 15 构建的现代化 Markdown 博客系统。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: Prisma
- **样式**: Tailwind CSS
- **UI组件**: Radix UI / shadcn/ui
- **密码哈希**: bcryptjs

## 功能特性

### 核心功能
- 📝 **Markdown 编辑**: 支持 Markdown 语法的文章编写和预览
- 🏷️ **分类标签**: 灵活的文章分类和标签系统
- 👤 **用户系统**: 完整的用户注册、登录、权限管理
- 💬 **评论系统**: 支持嵌套回复的评论功能
- 📊 **数据统计**: 文章浏览、点赞、收藏等数据统计

### 高级功能
- 🔐 **权限控制**: 多角色权限管理 (超级管理员/管理员/编辑/用户)
- 📱 **响应式设计**: 适配各种设备屏幕
- 🎨 **主题系统**: 支持明暗主题切换
- 🔍 **SEO优化**: 完整的SEO元数据支持
- 📈 **访问统计**: 详细的用户访问行为分析

## 数据库设计

详细的数据库设计请查看 [DATABASE.md](./DATABASE.md)

### 核心模型
- **User**: 用户管理 (角色、权限、社交信息)
- **Post**: 文章管理 (Markdown内容、SEO、状态)
- **Category**: 分类管理 (图标、颜色、排序)
- **Tag**: 标签管理 (使用统计、状态)
- **Comment**: 评论管理 (嵌套回复、审核)

### 扩展功能
- **Media**: 媒体文件管理
- **Page**: 静态页面管理
- **Setting**: 系统设置
- **Analytics**: 访问统计

## 快速开始

### 安装依赖
```bash
pnpm install
```

### 数据库设置
```bash
# 应用数据库迁移
npx prisma migrate dev

# 初始化种子数据
pnpm db:seed
```

### 启动开发服务器
```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 数据库命令

```bash
# 数据库迁移
pnpm db:push          # 推送schema变更
npx prisma migrate dev # 创建迁移文件

# 数据管理
pnpm db:seed          # 运行种子数据
pnpm db:reset         # 重置数据库并重新种子

# 数据查询
pnpm db:query stats   # 查看数据统计
pnpm db:query users   # 查看用户列表
pnpm db:query posts   # 查看文章列表
pnpm db:query help    # 查看所有查询命令

# 数据库工具
pnpm db:studio        # 启动 Prisma Studio
```

## 默认账户

种子数据包含以下测试账户：

- **管理员**: `admin@blog.com` / `admin123`
- **普通用户**: `user@blog.com` / `user123`

## 项目结构

```
├── prisma/              # 数据库相关
│   ├── schema.prisma   # 数据库模型定义
│   ├── seed.ts         # 种子数据
│   └── migrations/     # 迁移文件
├── src/                # 源代码
│   ├── app/            # Next.js App Router
│   ├── components/     # React 组件
│   ├── lib/            # 工具库
│   └── types/          # TypeScript 类型
├── scripts/            # 脚本工具
│   └── db-query.ts     # 数据库查询工具
├── public/             # 静态资源
└── DATABASE.md         # 数据库设计文档
```

## 开发指南

### 添加新模型

1. 在 `prisma/schema.prisma` 中定义模型
2. 创建迁移: `npx prisma migrate dev --name your_migration_name`
3. 更新种子数据 (如需要)
4. 重新生成类型: `npx prisma generate`

### 自定义配置

创建 `.env.local` 文件：

```env
# 数据库
DATABASE_URL="file:./dev.db"

# 认证 (如果使用)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# 其他配置...
```

## 部署

### 生产环境数据库

1. 更新 `DATABASE_URL` 为生产数据库连接
2. 运行迁移: `npx prisma migrate deploy`
3. 生成客户端: `npx prisma generate`

### 推荐部署平台

- **Vercel**: 无服务器部署，自动CI/CD
- **Railway**: 简单的全栈部署
- **Render**: 支持数据库的云平台

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

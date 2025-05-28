# 我的Next.js博客系统

一个基于Next.js 15、Prisma、SQLite的现代化博客系统，支持Markdown编辑和预览。

## 🚀 功能特点

- ✅ **现代化技术栈**: Next.js 15 + TypeScript + Tailwind CSS
- ✅ **完整的数据库设计**: 13个表的完整博客系统
- ✅ **用户管理**: 多角色权限系统
- ✅ **文章管理**: Markdown支持，分类标签
- ✅ **社交功能**: 评论、点赞、收藏、关注
- ✅ **SEO优化**: 完整的元数据支持
- ✅ **响应式设计**: 移动端适配

## 📋 快速开始

### 环境要求

- Node.js 18+
- pnpm (推荐) 或 npm

### 安装和运行

```bash
# 克隆项目
git clone <repository-url>
cd my-next

# 安装依赖
pnpm install

# 数据库设置
pnpm db:generate
pnpm db:push
pnpm db:seed

# 启动开发服务器
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🗄️ 数据库

### 默认账户

- **管理员**: admin@blog.com / admin123
- **普通用户**: user@blog.com / user123

### 数据库操作

```bash
# 查看数据库
pnpm db:studio

# 重置数据库
pnpm db:reset

# 生产环境迁移
pnpm db:deploy
```

## 🛠️ 开发工具

### 可用脚本

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 代码检查
pnpm db:studio    # 数据库管理界面
pnpm db:seed      # 运行种子数据
pnpm db:reset     # 重置数据库
```

### Shell命令学习

如果你想学习我们在开发过程中使用的Shell命令（如 `pkill`、`curl`、`grep`、`sleep` 等），请查看：

- 📚 **[Shell命令学习指南](./docs/shell-commands-guide.md)** - 详细的命令教程和学习路径
- 🚀 **[Shell命令快速参考](./docs/shell-commands-cheatsheet.md)** - 便于查阅的备忘单

这些文档包含了Unix/Linux命令行工具的完整使用指南，适合初学者到高级用户。

## 📁 项目结构

```
my-next/
├── docs/                      # 文档目录
│   ├── shell-commands-guide.md    # Shell命令学习指南
│   └── shell-commands-cheatsheet.md # Shell命令快速参考
├── prisma/                    # 数据库相关
│   ├── schema.prisma         # 数据库模型
│   ├── migrations/           # 数据库迁移
│   └── seed.ts              # 种子数据
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (pages)/         # 页面组件
│   │   ├── _components/     # 共享组件
│   │   ├── globals.css      # 全局样式
│   │   └── layout.tsx       # 根布局
│   ├── lib/                 # 工具库
│   │   └── db.ts           # 数据库查询函数
│   └── types/               # 类型定义
│       └── blog.ts         # 博客相关类型
├── scripts/                 # 工具脚本
├── .env                    # 环境变量
└── DATABASE.md            # 数据库设计文档
```

## 🎨 技术栈

- **前端**: Next.js 15, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: Prisma
- **UI组件**: Lucide React图标
- **密码哈希**: bcryptjs
- **ID生成**: cuid

## 📊 数据库设计

项目包含完整的博客系统数据库设计：

- **用户系统**: 多角色权限管理
- **内容管理**: 文章、分类、标签
- **社交功能**: 评论、点赞、收藏、关注
- **媒体管理**: 文件上传和管理
- **系统管理**: 静态页面、设置、统计

详细设计请参考 [DATABASE.md](./DATABASE.md)

## 🚀 部署

### 生产环境数据库迁移

```bash
# 使用部署脚本
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh

# 或手动迁移
DATABASE_URL="your_production_db_url" npx prisma migrate deploy
```

### 环境变量

创建 `.env.production` 文件：

```env
DATABASE_URL="your_production_database_url"
NEXTAUTH_SECRET="your_secret_key"
NEXTAUTH_URL="https://your-domain.com"
```

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

---

## 💡 学习资源

- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Shell命令学习指南](./docs/shell-commands-guide.md) 📚
- [Shell命令快速参考](./docs/shell-commands-cheatsheet.md) 🚀

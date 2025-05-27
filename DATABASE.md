# 博客系统数据库设计

这是一个功能完整的Markdown博客系统数据库设计，支持文章管理、用户系统、评论、标签分类等功能。

## 技术栈

- **ORM**: Prisma
- **数据库**: SQLite (开发环境) / PostgreSQL (生产环境)
- **密码哈希**: bcryptjs
- **ID生成**: cuid

## 数据库模型概览

### 核心模型

1. **User** - 用户模型
2. **Post** - 文章模型
3. **Category** - 分类模型
4. **Tag** - 标签模型
5. **Comment** - 评论模型

### 关联模型

6. **PostTag** - 文章标签关联表
7. **PostLike** - 文章点赞
8. **PostBookmark** - 文章收藏
9. **Follow** - 用户关注

### 扩展模型

10. **Media** - 媒体文件管理
11. **Page** - 静态页面
12. **Setting** - 系统设置
13. **Analytics** - 访问统计

## 详细字段说明

### User (用户表)

```sql
用户基础信息:
- id: 唯一标识符 (cuid)
- username: 用户名 (唯一)
- email: 邮箱 (唯一)
- password: 密码哈希
- displayName: 显示名称
- avatar: 头像URL
- bio: 个人简介

社交信息:
- website: 个人网站
- github: GitHub链接
- twitter: Twitter链接

权限和状态:
- role: 用户角色 (SUPER_ADMIN, ADMIN, EDITOR, USER)
- isActive: 是否激活
- isVerified: 是否验证
- lastLoginAt: 最后登录时间

时间戳:
- createdAt: 创建时间
- updatedAt: 更新时间
```

### Post (文章表)

```sql
文章内容:
- id: 唯一标识符
- title: 文章标题
- slug: URL友好标识符 (唯一)
- excerpt: 摘要
- content: Markdown内容
- htmlContent: 渲染后的HTML (缓存)
- coverImage: 封面图片

状态管理:
- isPublished: 是否发布
- isDraft: 是否草稿
- isDeleted: 是否删除
- publishedAt: 发布时间
- scheduledAt: 定时发布时间

统计信息:
- viewCount: 浏览次数
- likeCount: 点赞数
- commentCount: 评论数
- bookmarkCount: 收藏数
- readingTime: 预估阅读时间(分钟)

SEO优化:
- metaTitle: SEO标题
- metaDescription: SEO描述
- metaKeywords: SEO关键词

关联:
- authorId: 作者ID
- categoryId: 分类ID

时间戳:
- createdAt: 创建时间
- updatedAt: 更新时间
- deletedAt: 删除时间
```

### Category (分类表)

```sql
基础信息:
- id: 唯一标识符
- name: 分类名称 (唯一)
- slug: URL标识符 (唯一)
- description: 分类描述
- color: 分类颜色
- icon: 分类图标
- sortOrder: 排序权重
- isActive: 是否激活
- postCount: 文章数量

时间戳:
- createdAt: 创建时间
- updatedAt: 更新时间
```

### Tag (标签表)

```sql
基础信息:
- id: 唯一标识符
- name: 标签名称 (唯一)
- slug: URL标识符 (唯一)
- description: 标签描述
- color: 标签颜色
- postCount: 使用次数
- isActive: 是否激活

时间戳:
- createdAt: 创建时间
- updatedAt: 更新时间
```

### Comment (评论表)

```sql
评论内容:
- id: 唯一标识符
- content: 评论内容
- isApproved: 是否审核通过
- isDeleted: 是否删除

安全信息:
- ipAddress: IP地址
- userAgent: 用户代理

关联:
- postId: 文章ID
- authorId: 用户ID (可为空，支持游客评论)
- parentId: 父评论ID (支持回复)

游客信息 (匿名评论):
- guestName: 游客姓名
- guestEmail: 游客邮箱
- guestWebsite: 游客网站

时间戳:
- createdAt: 创建时间
- updatedAt: 更新时间
- deletedAt: 删除时间
```

## 数据库关系

### 一对多关系

1. **User → Post**: 一个用户可以写多篇文章
2. **User → Comment**: 一个用户可以发多条评论
3. **Category → Post**: 一个分类可以包含多篇文章
4. **Post → Comment**: 一篇文章可以有多条评论
5. **Comment → Comment**: 评论支持嵌套回复

### 多对多关系

1. **Post ↔ Tag**: 通过PostTag表实现文章和标签的多对多关系
2. **User ↔ User**: 通过Follow表实现用户之间的关注关系

### 一对一关系

1. **Post → Analytics**: 每篇文章可以有对应的访问统计

## 索引优化

```sql
-- 文章表索引
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_published ON posts(is_published, published_at);

-- 评论表索引
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- 统计表索引
CREATE INDEX idx_analytics_path ON analytics(path);
CREATE INDEX idx_analytics_post ON analytics(post_id);
CREATE INDEX idx_analytics_date ON analytics(created_at);
```

## 数据迁移

### 开发环境初始化

```bash
# 生成并应用迁移
npx prisma migrate dev --name init_blog_schema

# 运行种子数据
pnpm db:seed
```

### 生产环境部署

```bash
# 应用迁移 (不重置数据)
npx prisma migrate deploy

# 生成客户端
npx prisma generate
```

## 种子数据

初始化的种子数据包括：

### 用户账户
- 管理员: `admin@blog.com / admin123`
- 普通用户: `user@blog.com / user123`

### 分类
- 技术 (💻)
- 生活 (🌱)
- 随笔 (✍️)
- 教程 (📚)

### 标签
- JavaScript, TypeScript, React, Next.js
- Node.js, Prisma, 前端开发, 后端开发

### 示例文章
- 欢迎文章
- Next.js 15 新特性详解
- 构建现代化博客系统
- 编程学习之路

### 静态页面
- 关于我
- 联系我

### 系统设置
- 站点标题、描述、URL
- 分页设置
- 评论功能开关

## 性能优化建议

### 1. 数据库层面

```sql
-- 文章列表查询优化
SELECT p.*, u.username, u.display_name, c.name as category_name
FROM posts p
LEFT JOIN users u ON p.author_id = u.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_published = true
ORDER BY p.published_at DESC
LIMIT 10;

-- 热门文章查询
SELECT * FROM posts 
WHERE is_published = true 
ORDER BY view_count DESC 
LIMIT 5;
```

### 2. 应用层面

- **缓存策略**: 对热门文章、分类列表进行缓存
- **懒加载**: 评论系统采用分页懒加载
- **静态生成**: 文章详情页使用ISR静态生成
- **图片优化**: 媒体文件自动生成缩略图

### 3. 数据统计

```sql
-- 用户统计
SELECT 
  COUNT(*) as total_users,
  SUM(CASE WHEN role = 'ADMIN' THEN 1 ELSE 0 END) as admin_count,
  SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_count
FROM users;

-- 文章统计
SELECT 
  COUNT(*) as total_posts,
  SUM(CASE WHEN is_published = true THEN 1 ELSE 0 END) as published_count,
  SUM(view_count) as total_views
FROM posts;
```

## 扩展功能

### 计划中的功能

1. **内容管理**
   - 文章版本控制
   - 批量操作
   - 内容审核流程

2. **用户体验**
   - 全文搜索
   - 推荐系统
   - 阅读进度跟踪

3. **营销功能**
   - 邮件订阅
   - RSS订阅
   - 社交分享

4. **数据分析**
   - 用户行为分析
   - 内容效果分析
   - SEO性能监控

### 数据库扩展

如果需要添加新功能，可以考虑以下模型：

```prisma
// 邮件订阅
model Subscription {
  id    String @id @default(cuid())
  email String @unique
  isActive Boolean @default(true)
  createdAt DateTime @default(now())
}

// 文章版本
model PostVersion {
  id      String @id @default(cuid())
  postId  String
  version Int
  content String
  post    Post @relation(fields: [postId], references: [id])
  createdAt DateTime @default(now())
}

// 阅读进度
model ReadingProgress {
  id       String @id @default(cuid())
  userId   String
  postId   String
  progress Float  // 阅读进度百分比
  user     User   @relation(fields: [userId], references: [id])
  post     Post   @relation(fields: [postId], references: [id])
  updatedAt DateTime @updatedAt
  
  @@unique([userId, postId])
}
```

## 生产环境注意事项

### 1. 数据库配置

对于生产环境，建议：

```env
# PostgreSQL 配置示例
DATABASE_URL="postgresql://username:password@localhost:5432/blog_production"

# 连接池配置
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=10000
```

### 2. 安全考虑

- 用户密码使用bcrypt哈希 (已实现)
- 实施SQL注入防护 (Prisma自动处理)
- 添加请求频率限制
- 实施CSRF保护
- 配置CORS策略

### 3. 备份策略

```bash
# 定期数据库备份
pg_dump blog_production > backup_$(date +%Y%m%d_%H%M%S).sql

# 自动化备份脚本
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump blog_production | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# 保留最近7天的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

这个数据库设计为你的Markdown博客系统提供了坚实的基础，支持现代博客的所有核心功能，同时为未来的扩展留有充分的空间。 
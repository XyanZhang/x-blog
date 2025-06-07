import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始种子数据...')

  // 创建管理员用户
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@blog.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@blog.com',
      password: await hash('admin123', 10), // 生产环境请使用更强的密码
      displayName: '博客管理员',
      bio: '这是博客管理员账户',
      role: Role.ADMIN,
      isActive: true,
      isVerified: true,
    },
  })

  // 创建普通用户
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@blog.com' },
    update: {},
    create: {
      username: 'user',
      email: 'user@blog.com',
      password: await hash('user123', 10),
      displayName: '测试用户',
      bio: '这是一个测试用户账户',
      role: Role.USER,
      isActive: true,
      isVerified: true,
    },
  })

  // 创建分类
  const categories = [
    {
      name: '技术',
      slug: 'tech',
      description: '技术相关的文章',
      color: '#3B82F6',
      icon: '💻',
    },
    {
      name: '生活',
      slug: 'life',
      description: '生活感悟和经验分享',
      color: '#10B981',
      icon: '🌱',
    },
    {
      name: '随笔',
      slug: 'essay',
      description: '随心所欲的文字记录',
      color: '#8B5CF6',
      icon: '✍️',
    },
    {
      name: '教程',
      slug: 'tutorial',
      description: '详细的技术教程',
      color: '#F59E0B',
      icon: '📚',
    },
  ]

  const createdCategories = []
  for (const category of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
    createdCategories.push(createdCategory)
  }

  // 创建标签
  const tags = [
    {
      name: 'JavaScript',
      slug: 'javascript',
      description: 'JavaScript编程语言',
      color: '#F7DF1E',
    },
    {
      name: 'TypeScript',
      slug: 'typescript',
      description: 'TypeScript编程语言',
      color: '#3178C6',
    },
    {
      name: 'React',
      slug: 'react',
      description: 'React前端框架',
      color: '#61DAFB',
    },
    {
      name: 'Next.js',
      slug: 'nextjs',
      description: 'Next.js全栈框架',
      color: '#000000',
    },
    {
      name: 'Node.js',
      slug: 'nodejs',
      description: 'Node.js运行时环境',
      color: '#339933',
    },
    {
      name: 'Prisma',
      slug: 'prisma',
      description: 'Prisma数据库ORM',
      color: '#2D3748',
    },
    {
      name: '前端开发',
      slug: 'frontend',
      description: '前端开发相关',
      color: '#FF6B6B',
    },
    {
      name: '后端开发',
      slug: 'backend',
      description: '后端开发相关',
      color: '#4ECDC4',
    },
  ]

  const createdTags = []
  for (const tag of tags) {
    const createdTag = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    })
    createdTags.push(createdTag)
  }

  // 创建示例文章
  const posts = [
    {
      title: '欢迎来到Z~Blog',
      slug: 'welcome-to-my-blog',
      excerpt: '这是我的第一篇博客文章，欢迎大家来到Z~Blog！',
      content: `# 欢迎来到Z~Blog

欢迎来到我的个人博客！这里将分享我在技术学习和生活中的各种心得体会。

## 关于这个博客

这个博客使用以下技术栈构建：

- **Next.js** - React全栈框架
- **TypeScript** - 类型安全的JavaScript
- **Prisma** - 现代数据库ORM
- **SQLite** - 轻量级数据库
- **Tailwind CSS** - 实用优先的CSS框架

## 内容规划

我计划在这里分享：

1. **技术文章** - 编程技巧、框架使用、最佳实践
2. **项目经验** - 项目开发过程中的收获和思考
3. **学习笔记** - 新技术的学习记录
4. **生活感悟** - 工作之余的生活体验

希望我的分享能对你有所帮助！

---

如果你有任何问题或建议，欢迎在评论区留言交流。`,
      isPublished: true,
      isDraft: false,
      publishedAt: new Date(),
      viewCount: 42,
      readingTime: 2,
      categoryId: createdCategories[0].id,
      authorId: adminUser.id,
    },
    {
      title: 'Next.js 15 新特性详解',
      slug: 'nextjs-15-new-features',
      excerpt: '深入了解 Next.js 15 带来的激动人心的新特性和改进。',
      content: `# Next.js 15 新特性详解

Next.js 15 带来了许多令人兴奋的新特性和改进，让我们一起来看看这些变化。

## 主要新特性

### 1. 改进的App Router

App Router现在更加稳定和高效：

\`\`\`typescript
// app/page.tsx
export default function HomePage() {
  return (
    <div>
      <h1>欢迎使用 Next.js 15</h1>
    </div>
  )
}
\`\`\`

### 2. 更好的性能优化

- 更快的构建时间
- 优化的代码分割
- 改进的图片优化

### 3. 增强的开发体验

新的开发工具和调试功能让开发变得更加愉快。

## 迁移指南

如果你想升级到 Next.js 15，可以按照以下步骤：

1. 更新依赖
2. 检查破坏性变更
3. 测试应用程序

总的来说，Next.js 15是一个值得升级的版本！`,
      isPublished: true,
      isDraft: false,
      publishedAt: new Date(Date.now() - 86400000), // 1天前
      viewCount: 128,
      readingTime: 5,
      categoryId: createdCategories[3].id, // 教程
      authorId: adminUser.id,
    },
    {
      title: '构建现代化的博客系统',
      slug: 'building-modern-blog-system',
      excerpt: '从零开始构建一个功能完整的现代化博客系统的经验分享。',
      content: `# 构建现代化的博客系统

在这篇文章中，我将分享构建这个博客系统的完整过程。

## 技术选型

选择合适的技术栈是成功的关键：

### 前端技术
- **Next.js 15** - 全栈React框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架

### 后端技术
- **Prisma** - 数据库ORM
- **SQLite** - 开发数据库
- **PostgreSQL** - 生产数据库

## 核心功能

### 1. 文章管理
- Markdown编辑器
- 实时预览
- 草稿保存
- 定时发布

### 2. 用户系统
- 注册登录
- 权限管理
- 个人资料

### 3. 交互功能
- 评论系统
- 点赞收藏
- 关注功能

## 数据库设计

良好的数据库设计是系统稳定性的基础：

\`\`\`sql
-- 用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  -- 更多字段...
);

-- 文章表  
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  title TEXT,
  content TEXT,
  author_id TEXT,
  -- 更多字段...
);
\`\`\`

## 部署和运维

选择合适的部署方案和监控工具也很重要。

这个项目还在持续改进中，欢迎提出建议！`,
      isPublished: true,
      isDraft: false,
      publishedAt: new Date(Date.now() - 172800000), // 2天前
      viewCount: 89,
      readingTime: 8,
      categoryId: createdCategories[0].id, // 技术
      authorId: adminUser.id,
    },
    {
      title: '我的编程学习之路',
      slug: 'my-programming-journey',
      excerpt: '回顾我从编程小白到现在的成长历程，分享一些学习心得。',
      content: `# 我的编程学习之路

回想起刚开始学习编程的时候，那种既兴奋又迷茫的感觉还历历在目。

## 初学阶段

最开始接触的是HTML和CSS，记得第一次让网页显示"Hello World"时的激动心情。

### 学习资源
- 在线教程
- 编程书籍  
- 开源项目
- 技术社区

## 成长过程

### JavaScript启蒙
学会了JavaScript后，感觉打开了新世界的大门。

### 框架学习
- jQuery时代
- React的兴起
- Vue的简洁
- Angular的强大

## 现在的思考

编程不仅仅是写代码，更是一种思维方式。

### 技术之外
- 沟通能力
- 团队协作
- 持续学习
- 解决问题

## 给新手的建议

1. **保持好奇心** - 永远不要停止学习
2. **多实践** - 光看不练假把式
3. **找到社区** - 和同行交流很重要
4. **享受过程** - 编程应该是快乐的

希望我的经历能给同样在学习路上的朋友一些启发！`,
      isPublished: true,
      isDraft: false,
      publishedAt: new Date(Date.now() - 259200000), // 3天前
      viewCount: 67,
      readingTime: 6,
      categoryId: createdCategories[1].id, // 生活
      authorId: adminUser.id,
    },
  ]

  const createdPosts = []
  for (const post of posts) {
    const createdPost = await prisma.post.create({
      data: post,
    })
    createdPosts.push(createdPost)
  }

  // 为文章添加标签
  const postTagRelations = [
    { postIndex: 1, tagSlugs: ['nextjs', 'javascript', 'frontend'] },
    { postIndex: 2, tagSlugs: ['nextjs', 'typescript', 'react', 'prisma'] },
    { postIndex: 3, tagSlugs: ['javascript', 'frontend', 'backend'] },
  ]

  for (const relation of postTagRelations) {
    const post = createdPosts[relation.postIndex]
    for (const tagSlug of relation.tagSlugs) {
      const tag = createdTags.find(t => t.slug === tagSlug)
      if (post && tag) {
        await prisma.postTag.create({
          data: {
            postId: post.id,
            tagId: tag.id,
          },
        })
        // 更新标签使用次数
        await prisma.tag.update({
          where: { id: tag.id },
          data: { postCount: { increment: 1 } },
        })
      }
    }
  }

  // 更新分类文章数量
  for (const category of createdCategories) {
    const postCount = await prisma.post.count({
      where: { categoryId: category.id },
    })
    await prisma.category.update({
      where: { id: category.id },
      data: { postCount },
    })
  }

  // 创建示例页面
  const pages = [
    {
      title: '关于我',
      slug: 'about',
      content: `# 关于我

你好！我是一名全栈开发者，热爱技术和分享。

## 技能栈

- **前端**: React, Vue, TypeScript, Tailwind CSS
- **后端**: Node.js, Python, Go
- **数据库**: PostgreSQL, MongoDB, Redis
- **工具**: Docker, Git, Linux

## 联系方式

- 邮箱：admin@blog.com
- GitHub：https://github.com/yourname
- Twitter：https://twitter.com/yourname

欢迎交流！`,
      isPublished: true,
    },
    {
      title: '联系我',
      slug: 'contact',
      content: `# 联系我

如果你有任何问题或建议，欢迎通过以下方式联系我：

## 联系方式

### 邮箱
admin@blog.com

### 社交媒体
- GitHub: https://github.com/yourname
- Twitter: https://twitter.com/yourname
- LinkedIn: https://linkedin.com/in/yourname

### 其他
如果你喜欢我的文章，也可以在文章下方留言评论，我会及时回复的！

谢谢你的关注！`,
      isPublished: true,
    },
  ]

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    })
  }

  // 创建一些系统设置
  const settings = [
    {
      key: 'site_title',
      value: '我的技术博客',
      type: 'string',
    },
    {
      key: 'site_description',
      value: '分享技术、记录生活的个人博客',
      type: 'string',
    },
    {
      key: 'site_url',
      value: 'https://yourblog.com',
      type: 'string',
    },
    {
      key: 'posts_per_page',
      value: '10',
      type: 'number',
    },
    {
      key: 'enable_comments',
      value: 'true',
      type: 'boolean',
    },
    {
      key: 'comment_approval',
      value: 'true',
      type: 'boolean',
    },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('种子数据创建完成！')
  console.log('管理员账户: admin@blog.com / admin123')
  console.log('普通用户账户: user@blog.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
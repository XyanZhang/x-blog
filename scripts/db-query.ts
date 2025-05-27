import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const command = process.argv[2]
  
  switch (command) {
    case 'users':
      await showUsers()
      break
    case 'posts':
      await showPosts()
      break
    case 'categories':
      await showCategories()
      break
    case 'tags':
      await showTags()
      break
    case 'comments':
      await showComments()
      break
    case 'stats':
      await showStats()
      break
    case 'help':
      showHelp()
      break
    default:
      console.log('未知命令，使用 "help" 查看可用命令')
  }
}

async function showUsers() {
  console.log('\n=== 用户列表 ===')
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          comments: true,
        }
      }
    }
  })
  
  users.forEach(user => {
    console.log(`\n👤 ${user.displayName || user.username}`)
    console.log(`   邮箱: ${user.email}`)
    console.log(`   角色: ${user.role}`)
    console.log(`   状态: ${user.isActive ? '激活' : '未激活'} | ${user.isVerified ? '已验证' : '未验证'}`)
    console.log(`   文章: ${user._count.posts}篇 | 评论: ${user._count.comments}条`)
    console.log(`   注册: ${user.createdAt.toLocaleString('zh-CN')}`)
  })
}

async function showPosts() {
  console.log('\n=== 文章列表 ===')
  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: {
          username: true,
          displayName: true
        }
      },
      category: {
        select: {
          name: true,
          icon: true
        }
      },
      tags: {
        include: {
          tag: {
            select: {
              name: true,
              color: true
            }
          }
        }
      },
      _count: {
        select: {
          comments: true,
          likes: true,
          bookmarks: true
        }
      }
    },
    orderBy: {
      publishedAt: 'desc'
    }
  })
  
  posts.forEach(post => {
    console.log(`\n📝 ${post.title}`)
    console.log(`   作者: ${post.author.displayName || post.author.username}`)
    console.log(`   分类: ${post.category?.icon} ${post.category?.name || '无分类'}`)
    console.log(`   标签: ${post.tags.map(pt => pt.tag.name).join(', ') || '无标签'}`)
    console.log(`   状态: ${post.isPublished ? '已发布' : '草稿'} | 浏览: ${post.viewCount}`)
    console.log(`   互动: 💬${post._count.comments} ❤️${post._count.likes} 🔖${post._count.bookmarks}`)
    console.log(`   时间: ${post.publishedAt?.toLocaleString('zh-CN') || '未发布'}`)
  })
}

async function showCategories() {
  console.log('\n=== 分类列表 ===')
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          posts: true
        }
      }
    },
    orderBy: {
      sortOrder: 'asc'
    }
  })
  
  categories.forEach(category => {
    console.log(`\n${category.icon} ${category.name}`)
    console.log(`   描述: ${category.description || '无描述'}`)
    console.log(`   文章: ${category._count.posts}篇`)
    console.log(`   状态: ${category.isActive ? '激活' : '禁用'}`)
  })
}

async function showTags() {
  console.log('\n=== 标签列表 ===')
  const tags = await prisma.tag.findMany({
    orderBy: {
      postCount: 'desc'
    }
  })
  
  tags.forEach(tag => {
    console.log(`\n🏷️  ${tag.name}`)
    console.log(`   描述: ${tag.description || '无描述'}`)
    console.log(`   使用: ${tag.postCount}次`)
    console.log(`   状态: ${tag.isActive ? '激活' : '禁用'}`)
  })
}

async function showComments() {
  console.log('\n=== 评论列表 ===')
  const comments = await prisma.comment.findMany({
    include: {
      author: {
        select: {
          username: true,
          displayName: true
        }
      },
      post: {
        select: {
          title: true
        }
      },
      parent: {
        select: {
          id: true,
          content: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 20
  })
  
  comments.forEach(comment => {
    const authorName = comment.author?.displayName || comment.author?.username || comment.guestName || '匿名'
    const isReply = comment.parent ? '↳ 回复' : '💬'
    
    console.log(`\n${isReply} ${authorName}`)
    console.log(`   文章: ${comment.post.title}`)
    console.log(`   内容: ${comment.content.substring(0, 100)}${comment.content.length > 100 ? '...' : ''}`)
    if (comment.parent) {
      console.log(`   回复: ${comment.parent.content.substring(0, 50)}...`)
    }
    console.log(`   状态: ${comment.isApproved ? '已审核' : '待审核'} | ${comment.isDeleted ? '已删除' : '正常'}`)
    console.log(`   时间: ${comment.createdAt.toLocaleString('zh-CN')}`)
  })
}

async function showStats() {
  console.log('\n=== 数据统计 ===')
  
  // 用户统计
  const userStats = await prisma.user.groupBy({
    by: ['role'],
    _count: {
      id: true
    }
  })
  
  const totalUsers = await prisma.user.count()
  const activeUsers = await prisma.user.count({ where: { isActive: true } })
  
  console.log('\n👥 用户统计:')
  console.log(`   总用户: ${totalUsers}人`)
  console.log(`   激活用户: ${activeUsers}人`)
  userStats.forEach(stat => {
    console.log(`   ${stat.role}: ${stat._count.id}人`)
  })
  
  // 文章统计
  const totalPosts = await prisma.post.count()
  const publishedPosts = await prisma.post.count({ where: { isPublished: true } })
  const draftPosts = await prisma.post.count({ where: { isDraft: true } })
  const totalViews = await prisma.post.aggregate({
    _sum: {
      viewCount: true
    }
  })
  
  console.log('\n📝 文章统计:')
  console.log(`   总文章: ${totalPosts}篇`)
  console.log(`   已发布: ${publishedPosts}篇`)
  console.log(`   草稿: ${draftPosts}篇`)
  console.log(`   总浏览: ${totalViews._sum.viewCount || 0}次`)
  
  // 分类统计
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          posts: true
        }
      }
    }
  })
  
  console.log('\n📂 分类统计:')
  categories.forEach(category => {
    console.log(`   ${category.icon} ${category.name}: ${category._count.posts}篇`)
  })
  
  // 热门标签
  const popularTags = await prisma.tag.findMany({
    orderBy: {
      postCount: 'desc'
    },
    take: 5
  })
  
  console.log('\n🏷️  热门标签:')
  popularTags.forEach((tag, index) => {
    console.log(`   ${index + 1}. ${tag.name}: ${tag.postCount}次`)
  })
  
  // 评论统计
  const totalComments = await prisma.comment.count()
  const approvedComments = await prisma.comment.count({ where: { isApproved: true } })
  const pendingComments = await prisma.comment.count({ where: { isApproved: false } })
  
  console.log('\n💬 评论统计:')
  console.log(`   总评论: ${totalComments}条`)
  console.log(`   已审核: ${approvedComments}条`)
  console.log(`   待审核: ${pendingComments}条`)
}

function showHelp() {
  console.log('\n=== 数据库查询工具 ===')
  console.log('\n可用命令:')
  console.log('  users      - 查看用户列表')
  console.log('  posts      - 查看文章列表')
  console.log('  categories - 查看分类列表')
  console.log('  tags       - 查看标签列表')
  console.log('  comments   - 查看评论列表')
  console.log('  stats      - 查看数据统计')
  console.log('  help       - 显示帮助信息')
  console.log('\n使用示例:')
  console.log('  pnpm db:query users')
  console.log('  pnpm db:query stats')
}

main()
  .catch((e) => {
    console.error('查询失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
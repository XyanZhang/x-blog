import { PrismaClient } from '@prisma/client'

// 全局单例 Prisma 客户端
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 博客相关查询函数
export async function getFeaturedPost() {
  return await prisma.post.findFirst({
    where: {
      isPublished: true,
      isDeleted: false
    },
    include: {
      author: {
        select: {
          id: true,
          displayName: true,
          avatar: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getRecentPosts(limit: number = 3) {
  return await prisma.post.findMany({
    where: {
      isPublished: true,
      isDeleted: false
    },
    include: {
      author: {
        select: {
          id: true,
          displayName: true,
          avatar: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  })
}

export async function getCategories() {
  return await prisma.category.findMany({
    where: {
      isActive: true
    },
    include: {
      _count: {
        select: {
          posts: {
            where: {
              isPublished: true,
              isDeleted: false
            }
          }
        }
      }
    },
    orderBy: {
      sortOrder: 'asc'
    }
  })
}

export async function getBlogStats() {
  const [totalPosts, totalViews, totalComments, totalLikes] = await Promise.all([
    prisma.post.count({
      where: {
        isPublished: true,
        isDeleted: false
      }
    }),
    prisma.post.aggregate({
      where: {
        isPublished: true,
        isDeleted: false
      },
      _sum: {
        viewCount: true
      }
    }),
    prisma.comment.count({
      where: {
        isApproved: true,
        isDeleted: false
      }
    }),
    prisma.postLike.count()
  ])

  return {
    totalPosts,
    totalViews: totalViews._sum.viewCount || 0,
    totalComments,
    totalLikes
  }
}

// 计算阅读时间（基于字数）
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200 // 平均阅读速度
  const words = content.length / 2 // 中文字符数估算
  return Math.ceil(words / wordsPerMinute)
}

// 格式化数字显示
export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 获取文章详情
export async function getPostBySlug(slug: string) {
  return await prisma.post.findUnique({
    where: {
      slug: slug,
      isPublished: true,
      isDeleted: false
    },
    include: {
      author: {
        select: {
          id: true,
          displayName: true,
          avatar: true,
          bio: true,
          website: true,
          github: true,
          twitter: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
          slug: true
        }
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          }
        }
      },
      comments: {
        where: {
          isApproved: true,
          parentId: null // 只获取顶级评论
        },
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              avatar: true
            }
          },
          replies: {
            where: {
              isApproved: true
            },
            include: {
              author: {
                select: {
                  id: true,
                  displayName: true,
                  avatar: true
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true,
          bookmarks: true
        }
      }
    }
  })
}

// 获取相关文章
export async function getRelatedPosts(currentPostId: string, categoryId: string | null, limit: number = 3) {
  const where: any = {
    id: {
      not: currentPostId
    },
    isPublished: true,
    isDeleted: false
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  return await prisma.post.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          displayName: true,
          avatar: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  })
}

// 增加文章浏览量
export async function incrementPostViews(postId: string) {
  try {
    await prisma.post.update({
      where: { id: postId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })
  } catch (error) {
    console.error('Failed to increment post views:', error)
  }
} 
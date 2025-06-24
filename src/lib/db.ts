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
          icon: true,
          slug: true
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
          icon: true,
          slug: true
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
  const where: {
    id: { not: string };
    isPublished: boolean;
    isDeleted: boolean;
    categoryId?: string;
  } = {
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
  } catch (error: unknown) {
    console.error('Failed to increment post views:', error)
  }
}

// 根据分类slug获取分类信息
export async function getCategoryBySlug(slug: string) {
  return await prisma.category.findUnique({
    where: {
      slug: slug,
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
    }
  })
}

// 根据分类获取文章列表
export async function getPostsByCategory(categorySlug: string, page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit

  // 先获取分类信息
  const category = await getCategoryBySlug(categorySlug)
  if (!category) {
    return { posts: [], category: null, totalCount: 0, totalPages: 0 }
  }

  // 获取文章总数
  const totalCount = await prisma.post.count({
    where: {
      categoryId: category.id,
      isPublished: true,
      isDeleted: false
    }
  })

  // 获取分页文章
  const posts = await prisma.post.findMany({
    where: {
      categoryId: category.id,
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
          icon: true,
          slug: true
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
      publishedAt: 'desc'
    },
    skip: offset,
    take: limit
  })

  const totalPages = Math.ceil(totalCount / limit)

  return {
    posts,
    category,
    totalCount,
    totalPages
  }
}

// 获取所有分类及其统计信息（用于分类列表页）
export async function getCategoriesWithStats() {
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
    orderBy: [
      { sortOrder: 'asc' },
      { postCount: 'desc' }
    ]
  })
}

// 根据标签slug获取标签信息
export async function getTagBySlug(slug: string) {
  return await prisma.tag.findUnique({
    where: {
      slug: slug,
      isActive: true
    },
    include: {
      _count: {
        select: {
          posts: {
            where: {
              post: {
                isPublished: true,
                isDeleted: false
              }
            }
          }
        }
      }
    }
  })
}

// 根据标签获取文章列表
export async function getPostsByTag(tagSlug: string, page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit

  // 先获取标签信息
  const tag = await getTagBySlug(tagSlug)
  if (!tag) {
    return { posts: [], tag: null, totalCount: 0, totalPages: 0 }
  }

  // 获取文章总数
  const totalCount = await prisma.postTag.count({
    where: {
      tagId: tag.id,
      post: {
        isPublished: true,
        isDeleted: false
      }
    }
  })

  // 获取分页文章
  const postTags = await prisma.postTag.findMany({
    where: {
      tagId: tag.id,
      post: {
        isPublished: true,
        isDeleted: false
      }
    },
    include: {
      post: {
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
              icon: true,
              slug: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        }
      }
    },
    orderBy: {
      post: {
        publishedAt: 'desc'
      }
    },
    skip: offset,
    take: limit
  })

  const posts = postTags.map(pt => pt.post)
  const totalPages = Math.ceil(totalCount / limit)

  return {
    posts,
    tag,
    totalCount,
    totalPages
  }
}

// 获取所有标签及其统计信息（用于标签列表页）
export async function getTagsWithStats() {
  return await prisma.tag.findMany({
    where: {
      isActive: true
    },
    include: {
      _count: {
        select: {
          posts: {
            where: {
              post: {
                isPublished: true,
                isDeleted: false
              }
            }
          }
        }
      }
    },
    orderBy: [
      { postCount: 'desc' },
      { name: 'asc' }
    ]
  })
}

// 获取热门标签（用于侧边栏等）
export async function getPopularTags(limit: number = 10) {
  return await prisma.tag.findMany({
    where: {
      isActive: true,
      postCount: {
        gt: 0
      }
    },
    orderBy: {
      postCount: 'desc'
    },
    take: limit
  })
}

// 获取管理员文章列表
export async function getPostsForAdmin() {
  return await prisma.post.findMany({
    where: {
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

// 根据ID获取文章（用于编辑）
export async function getPostById(id: string) {
  return await prisma.post.findUnique({
    where: {
      id: id,
      isDeleted: false
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true
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
      }
    }
  })
} 
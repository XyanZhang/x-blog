import { Post, User, Category, Comment, PostLike } from '@prisma/client'

// 扩展的文章类型
export type PostWithDetails = Post & {
  author: Pick<User, 'id' | 'displayName' | 'avatar'>
  category: Pick<Category, 'id' | 'name' | 'color' | 'icon'> | null
  _count: {
    likes: number
    comments: number
  }
}

// 扩展的分类类型
export type CategoryWithCount = Category & {
  _count: {
    posts: number
  }
}

// 博客统计数据类型
export interface BlogStats {
  totalPosts: number
  totalViews: number
  totalComments: number
  totalLikes: number
}

// 首页数据类型
export interface HomePageData {
  featuredPost: PostWithDetails | null
  recentPosts: PostWithDetails[]
  categories: CategoryWithCount[]
  stats: BlogStats
} 
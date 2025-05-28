import { Post, User, Category, Comment, PostLike, Tag, PostTag } from '@prisma/client'

// 扩展的文章类型
export type PostWithDetails = Post & {
  author: Pick<User, 'id' | 'displayName' | 'avatar'>
  category: Pick<Category, 'id' | 'name' | 'color' | 'icon'> | null
  _count: {
    likes: number
    comments: number
  }
}

// 博客详情页面的文章类型
export type PostDetail = Post & {
  author: Pick<User, 'id' | 'displayName' | 'avatar' | 'bio' | 'website' | 'github' | 'twitter'>
  category: Pick<Category, 'id' | 'name' | 'color' | 'icon' | 'slug'> | null
  tags: Array<{
    tag: Pick<Tag, 'id' | 'name' | 'slug' | 'color'>
  }>
  comments: Array<CommentWithReplies>
  _count: {
    likes: number
    comments: number
    bookmarks: number
  }
}

// 评论类型（包含回复）
export type CommentWithReplies = Comment & {
  author: Pick<User, 'id' | 'displayName' | 'avatar'>
  replies: Array<Comment & {
    author: Pick<User, 'id' | 'displayName' | 'avatar'>
  }>
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

// 分类页面数据类型
export interface CategoryPageData {
  posts: PostWithDetails[]
  category: CategoryWithCount | null
  totalCount: number
  totalPages: number
}

// 分类详情类型（用于分类页面）
export type CategoryDetail = Category & {
  _count: {
    posts: number
  }
}

// 分类列表数据类型
export interface CategoriesPageData {
  categories: CategoryWithCount[]
  totalPosts: number
} 
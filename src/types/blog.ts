import { Post, User, Category, Comment, Tag } from '@prisma/client'

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

// 扩展的标签类型
export type TagWithCount = Tag & {
  _count: {
    posts: number
  }
}

// 标签页面数据类型
export interface TagPageData {
  posts: PostWithDetails[]
  tag: TagWithCount | null
  totalCount: number
  totalPages: number
}

// 标签列表数据类型
export interface TagsPageData {
  tags: TagWithCount[]
  totalPosts: number
}

// 摄影图册相关类型
export interface PhotoAlbum {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  isPublished: boolean;
  isPrivate: boolean;
  sortOrder: number;
  creatorId: string;
  creator: User;
  createdAt: Date;
  updatedAt: Date;
  photos: Photo[];
}

export interface Photo {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  camera?: string;
  lens?: string;
  settings?: string;
  tags?: string;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  mediaId: string;
  media: Media;
  albumId?: string;
  album?: PhotoAlbum;
  takenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  postPhotos: PostPhoto[];
}

export interface PostPhoto {
  id: string;
  postId: string;
  photoId: string;
  sortOrder: number;
  post: Post;
  photo: Photo;
  createdAt: Date;
}

export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  uploaderId?: string;
  uploader?: User;
  createdAt: Date;
  updatedAt: Date;
  photos: Photo[];
}

// 创建图册的请求类型
export interface CreatePhotoAlbumRequest {
  title: string;
  description?: string;
  coverImage?: string;
  isPublished?: boolean;
  isPrivate?: boolean;
}

// 创建图片的请求类型
export interface CreatePhotoRequest {
  title?: string;
  description?: string;
  location?: string;
  camera?: string;
  lens?: string;
  settings?: string;
  tags?: string;
  isFeatured?: boolean;
  albumId?: string;
  takenAt?: Date;
  mediaId: string;
}

// 关联图片到文章的请求类型
export interface LinkPhotoToPostRequest {
  postId: string;
  photoId: string;
  sortOrder?: number;
} 
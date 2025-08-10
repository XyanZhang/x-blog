import React, { FC } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { Calendar, Eye, Heart, MessageCircle, Bookmark, User, Globe, Github, Twitter, ArrowLeft, Share2 } from 'lucide-react'

import { getPostBySlug, getRelatedPosts, incrementPostViews } from '@/lib/db'
import type { PostDetail } from '@/types/blog'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import TableOfContents from '@/components/TableOfContents'
import AdvancedReadingProgressBar from '@/components/AdvancedReadingProgressBar'
import GiscusComments from '@/components/comments/giscus-comments'

interface PostDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

// 获取文章数据（不增加浏览量）
async function getPostDataForMeta(slug: string) {
  const post = await getPostBySlug(slug)
  
  if (!post) {
    return null
  }

  // 获取相关文章
  const relatedPosts = await getRelatedPosts(post.id, post.categoryId, 3)

  // 注意：这里不增加浏览量

  return {
    post: post as PostDetail,
    relatedPosts
  }
}

// 获取文章数据（增加浏览量）
async function getPostData(slug: string) {
  const post = await getPostBySlug(slug)
  
  if (!post) {
    return null
  }

  // 获取相关文章
  const relatedPosts = await getRelatedPosts(post.id, post.categoryId, 3)

  // 增加浏览量（异步执行，不阻塞页面渲染）
  incrementPostViews(post.id).catch(console.error)

  return {
    post: post as PostDetail,
    relatedPosts
  }
}

// 生成SEO元数据
export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await getPostDataForMeta(slug)  // 使用不增加浏览量的版本
  
  if (!data) {
    return {
      title: '文章未找到',
    }
  }

  const { post } = data
  
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || '阅读这篇精彩的文章',
    keywords: post.metaKeywords || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || '阅读这篇精彩的文章',
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.author.displayName || '匿名作者',
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || '阅读这篇精彩的文章',
      images: post.coverImage ? [post.coverImage] : undefined,
    }
  }
}

// 日期格式化函数
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const PostDetailPage: FC<PostDetailPageProps> = async ({ params }) => {
  const { slug } = await params
  const data = await getPostData(slug)

  if (!data) {
    notFound()
  }

  const { post, relatedPosts } = data

  return (
    <article className="min-h-screen bg-gray-50">
      {/* 增强版阅读进度条和目录 */}
      <AdvancedReadingProgressBar content={post.content} />
      
      {/* 返回链接 */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Link>
        </div>
      </div>

      {/* 文章头部 */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 分类标签 */}
          {post.category && (
            <div className="mb-4">
              <Link
                href={`/categories/${post.category.slug}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: post.category.color || '#6b7280' }}
              >
                <span className="mr-2">{post.category.icon}</span>
                {post.category.name}
              </Link>
            </div>
          )}

          {/* 文章标题 */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* 文章摘要 */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* 文章元信息 */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDate(post.publishedAt || post.createdAt)}
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              {post.viewCount} 次阅读
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              {post._count.comments} 条评论
            </div>
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              {post._count.likes} 个点赞
            </div>
            {post.readingTime && (
              <div className="text-blue-600">
                📖 {post.readingTime} 分钟阅读
              </div>
            )}
          </div>

          {/* 作者信息 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                {post.author.avatar ? (
                  <img 
                    src={post.author.avatar} 
                    alt={post.author.displayName || '作者'} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {post.author.displayName || '匿名作者'}
                </p>
                {post.author.bio && (
                  <p className="text-sm text-gray-500">{post.author.bio}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  {post.author.website && (
                    <a 
                      href={post.author.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                  {post.author.github && (
                    <a 
                      href={`https://github.com/${post.author.github}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {post.author.twitter && (
                    <a 
                      href={`https://twitter.com/${post.author.twitter}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* 分享按钮 */}
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Share2 className="h-4 w-4" />
              分享
            </button>
          </div>
        </div>
      </header>

      <div className="relative">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 主要内容区域 */}
          <div className="flex gap-8">
            {/* 文章内容 - 占据左侧主要空间 */}
            <main className="flex-1 max-w-4xl">
              {/* 封面图片 */}
              {post.coverImage && (
                <div className="mb-8">
                  <img 
                    src={post.coverImage} 
                    alt={post.title}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}

              {/* 移动端目录 - 在文章内容之前显示 */}
              <div className="xl:hidden mb-6">
                <TableOfContents content={post.content} />
              </div>

              {/* 文章内容 */}
              <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <MarkdownRenderer 
                  content={post.content}
                  className="prose prose-lg max-w-none"
                />
              </div>

              {/* 标签 */}
              {post.tags.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(({ tag }) => (
                      <Link
                        key={tag.id}
                        href={`/tags/${tag.slug}`}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        style={{ backgroundColor: tag.color ? `${tag.color}20` : undefined }}
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex items-center justify-center gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                    <Heart className="h-5 w-5" />
                    点赞 ({post._count.likes})
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors">
                    <Bookmark className="h-5 w-5" />
                    收藏 ({post._count.bookmarks})
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    <Share2 className="h-5 w-5" />
                    分享
                  </button>
                </div>
              </div>

              {/* Giscus 评论区域 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <GiscusComments slug={post.slug} title={post.title} />
              </div>
            </main>

            {/* 侧边栏 - 使用sticky定位，更好的布局控制 */}
            <aside className="hidden xl:block w-80 flex-shrink-0">
              <div className="sticky top-20 space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto pr-2">
                {/* 文章目录 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-3 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-blue-600" />
                      文章目录
                    </h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <TableOfContents content={post.content} className="border-0 shadow-none" />
                  </div>
                </div>

                {/* 相关文章 */}
                {relatedPosts.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-3 py-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        相关推荐
                      </h3>
                    </div>
                    <div className="p-3 space-y-3">
                      {relatedPosts.map((relatedPost) => (
                        <Link
                          key={relatedPost.id}
                          href={`/posts/${relatedPost.slug}`}
                          className="block group"
                        >
                          <div className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <h4 className="font-medium text-gray-900 group-hover:text-blue-600 mb-2 line-clamp-2 leading-relaxed text-sm">
                              {relatedPost.title}
                            </h4>
                            {relatedPost.excerpt && (
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                                {relatedPost.excerpt}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(relatedPost.createdAt)}
                              </span>
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {relatedPost.viewCount}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {relatedPost._count.likes}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 作者信息卡片 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-3 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-purple-600" />
                      关于作者
                    </h3>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                        {post.author.avatar ? (
                          <img 
                            src={post.author.avatar} 
                            alt={post.author.displayName || '作者'} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {post.author.displayName || '匿名作者'}
                        </p>
                        {post.author.bio && (
                          <p className="text-xs text-gray-500 line-clamp-2">{post.author.bio}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.author.website && (
                        <a 
                          href={post.author.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="个人网站"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                      {post.author.github && (
                        <a 
                          href={`https://github.com/${post.author.github}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                          title="GitHub"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {post.author.twitter && (
                        <a 
                          href={`https://twitter.com/${post.author.twitter}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-all"
                          title="Twitter"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </article>
  )
}

export default PostDetailPage 
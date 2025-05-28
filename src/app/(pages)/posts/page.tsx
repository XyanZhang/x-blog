import { FC } from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { Calendar, Eye, Heart, MessageCircle, Search, Filter } from 'lucide-react'

import { getRecentPosts, getCategories } from '@/lib/db'
import type { PostWithDetails, CategoryWithCount } from '@/types/blog'

export const metadata: Metadata = {
  title: '所有文章 - 我的博客',
  description: '浏览所有精彩的文章内容，发现感兴趣的主题',
}

// 获取页面数据
async function getPostsPageData() {
  const [posts, categories] = await Promise.all([
    getRecentPosts(20), // 获取更多文章
    getCategories()
  ])

  return {
    posts,
    categories
  }
}

// 日期格式化函数
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date))
}

const PostsPage: FC = async () => {
  const { posts, categories } = await getPostsPageData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">所有文章</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              探索我们的文章集合，发现感兴趣的内容，学习新的知识和技能
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏 */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* 搜索框 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">搜索文章</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="搜索关键词..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 分类过滤 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">按分类筛选</h3>
                <div className="space-y-2">
                  <Link
                    href="/posts"
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>全部文章</span>
                      <span className="text-sm text-gray-500">{posts.length}</span>
                    </div>
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="mr-2">{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{category._count.posts}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 热门标签 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">热门标签</h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Next.js', 'TypeScript', 'JavaScript', 'CSS', 'Node.js', 'Python', 'Git'].map((tag) => (
                    <Link
                      key={tag}
                      href={`/tag/${tag.toLowerCase()}`}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* 主要内容 */}
          <main className="lg:col-span-3">
            {/* 排序和筛选 */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>最新发布</option>
                    <option>最多浏览</option>
                    <option>最多点赞</option>
                    <option>最多评论</option>
                  </select>
                </div>
                <p className="text-sm text-gray-500">
                  共 {posts.length} 篇文章
                </p>
              </div>
            </div>

            {/* 文章列表 */}
            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="md:flex">
                      {/* 文章缩略图区域 */}
                      <div className="md:w-1/3">
                        {post.coverImage ? (
                          <img 
                            src={post.coverImage} 
                            alt={post.title}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-full h-48 md:h-full flex items-center justify-center"
                            style={{ backgroundColor: post.category?.color || '#6b7280' }}
                          >
                            <span className="text-white text-4xl">{post.category?.icon || '📝'}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* 文章内容 */}
                      <div className="md:w-2/3 p-6">
                        {/* 分类标签 */}
                        {post.category && (
                          <div className="mb-3">
                            <Link
                              href={`/category/${post.category.name.toLowerCase()}`}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                              style={{ backgroundColor: post.category.color || '#6b7280' }}
                            >
                              <span className="mr-1">{post.category.icon}</span>
                              {post.category.name}
                            </Link>
                          </div>
                        )}

                        {/* 文章标题 */}
                        <h2 className="text-xl font-bold text-gray-900 mb-3">
                          <Link 
                            href={`/posts/${post.slug}`} 
                            className="hover:text-blue-600 transition-colors"
                          >
                            {post.title}
                          </Link>
                        </h2>

                        {/* 文章摘要 */}
                        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {post.excerpt || post.content.substring(0, 120) + '...'}
                        </p>

                        {/* 文章元信息 */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(post.publishedAt || post.createdAt)}
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {post.viewCount}
                            </div>
                            <div className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              {post._count.likes}
                            </div>
                            <div className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {post._count.comments}
                            </div>
                          </div>
                          
                          <Link 
                            href={`/posts/${post.slug}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            阅读更多 →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无文章</h3>
                <p className="text-gray-600">还没有发布任何文章，请稍后再来查看。</p>
              </div>
            )}

            {/* 分页 */}
            {posts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
                <div className="flex items-center justify-center space-x-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    上一页
                  </button>
                  <div className="flex space-x-1">
                    <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">2</button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">3</button>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    下一页
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default PostsPage 
// src/app/(pages)/page.tsx
import { FC } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, Eye, User, Heart, MessageCircle } from 'lucide-react'

import { getFeaturedPost, getRecentPosts, getCategories, getBlogStats, calculateReadingTime, formatNumber } from '@/lib/db'
import type { HomePageData } from '@/types/blog'

// 服务器组件 - 获取数据
async function getHomePageData(): Promise<HomePageData> {
  const [featuredPost, recentPosts, categories, stats] = await Promise.all([
    getFeaturedPost(),
    getRecentPosts(3),
    getCategories(),
    getBlogStats()
  ])

  return {
    featuredPost,
    recentPosts,
    categories,
    stats
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

const HomePage: FC = async () => {
  const { featuredPost, recentPosts, categories, stats } = await getHomePageData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 简化的导航栏 */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              我的博客
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600">首页</Link>
              <Link href="/posts" className="text-gray-700 hover:text-blue-600">文章</Link>
              <Link href="/categories" className="text-gray-700 hover:text-blue-600">分类</Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600">关于</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            分享技术，记录生活
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            欢迎来到我的个人博客！这里有 {stats.totalPosts} 篇文章等你探索
          </p>
          <Link 
            href="/posts"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            开始阅读
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* 统计数据 */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
              <div className="text-2xl mb-2">📝</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalPosts}</div>
              <div className="text-sm text-gray-600">文章总数</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
              <div className="text-2xl mb-2">👀</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{formatNumber(stats.totalViews)}</div>
              <div className="text-sm text-gray-600">总浏览量</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
              <div className="text-2xl mb-2">💬</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalComments}</div>
              <div className="text-sm text-gray-600">评论数</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
              <div className="text-2xl mb-2">❤️</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalLikes}</div>
              <div className="text-sm text-gray-600">点赞数</div>
            </div>
          </div>
        </div>
      </section>

      {/* 特色文章 */}
      {featuredPost && featuredPost.category && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">特色文章</h2>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div 
                    className="h-64 md:h-full flex items-center justify-center text-white"
                    style={{ backgroundColor: featuredPost.category.color || '#6b7280' }}
                  >
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">{featuredPost.category.icon}</div>
                      <h3 className="text-2xl font-bold mb-2">{featuredPost.category.name}</h3>
                      <p className="text-white/80">精选内容</p>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center mb-4">
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: featuredPost.category.color || '#6b7280' }}
                    >
                      {featuredPost.category.icon} {featuredPost.category.name}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    <Link href={`/posts/${featuredPost.slug}`} className="hover:text-blue-600 transition-colors">
                      {featuredPost.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {featuredPost.author.displayName || '匿名用户'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(featuredPost.publishedAt!)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {featuredPost.viewCount}
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {featuredPost._count.likes}
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1">⏱</span>
                        {calculateReadingTime(featuredPost.content)}分钟
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 最新文章 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">最新文章</h2>
            <Link 
              href="/posts"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              查看全部
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <article key={post.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                {post.category && (
                  <div 
                    className="h-32 rounded-lg mb-4 flex items-center justify-center"
                    style={{ backgroundColor: post.category.color || '#6b7280' }}
                  >
                    <span className="text-white text-3xl">{post.category.icon}</span>
                  </div>
                )}
                {post.category && (
                  <div className="flex items-center mb-3">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: post.category.color || '#6b7280' }}
                    >
                      {post.category.icon} {post.category.name}
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  <Link href={`/posts/${post.slug}`} className="hover:text-blue-600 transition-colors">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(post.publishedAt!)}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {post.viewCount}
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {post._count.likes}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 分类展示 */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">文章分类</h2>
            <Link 
              href="/categories"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              查看全部
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id}
                href={`/categories/${category.slug}`}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600">{category._count.posts} 篇文章</p>
                <div 
                  className="w-full h-1 rounded-full mt-4"
                  style={{ backgroundColor: category.color || '#6b7280' }}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">我的博客</h3>
              <p className="text-gray-400 mb-4">
                分享技术知识，记录生活点滴。希望我的内容能对你有所帮助。
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">邮箱</a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">快速链接</h3>
              <ul className="space-y-2">
                <li><Link href="/posts" className="text-gray-400 hover:text-white transition-colors">所有文章</Link></li>
                <li><Link href="/categories" className="text-gray-400 hover:text-white transition-colors">文章分类</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">关于我</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">统计信息</h3>
              <ul className="space-y-2 text-gray-400">
                <li>文章: {stats.totalPosts} 篇</li>
                <li>浏览: {formatNumber(stats.totalViews)} 次</li>
                <li>评论: {stats.totalComments} 条</li>
                <li>点赞: {stats.totalLikes} 个</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 我的博客. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
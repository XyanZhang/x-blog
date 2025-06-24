// src/app/(pages)/page.tsx
import { FC } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, User, Sparkles, BookOpen, Camera } from 'lucide-react'

import { getFeaturedPost, getRecentPosts, getCategories } from '@/lib/db'
import type { HomePageData } from '@/types/blog'
import TypewriterText, { ScrollIndicator } from '@/components/TypewriterText'

// 服务器组件 - 获取数据
async function getHomePageData(): Promise<HomePageData> {
  const [featuredPost, recentPosts, categories] = await Promise.all([
    getFeaturedPost(),
    getRecentPosts(3),
    getCategories()
  ])
  console.log(recentPosts)
  return {
    featuredPost,
    recentPosts,
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

const HomePage: FC = async () => {
  const { featuredPost, recentPosts, categories } = await getHomePageData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 第一屏 - 英雄区域 */}
      <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 mb-6 border border-white/20">
            <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
            欢迎来到我的个人空间
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            <TypewriterText 
              texts={[
                '分享技术，记录生活',
                '探索编程的无限可能',
                '用代码构建美好世界',
                '技术改变生活',
                '学习永无止境',
                '创造价值，传递知识',
                '拥抱开源，共同成长',
                '代码如诗，逻辑如画',
                '工具提升效率',
                '终端里的无限宇宙',
                '享受创造的乐趣',
                '拥抱技术的变化',
                '追求代码的优雅',
                '用技术解决问题',
                '连接开发者社区',
                '发现技术的美好',
                '让世界因技术而更好'
              ]}
              speed={150}
              delay={2500}
              groupSize={1}
              maxWidth="max-w-6xl"
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
            />
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            在这里，我分享编程技术、项目经验和生活感悟。希望我的内容能为你带来启发和帮助。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/posts"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              开始阅读
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="/photos"
              className="inline-flex items-center px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-all duration-300 font-medium border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Camera className="mr-2 h-5 w-5" />
              摄影作品
            </Link>
          </div>
        </div>

        {/* 滚动指示器 */}
        <ScrollIndicator />
      </section>

      {/* 第二屏 - 内容区域 */}
      <div id="content-section">
        {/* 特色文章 */}
        {featuredPost && featuredPost.category && (
          <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">精选推荐</h2>
                <p className="text-lg text-gray-600">不容错过的精彩内容</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                <div className="md:flex">
                  <div className="md:w-1/2 relative">
                    {featuredPost.coverImage ? (
                      <div className="h-64 md:h-full relative overflow-hidden">
                        <img 
                          src={featuredPost.coverImage} 
                          alt={featuredPost.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center p-8 relative z-10">
                            <div className="text-7xl mb-6 drop-shadow-lg">{featuredPost.category.icon}</div>
                            <h3 className="text-3xl font-bold mb-3 drop-shadow-lg text-white">{featuredPost.category.name}</h3>
                            <p className="text-white/90 text-lg">精选内容</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="h-64 md:h-full flex items-center justify-center text-white relative overflow-hidden"
                        style={{ backgroundColor: featuredPost.category.color || '#6b7280' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
                        <div className="text-center p-8 relative z-10">
                          <div className="text-7xl mb-6 drop-shadow-lg">{featuredPost.category.icon}</div>
                          <h3 className="text-3xl font-bold mb-3 drop-shadow-lg">{featuredPost.category.name}</h3>
                          <p className="text-white/90 text-lg">精选内容</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="md:w-1/2 p-10">
                    <div className="flex items-center mb-6">
                      <span 
                        className="px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg"
                        style={{ backgroundColor: featuredPost.category.color || '#6b7280' }}
                      >
                        {featuredPost.category.icon} {featuredPost.category.name}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
                      <Link href={`/posts/${featuredPost.slug}`} className="hover:text-blue-600 transition-colors">
                        {featuredPost.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {featuredPost.author.displayName || '匿名用户'}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(featuredPost.publishedAt!)}
                        </div>
                      </div>
                    </div>
                    <Link 
                      href={`/posts/${featuredPost.slug}`}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium"
                    >
                      阅读全文
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 最新文章 */}
        <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">最新文章</h2>
              <p className="text-lg text-gray-600">探索最新的技术分享和生活感悟</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {recentPosts.map((post) => (
                <article key={post.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-white/20 group hover:-translate-y-2">
                  {/* 封面图片或分类背景 */}
                  <div 
                    className="h-40 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: post.category?.color || '#6b7280' }}
                  >
                    {post.coverImage ? (
                      <>
                        <img 
                          src={post.coverImage} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
                        <span className="text-white text-4xl relative z-10 drop-shadow-lg">{post.category?.icon || '📝'}</span>
                      </>
                    )}
                  </div>
                  {post.category && (
                    <div className="flex items-center mb-4">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-md"
                        style={{ backgroundColor: post.category.color || '#6b7280' }}
                      >
                        {post.category.icon} {post.category.name}
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    <Link href={`/posts/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(post.publishedAt!)}
                    </div>
                    <Link 
                      href={`/posts/${post.slug}`}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center group-hover:translate-x-1 transition-transform"
                    >
                      阅读
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <div className="text-center">
              <Link 
                href="/posts"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                查看全部文章
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 分类展示 */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">文章分类</h2>
              <p className="text-lg text-gray-600">按主题浏览感兴趣的内容</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link 
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 border border-white/20 group hover:-translate-y-2"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{category._count.posts} 篇文章</p>
                  <div className="text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                    浏览分类 →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Z~Blog</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                分享技术知识，记录生活点滴。希望我的内容能为你带来启发和帮助。
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform">GitHub</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform">邮箱</a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">快速链接</h3>
              <ul className="space-y-3">
                <li><Link href="/posts" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 transform inline-block">所有文章</Link></li>
                <li><Link href="/categories" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 transform inline-block">文章分类</Link></li>
                <li><Link href="/photos" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 transform inline-block">摄影作品</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 transform inline-block">关于我</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">联系我</h3>
              <p className="text-gray-400 mb-4 leading-relaxed">
                如果你有任何问题或建议，欢迎通过以下方式联系我。
              </p>
              <div className="space-y-2 text-gray-400">
                <p>📧 admin@blog.com</p>
                <p>🐙 GitHub: @yourname</p>
                <p>🐦 Twitter: @yourname</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Z~Blog. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
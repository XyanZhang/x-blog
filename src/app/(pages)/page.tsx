// src/app/(pages)/page.tsx
import { FC } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, Eye, User } from 'lucide-react'

const HomePage: FC = () => {
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
              <Link href="/about" className="text-gray-700 hover:text-blue-600">关于</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 简化的英雄区域 */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            分享技术，记录生活
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            欢迎来到我的个人博客！
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

      {/* 简化的文章列表 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">最新文章</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <article key={i} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl">📝</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  示例文章 {i}
                </h3>
                <p className="text-gray-600 mb-4">
                  这是一篇示例文章的摘要内容...
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  2024-01-15
                  <Eye className="h-4 w-4 ml-4 mr-1" />
                  42
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 简化的页脚 */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p>&copy; 2024 我的博客. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
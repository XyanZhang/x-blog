import { FC } from 'react'
import Link from 'next/link'
import { Metadata } from 'next/metadata'
import { Folder, FileText, TrendingUp, Calendar } from 'lucide-react'

import { getCategoriesWithStats, getBlogStats } from '@/lib/db'
import type { CategoriesPageData } from '@/types/blog'

export const metadata: Metadata = {
  title: '文章分类 - Z~Blog',
  description: '浏览所有文章分类，发现感兴趣的主题内容',
  openGraph: {
    title: '文章分类 - Z~Blog',
    description: '浏览所有文章分类，发现感兴趣的主题内容',
  }
}

// 获取分类页面数据
async function getCategoriesPageData(): Promise<CategoriesPageData> {
  const [categories, stats] = await Promise.all([
    getCategoriesWithStats(),
    getBlogStats()
  ])

  return {
    categories,
    totalPosts: stats.totalPosts
  }
}

const CategoriesPage: FC = async () => {
  const { categories, totalPosts } = await getCategoriesPageData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Folder className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">文章分类</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              探索不同主题的文章内容，找到你感兴趣的领域
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <FileText className="h-4 w-4 mr-1" />
              <span>共 {categories.length} 个分类</span>
              <span className="mx-2">•</span>
              <span>{totalPosts} 篇文章</span>
            </div>
          </div>
        </div>
      </header>

      {/* 分类网格 */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border border-gray-100"
              >
                {/* 分类图标和颜色条 */}
                <div className="relative">
                  <div 
                    className="w-full h-2 rounded-full mb-6"
                    style={{ backgroundColor: category.color || '#6b7280' }}
                  />
                  <div className="text-center">
                    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-200">
                      {category.icon || '📁'}
                    </div>
                  </div>
                </div>

                {/* 分类信息 */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  {/* 统计信息 */}
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>{category._count.posts} 篇</span>
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: category.color || '#6b7280',
                          width: `${Math.min((category._count.posts / Math.max(...categories.map(c => c._count.posts))) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      占总文章数 {totalPosts > 0 ? Math.round((category._count.posts / totalPosts) * 100) : 0}%
                    </p>
                  </div>
                </div>

                {/* 悬停效果 */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无分类</h3>
            <p className="text-gray-500">还没有创建任何文章分类</p>
          </div>
        )}

        {/* 分类统计 */}
        {categories.length > 0 && (
          <div className="mt-16 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">分类统计</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{categories.length}</div>
                <div className="text-sm text-gray-600">分类总数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{totalPosts}</div>
                <div className="text-sm text-gray-600">文章总数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {categories.length > 0 ? Math.round(totalPosts / categories.length) : 0}
                </div>
                <div className="text-sm text-gray-600">平均每分类</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {Math.max(...categories.map(c => c._count.posts), 0)}
                </div>
                <div className="text-sm text-gray-600">最多文章数</div>
              </div>
            </div>
          </div>
        )}

        {/* 返回链接 */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            返回首页
          </Link>
        </div>
      </main>
    </div>
  )
}

export default CategoriesPage 
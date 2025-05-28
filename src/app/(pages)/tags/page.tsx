import { FC } from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { Tag, FileText, TrendingUp, Hash } from 'lucide-react'

import { getTagsWithStats, getBlogStats } from '@/lib/db'
import type { TagsPageData } from '@/types/blog'

export const metadata: Metadata = {
  title: '标签库 - 我的博客',
  description: '浏览所有文章标签，发现感兴趣的主题内容',
  openGraph: {
    title: '标签库 - 我的博客',
    description: '浏览所有文章标签，发现感兴趣的主题内容',
  }
}

// 获取标签页面数据
async function getTagsPageData(): Promise<TagsPageData> {
  const [tags, stats] = await Promise.all([
    getTagsWithStats(),
    getBlogStats()
  ])

  return {
    tags,
    totalPosts: stats.totalPosts
  }
}

const TagsPage: FC = async () => {
  const { tags, totalPosts } = await getTagsPageData()

  // 根据使用频率分组标签
  const hotTags = tags.filter(tag => tag._count.posts >= 2)
  const normalTags = tags.filter(tag => tag._count.posts === 1)
  const unusedTags = tags.filter(tag => tag._count.posts === 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Hash className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">标签库</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              通过标签快速找到相关主题的文章内容
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Tag className="h-4 w-4 mr-1" />
              <span>共 {tags.length} 个标签</span>
              <span className="mx-2">•</span>
              <span>{totalPosts} 篇文章</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* 热门标签 */}
        {hotTags.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <TrendingUp className="h-6 w-6 text-red-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">热门标签</h2>
              <span className="ml-3 text-sm text-gray-500">({hotTags.length}个)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {hotTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="group bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: tag.color || '#6b7280' }}
                      />
                      <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        #{tag.name}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>{tag._count.posts}</span>
                    </div>
                  </div>
                  
                  {tag.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {tag.description}
                    </p>
                  )}

                  {/* 使用频率条 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>使用频率</span>
                      <span>{Math.round((tag._count.posts / Math.max(...tags.map(t => t._count.posts))) * 100)}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: tag.color || '#6b7280',
                          width: `${Math.min((tag._count.posts / Math.max(...tags.map(t => t._count.posts))) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 普通标签 */}
        {normalTags.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <Tag className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">全部标签</h2>
              <span className="ml-3 text-sm text-gray-500">({normalTags.length}个)</span>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap gap-3">
                {normalTags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="inline-flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm transition-colors group"
                  >
                    <div 
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: tag.color || '#6b7280' }}
                    />
                    <span className="font-medium text-gray-700 group-hover:text-blue-600">#{tag.name}</span>
                    <span className="ml-2 text-xs text-gray-500">({tag._count.posts})</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 标签云 */}
        {tags.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">标签云</h2>
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
              <div className="flex flex-wrap justify-center gap-4">
                {tags.map((tag) => {
                  const size = Math.min(Math.max(tag._count.posts, 1), 5)
                  const sizeClasses = {
                    1: 'text-sm',
                    2: 'text-base',
                    3: 'text-lg',
                    4: 'text-xl',
                    5: 'text-2xl'
                  }
                  
                  return (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.slug}`}
                      className={`${sizeClasses[size as keyof typeof sizeClasses]} font-medium hover:opacity-70 transition-all duration-200 hover:scale-110`}
                      style={{ color: tag.color || '#6b7280' }}
                    >
                      #{tag.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* 标签统计 */}
        <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">标签统计</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{tags.length}</div>
              <div className="text-sm text-gray-600">标签总数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{hotTags.length}</div>
              <div className="text-sm text-gray-600">热门标签</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {tags.length > 0 ? Math.round(totalPosts / tags.length) : 0}
              </div>
              <div className="text-sm text-gray-600">平均每标签</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {Math.max(...tags.map(t => t._count.posts), 0)}
              </div>
              <div className="text-sm text-gray-600">最多使用</div>
            </div>
          </div>
        </section>

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

export default TagsPage 
import { FC } from 'react'
import Link from 'next/link'
import { Metadata } from 'next/metadata'
import { notFound } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  Eye, 
  Heart, 
  MessageCircle, 
  FileText,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import { getPostsByCategory, getCategoriesWithStats } from '@/lib/db'
import type { CategoryPageData } from '@/types/blog'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}

// 生成动态元数据
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const { category } = await getPostsByCategory(slug, 1, 1)
  
  if (!category) {
    return {
      title: '分类不存在 - 我的博客'
    }
  }

  return {
    title: `${category.name} - 文章分类 - 我的博客`,
    description: category.description || `浏览 ${category.name} 分类下的所有文章`,
    openGraph: {
      title: `${category.name} - 文章分类`,
      description: category.description || `浏览 ${category.name} 分类下的所有文章`,
    }
  }
}

// 格式化日期
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// 分页组件
const Pagination: FC<{
  currentPage: number
  totalPages: number
  categorySlug: string
}> = ({ currentPage, totalPages, categorySlug }) => {
  if (totalPages <= 1) return null

  const pages = []
  const showPages = 5
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
  let endPage = Math.min(totalPages, startPage + showPages - 1)

  if (endPage - startPage + 1 < showPages) {
    startPage = Math.max(1, endPage - showPages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-12">
      {/* 上一页 */}
      {currentPage > 1 && (
        <Link
          href={`/categories/${categorySlug}?page=${currentPage - 1}`}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          上一页
        </Link>
      )}

      {/* 页码 */}
      {pages.map((page) => (
        <Link
          key={page}
          href={`/categories/${categorySlug}?page=${page}`}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </Link>
      ))}

      {/* 下一页 */}
      {currentPage < totalPages && (
        <Link
          href={`/categories/${categorySlug}?page=${currentPage + 1}`}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          下一页
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      )}
    </div>
  )
}

const CategoryPage: FC<CategoryPageProps> = async ({ params, searchParams }) => {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const currentPage = parseInt(pageParam || '1', 10)
  const postsPerPage = 10

  // 获取分类数据
  const { posts, category, totalCount, totalPages } = await getPostsByCategory(
    slug, 
    currentPage, 
    postsPerPage
  )

  if (!category) {
    notFound()
  }

  // 获取所有分类（用于侧边栏）
  const allCategories = await getCategoriesWithStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 返回导航 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link 
            href="/categories" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回分类列表
          </Link>
        </div>
      </div>

      {/* 分类头部 */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            {/* 分类图标和颜色条 */}
            <div className="flex items-center justify-center mb-6">
              <div 
                className="p-4 rounded-full text-white mr-4"
                style={{ backgroundColor: category.color || '#6b7280' }}
              >
                <span className="text-3xl">{category.icon || '📁'}</span>
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold text-gray-900">{category.name}</h1>
                {category.description && (
                  <p className="text-xl text-gray-600 mt-2">{category.description}</p>
                )}
              </div>
            </div>

            {/* 统计信息 */}
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                <span>{totalCount} 篇文章</span>
              </div>
              {totalPages > 1 && (
                <>
                  <span>•</span>
                  <span>第 {currentPage} 页，共 {totalPages} 页</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 主内容区 */}
          <main className="lg:col-span-3">
            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="md:flex">
                      {/* 文章缩略图 */}
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
                            style={{ backgroundColor: category.color || '#6b7280' }}
                          >
                            <span className="text-white text-4xl">{category.icon || '📝'}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* 文章内容 */}
                      <div className="md:w-2/3 p-6">
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

                        {/* 作者信息 */}
                        <div className="flex items-center mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="h-4 w-4 mr-1" />
                            <span>{post.author.displayName}</span>
                          </div>
                        </div>

                        {/* 文章元信息 */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(post.publishedAt!)}
                            </div>
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
                            <div className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {post._count.comments}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文章</h3>
                <p className="text-gray-500">该分类下还没有文章</p>
              </div>
            )}

            {/* 分页 */}
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              categorySlug={slug}
            />
          </main>

          {/* 侧边栏 */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* 当前分类信息 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">分类信息</h3>
                <div 
                  className="p-4 rounded-lg text-white text-center"
                  style={{ backgroundColor: category.color || '#6b7280' }}
                >
                  <div className="text-3xl mb-2">{category.icon || '📁'}</div>
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm opacity-90 mt-1">{totalCount} 篇文章</div>
                </div>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-4">
                    {category.description}
                  </p>
                )}
              </div>

              {/* 其他分类 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">其他分类</h3>
                <div className="space-y-2">
                  {allCategories
                    .filter(cat => cat.id !== category.id)
                    .map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{cat.icon || '📁'}</span>
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{cat._count.posts}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 返回链接 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="space-y-3">
                  <Link
                    href="/categories"
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    所有分类
                  </Link>
                  <Link
                    href="/"
                    className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    返回首页
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default CategoryPage 
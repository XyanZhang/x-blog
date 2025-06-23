import { FC } from 'react'
import Link from 'next/link'
import { getRecentPosts } from '@/lib/db'

const TestCoverImagesPage: FC = async () => {
  const posts = await getRecentPosts(10)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">封面图片测试页面</h1>
          <p className="text-gray-600">验证文章封面图片功能是否正常工作</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* 封面图片 */}
              <div className="h-48 relative">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">无封面图片</span>
                  </div>
                )}
              </div>

              {/* 文章信息 */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <Link href={`/posts/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                
                {/* 封面图片URL */}
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <strong>封面图片URL:</strong><br />
                  {post.coverImage || '无封面图片'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/admin/posts/new"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            创建新文章测试封面图片
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TestCoverImagesPage 
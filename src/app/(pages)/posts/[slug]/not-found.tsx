import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'

export default function PostNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <FileQuestion className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">文章未找到</h1>
          <p className="text-gray-600 mb-8">
            抱歉，您要查找的文章不存在或已被删除。
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            返回首页
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              浏览所有文章
            </Link>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>如果您认为这是一个错误，请</p>
          <a href="mailto:admin@blog.com" className="text-blue-600 hover:text-blue-700">
            联系我们
          </a>
        </div>
      </div>
    </div>
  )
} 
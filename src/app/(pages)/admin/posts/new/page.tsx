'use client'

import { FC, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import dynamic from 'next/dynamic'

// 动态导入Markdown编辑器以避免SSR问题
const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>
})

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

const NewPostPage: FC = () => {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  
  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    categoryId: '',
    isPublished: false,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    coverImage: ''
  })

  // 获取分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('获取分类失败:', error)
      }
    }
    fetchCategories()
  }, [])

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/admin/posts/edit/${result.id}`)
      } else {
        const error = await response.json()
        alert(error.message || '创建文章失败')
      }
    } catch (error) {
      console.error('创建文章失败:', error)
      alert('创建文章失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  // 处理封面图片上传
  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 检查文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setFormData(prev => ({ ...prev, coverImage: result.url }))
      } else {
        const error = await response.json()
        alert(error.message || '上传失败')
      }
    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败，请重试')
    }
  }

  // 生成默认SVG封面图片
  const generateDefaultCover = () => {
    const title = formData.title || '新文章'
    const category = categories.find(c => c.id === formData.categoryId)
    const categoryName = category?.name || '文章'
    const categoryIcon = category?.icon || '📝'
    const categoryColor = category?.color || '#6b7280'

    const svg = `
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${categoryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${categoryColor}dd;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="400" fill="url(#grad)"/>
  <circle cx="200" cy="200" r="80" fill="rgba(255,255,255,0.1)"/>
  <circle cx="600" cy="150" r="60" fill="rgba(255,255,255,0.05)"/>
  <circle cx="650" cy="300" r="40" fill="rgba(255,255,255,0.08)"/>
  <text x="400" y="180" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">${categoryIcon}</text>
  <text x="400" y="240" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">${categoryName}</text>
  <text x="400" y="280" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="rgba(255,255,255,0.8)">${title}</text>
</svg>`

    // 使用 encodeURIComponent 处理中文字符
    const encodedSvg = encodeURIComponent(svg)
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`
    setFormData(prev => ({ ...prev, coverImage: svgDataUrl }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">新建文章</h1>
                <p className="mt-2 text-gray-600">创建新的博客文章</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                {isPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {isPreview ? '编辑' : '预览'}
              </button>
              <button
                type="submit"
                form="post-form"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>

        {/* 表单 */}
        <form id="post-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  文章标题 *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入文章标题"
                />
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  分类
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">选择分类</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 摘要 */}
            <div className="mt-6">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                文章摘要
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入文章摘要"
              />
            </div>

            {/* 封面图片 */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                封面图片
              </label>
              <div className="space-y-4">
                {/* 图片预览 */}
                {formData.coverImage && (
                  <div className="relative">
                    <img
                      src={formData.coverImage}
                      alt="封面预览"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                {/* 上传按钮 */}
                <div className="flex items-center space-x-4">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    选择图片
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={generateDefaultCover}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    生成默认封面
                  </button>
                  {formData.coverImage && (
                    <span className="text-sm text-gray-500">
                      已选择封面图片
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  支持 JPG、PNG、GIF 格式，文件大小不超过 5MB
                </p>
              </div>
            </div>

            {/* 发布状态 */}
            <div className="mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">立即发布</span>
              </label>
            </div>
          </div>

          {/* Markdown编辑器 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">文章内容</h2>
            </div>
            <div className="p-6">
              <MarkdownEditor
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                isPreview={isPreview}
              />
            </div>
          </div>

          {/* SEO设置 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO设置</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta标题
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="SEO标题（留空使用文章标题）"
                />
              </div>

              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta描述
                </label>
                <input
                  type="text"
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="SEO描述（留空使用文章摘要）"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700 mb-2">
                Meta关键词
              </label>
              <input
                type="text"
                id="metaKeywords"
                name="metaKeywords"
                value={formData.metaKeywords}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="关键词，用逗号分隔"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewPostPage 
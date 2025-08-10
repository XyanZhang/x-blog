'use client'

import { FC, useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Save, ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/app/_components/shadcn/ui/button'
import { Input } from '@/app/_components/shadcn/ui/input'
import { Label } from '@/app/_components/shadcn/ui/label'
import { Textarea } from '@/app/_components/shadcn/ui/textarea'

interface Tag {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    posts: number
  }
}

const EditTagPage: FC = () => {
  const router = useRouter()
  const params = useParams()
  const tagId = params.id as string
  
  const [tag, setTag] = useState<Tag | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    isActive: true
  })

  // 获取标签数据
  useEffect(() => {
    const fetchTag = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/admin/tags/${tagId}`)
        if (response.ok) {
          const tagData: Tag = await response.json()
          setTag(tagData)
          setFormData({
            name: tagData.name,
            description: tagData.description || '',
            color: tagData.color || '#3b82f6',
            isActive: tagData.isActive
          })
        } else {
          alert('获取标签失败')
          router.push('/admin/tags')
        }
      } catch (error) {
        console.error('获取标签出错:', error)
        alert('获取标签时出错')
        router.push('/admin/tags')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (tagId) {
      fetchTag()
    }
  }, [tagId, router])

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('标签名称不能为空')
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch(`/api/admin/tags/${tagId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('标签更新成功')
        router.push('/admin/tags')
      } else {
        const error = await response.json()
        alert(`更新失败: ${error.message}`)
      }
    } catch (error) {
      console.error('更新标签出错:', error)
      alert('更新标签时出错')
    } finally {
      setIsSaving(false)
    }
  }

  // 处理删除
  const handleDelete = async () => {
    if (!confirm('确定要删除这个标签吗？此操作不可撤销。')) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/tags/${tagId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('标签删除成功')
        router.push('/admin/tags')
      } else {
        const error = await response.json()
        alert(`删除失败: ${error.message}`)
      }
    } catch (error) {
      console.error('删除标签出错:', error)
      alert('删除标签时出错')
    } finally {
      setIsDeleting(false)
    }
  }

  // 处理表单变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  // 处理复选框变化
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      isActive: e.target.checked
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!tag) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">标签不存在</p>
          <Button 
            onClick={() => router.push('/admin/tags')}
            className="mt-4"
          >
            返回标签列表
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">编辑标签</h1>
              <p className="mt-2 text-gray-600">修改标签信息</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => router.push('/admin/tags')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回列表
            </Button>
          </div>
        </div>

        {/* 编辑表单 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 标签名称 */}
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                标签名称 *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="输入标签名称"
                required
                className="w-full"
              />
            </div>

            {/* 标签描述 */}
            <div>
              <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                标签描述
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="输入标签描述（可选）"
                rows={3}
                className="w-full"
              />
            </div>

            {/* 标签颜色 */}
            <div>
              <Label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                标签颜色
              </Label>
              <div className="flex items-center space-x-3">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={handleChange}
                  name="color"
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>

            {/* 是否激活 */}
            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                激活标签
              </Label>
            </div>

            {/* 标签信息 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">标签信息</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">别名:</span> {tag.slug}
                </div>
                <div>
                  <span className="font-medium">关联文章:</span> {tag._count.posts} 篇
                </div>
                <div>
                  <span className="font-medium">创建时间:</span> {new Date(tag.createdAt).toLocaleDateString('zh-CN')}
                </div>
                <div>
                  <span className="font-medium">更新时间:</span> {new Date(tag.updatedAt).toLocaleDateString('zh-CN')}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? '删除中...' : '删除标签'}
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/tags')}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? '保存中...' : '保存更改'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditTagPage 
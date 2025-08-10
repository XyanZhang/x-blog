'use client'

import { FC, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'
import { Button } from '@/app/_components/shadcn/ui/button'
import { Input } from '@/app/_components/shadcn/ui/input'
import { Label } from '@/app/_components/shadcn/ui/label'
import { Textarea } from '@/app/_components/shadcn/ui/textarea'

const NewTagPage: FC = () => {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    isActive: true
  })

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('标签名称不能为空')
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('标签创建成功')
        router.push('/admin/tags')
      } else {
        const error = await response.json()
        alert(`创建失败: ${error.message}`)
      }
    } catch (error) {
      console.error('创建标签出错:', error)
      alert('创建标签时出错')
    } finally {
      setIsSaving(false)
    }
  }

  // 处理表单变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 处理复选框变化
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      isActive: e.target.checked
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">新建标签</h1>
              <p className="mt-2 text-gray-600">创建一个新的标签</p>
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

        {/* 创建表单 */}
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
              <p className="mt-1 text-sm text-gray-500">
                标签名称将自动生成别名（slug）
              </p>
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
              <p className="mt-1 text-sm text-gray-500">
                描述标签的用途和含义
              </p>
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
              <p className="mt-1 text-sm text-gray-500">
                选择标签的显示颜色
              </p>
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
              <p className="ml-2 text-sm text-gray-500">
                激活的标签可以在文章中使用
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t">
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
                {isSaving ? '创建中...' : '创建标签'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewTagPage 
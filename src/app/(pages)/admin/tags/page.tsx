'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/_components/shadcn/ui/button'
import { Input } from '@/app/_components/shadcn/ui/input'
import { Badge } from '@/app/_components/shadcn/ui/badge'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react'

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

interface TagsResponse {
  tags: Tag[]
  total: number
  page: number
  totalPages: number
}

export default function TagsManagementPage() {
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTags, setTotalTags] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // 获取标签列表
  const fetchTags = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      
      if (isActiveFilter !== 'all') {
        params.append('isActive', isActiveFilter)
      }

      const response = await fetch(`/api/admin/tags?${params}`)
      if (response.ok) {
        const data: TagsResponse = await response.json()
        setTags(data.tags)
        setTotalPages(data.totalPages)
        setTotalTags(data.total)
      } else {
        console.error('获取标签失败')
      }
    } catch (error) {
      console.error('获取标签出错:', error)
    } finally {
      setLoading(false)
    }
  }

  // 删除标签
  const deleteTag = async (tagId: string) => {
    if (!confirm('确定要删除这个标签吗？删除后无法恢复。')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/tags/${tagId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // 重新获取标签列表
        fetchTags()
        // 从选中列表中移除
        setSelectedTags(prev => prev.filter(id => id !== tagId))
      } else {
        const error = await response.json()
        alert(`删除失败: ${error.message}`)
      }
    } catch (error) {
      console.error('删除标签出错:', error)
      alert('删除标签时出错')
    }
  }

  // 批量删除标签
  const deleteSelectedTags = async () => {
    if (selectedTags.length === 0) {
      alert('请先选择要删除的标签')
      return
    }

    if (!confirm(`确定要删除选中的 ${selectedTags.length} 个标签吗？`)) {
      return
    }

    try {
      const deletePromises = selectedTags.map(tagId => 
        fetch(`/api/admin/tags/${tagId}`, { method: 'DELETE' })
      )
      
      await Promise.all(deletePromises)
      
      // 重新获取标签列表
      fetchTags()
      setSelectedTags([])
      alert('批量删除成功')
    } catch (error) {
      console.error('批量删除出错:', error)
      alert('批量删除时出错')
    }
  }

  // 切换标签状态
  const toggleTagStatus = async (tagId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/tags/${tagId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      })

      if (response.ok) {
        // 更新本地状态
        setTags(prev => prev.map(tag => 
          tag.id === tagId ? { ...tag, isActive: !currentStatus } : tag
        ))
      } else {
        const error = await response.json()
        alert(`更新状态失败: ${error.message}`)
      }
    } catch (error) {
      console.error('更新标签状态出错:', error)
      alert('更新标签状态时出错')
    }
  }

  // 搜索和筛选
  const handleSearch = () => {
    setCurrentPage(1)
    fetchTags()
  }

  const handleFilterChange = (filter: string) => {
    setIsActiveFilter(filter)
    setCurrentPage(1)
    fetchTags()
  }

  // 分页
  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedTags.length === tags.length) {
      setSelectedTags([])
    } else {
      setSelectedTags(tags.map(tag => tag.id))
    }
  }

  // 选择/取消选择单个标签
  const toggleTagSelection = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  useEffect(() => {
    fetchTags()
  }, [currentPage])

  if (loading && tags.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">标签管理</h1>
              <p className="mt-2 text-gray-600">管理博客文章的所有标签</p>
            </div>
            <Button 
              onClick={() => router.push('/admin/tags/new')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              新建标签
            </Button>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="搜索标签名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={isActiveFilter === 'all' ? 'default' : 'outline'}
                onClick={() => handleFilterChange('all')}
                size="sm"
              >
                <Filter className="w-4 h-4 mr-1" />
                全部
              </Button>
              <Button
                variant={isActiveFilter === 'true' ? 'default' : 'outline'}
                onClick={() => handleFilterChange('true')}
                size="sm"
              >
                <Eye className="w-4 h-4 mr-1" />
                启用
              </Button>
              <Button
                variant={isActiveFilter === 'false' ? 'default' : 'outline'}
                onClick={() => handleFilterChange('false')}
                size="sm"
              >
                <EyeOff className="w-4 h-4 mr-1" />
                禁用
              </Button>
            </div>

            <Button onClick={handleSearch} className="bg-gray-600 hover:bg-gray-700">
              搜索
            </Button>
          </div>
        </div>

        {/* 批量操作 */}
        {selectedTags.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">
                已选择 {selectedTags.length} 个标签
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTags([])}
                  size="sm"
                >
                  取消选择
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteSelectedTags}
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  批量删除
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 标签列表 */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTags.length === tags.length && tags.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    标签名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    别名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    描述
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    文章数量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => toggleTagSelection(tag.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {tag.color && (
                          <div 
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: tag.color }}
                          />
                        )}
                        <span className="font-medium text-gray-900">{tag.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {tag.slug}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {tag.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <Badge variant="secondary">
                        {tag._count.posts} 篇文章
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={tag.isActive ? 'default' : 'secondary'}
                        className={tag.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {tag.isActive ? '启用' : '禁用'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(tag.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/tags/edit/${tag.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTagStatus(tag.id, tag.isActive)}
                        >
                          {tag.isActive ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteTag(tag.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  显示第 {(currentPage - 1) * 20 + 1} - {Math.min(currentPage * 20, totalTags)} 条，
                  共 {totalTags} 条记录
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    上一页
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    下一页
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 空状态 */}
        {!loading && tags.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无标签</h3>
            <p className="text-gray-500 mb-6">开始创建您的第一个标签吧！</p>
            <Button 
              onClick={() => router.push('/admin/tags/new')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建标签
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 
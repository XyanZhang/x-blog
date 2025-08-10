'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, List } from 'lucide-react'

interface TocItem {
  id: string
  title: string
  level: number
}

interface TableOfContentsProps {
  content: string
  className?: string
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  content, 
  className = '' 
}) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  // 提取Markdown中的标题
  useEffect(() => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const items: TocItem[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const title = match[2].trim()
      const id = generateId(title)
      
      items.push({
        id,
        title,
        level
      })
    }

    setTocItems(items)
  }, [content])

  // 生成锚点ID
  const generateId = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // 监听滚动，高亮当前标题
  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      let currentHeading = ''
      
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect()
        if (rect.top <= 100) {
          currentHeading = heading.id
        }
      })
      
      setActiveId(currentHeading)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 点击跳转到对应标题
  const scrollToHeading = (id: string) => {
    console.log('TableOfContents: 尝试跳转到标题:', id)
    const element = document.getElementById(id)
    if (element) {
      console.log('TableOfContents: 找到元素:', element)
      const top = element.getBoundingClientRect().top + window.scrollY - 80
      console.log('TableOfContents: 滚动到位置:', top)
      window.scrollTo({
        top,
        behavior: 'smooth'
      })
    } else {
      console.log('TableOfContents: 未找到元素:', id)
      console.log('TableOfContents: 当前页面所有标题:', document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    }
  }

  if (tocItems.length === 0) {
    return null
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">文章目录</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {tocItems.length}
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
          title={isCollapsed ? '展开目录' : '折叠目录'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>
      
      {!isCollapsed && (
        <nav className="p-4 space-y-1 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {tocItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                console.log('TableOfContents: 按钮被点击:', item.title, 'ID:', item.id)
                scrollToHeading(item.id)
              }}
              className={`
                block w-full text-left text-sm transition-all duration-200 rounded-lg px-3 py-2 cursor-pointer
                ${item.level === 1 ? 'font-semibold text-gray-900' : 'text-gray-700'}
                ${item.level === 2 ? 'ml-4 font-medium' : ''}
                ${item.level === 3 ? 'ml-8 text-gray-600' : ''}
                ${item.level === 4 ? 'ml-12 text-gray-500' : ''}
                ${item.level === 5 ? 'ml-16 text-gray-500' : ''}
                ${item.level === 6 ? 'ml-20 text-gray-500' : ''}
                ${activeId === item.id 
                  ? 'text-blue-600 bg-blue-50 border-l-4 border-l-blue-600 font-medium shadow-sm' 
                  : 'hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
                }
              `}
              title={item.title}
            >
              <span className="line-clamp-2 leading-relaxed">
                {item.title}
              </span>
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}

export default TableOfContents 
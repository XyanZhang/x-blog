'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

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
    const element = document.getElementById(id)
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({
        top,
        behavior: 'smooth'
      })
    }
  }

  if (tocItems.length === 0) {
    return null
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">文章目录</h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>
      
      {!isCollapsed && (
        <nav className="space-y-1 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {tocItems.map((item, index) => (
            <button
              key={index}
              onClick={() => scrollToHeading(item.id)}
              className={`
                block w-full text-left text-sm transition-colors rounded px-2 py-1
                ${item.level === 1 ? 'font-medium' : ''}
                ${item.level === 2 ? 'ml-3' : ''}
                ${item.level === 3 ? 'ml-6' : ''}
                ${item.level === 4 ? 'ml-9' : ''}
                ${item.level === 5 ? 'ml-12' : ''}
                ${item.level === 6 ? 'ml-15' : ''}
                ${activeId === item.id 
                  ? 'text-blue-600 bg-blue-50 font-medium' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
              title={item.title}
            >
              <span className="line-clamp-2">
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
'use client'

import React, { useState, useEffect } from 'react'
import { ChevronUp, Menu, X } from 'lucide-react'

interface TocItem {
  id: string
  title: string
  level: number
}

interface AdvancedReadingProgressBarProps {
  content: string
}

const AdvancedReadingProgressBar: React.FC<AdvancedReadingProgressBarProps> = ({ content }) => {
  const [progress, setProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [showToc, setShowToc] = useState(false)
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // 如果没有内容，不渲染组件
  if (!content) {
    return null
  }

  // 从DOM中提取标题（等待MarkdownRenderer渲染完成后）
  useEffect(() => {
    // 延迟执行，确保MarkdownRenderer已经渲染完成
    const timer = setTimeout(() => {
      extractHeadings()
    }, 100) // 等待100ms确保渲染完成
    
    // 使用MutationObserver监听DOM变化
    const observer = new MutationObserver(() => {
      extractHeadings()
    })
    
    // 监听整个文档的变化
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [content])

  // 提取标题的函数
  const extractHeadings = () => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const items: TocItem[] = []
    
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1))
      const title = heading.textContent?.trim() || ''
      const id = heading.id || generateId(title)
      
      if (title && id) {
        items.push({ id, title, level })
      }
    })
    
    console.log('提取到的标题:', items)
    setTocItems(items)
  }

  // 生成标题ID
  const generateId = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      // 计算阅读进度
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progressPercent = Math.min((scrollTop / docHeight) * 100, 100)
      setProgress(progressPercent)
      
      // 显示/隐藏回到顶部按钮
      setShowBackToTop(progressPercent > 20)
      
      // 高亮当前阅读位置的标题
      if (tocItems.length > 0) {
        const headings = tocItems.map(item => document.getElementById(item.id)).filter(Boolean)
        let currentId = ''
        
        for (let i = headings.length - 1; i >= 0; i--) {
          const heading = headings[i] as HTMLElement
          if (heading.offsetTop <= scrollTop + 100) {
            currentId = heading.id
            break
          }
        }
        
        if (currentId !== activeId) {
          setActiveId(currentId)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [tocItems, activeId])

  // 滚动到指定标题
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // 回到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* 阅读进度条 */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 浮动按钮容器 */}
      <div className="fixed bottom-6 right-6 z-40 space-y-3">
        {/* 目录按钮 */}
        <button
          onClick={() => setShowToc(!showToc)}
          className="w-12 h-12 bg-blue-600 text-white shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-all duration-200 hover:scale-110"
          title="显示目录"
        >
          <Menu size={20} />
        </button>

        {/* 回到顶部按钮 */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-all duration-200 hover:scale-110 border border-gray-200"
            title="回到顶部"
          >
            <ChevronUp size={20} />
          </button>
        )}
      </div>

      {/* 移动端目录抽屉 */}
      {showToc && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowToc(false)}
          />
          
          {/* 目录内容 */}
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Menu size={24} />
                <h3 className="text-lg font-semibold text-gray-900">文章目录</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {tocItems.length}
                </span>
              </div>
              <button
                onClick={() => setShowToc(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="p-4 space-y-1 max-h-[calc(100vh-10rem)] overflow-y-auto">
              {tocItems.length > 0 ? (
                tocItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToHeading(item.id)}
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
                        : 'hover:text-gray-100 hover:bg-gray-100 hover:shadow-sm'
                      }
                    `}
                    title={item.title}
                  >
                    <span className="block truncate">
                      {item.title}
                    </span>
                </button>
              ))
            ) : (
              <div className="text-gray-500 text-center py-8">
                <p>正在加载目录...</p>
              </div>
            )}
          </nav>
          </div>
        </div>
      )}

      {/* 桌面端目录 */}
      {showToc && (
        <div className="hidden xl:block fixed bottom-24 right-6 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">目录</h3>
            <button
              onClick={() => setShowToc(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1 max-h-[calc(100vh-10rem)] overflow-y-auto">
            {tocItems.length > 0 ? (
              tocItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => scrollToHeading(item.id)}
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
                      : 'hover:text-gray-900 hover:bg-gray-100 hover:shadow-sm'
                    }
                  `}
                  title={item.title}
                >
                  <span className="block truncate">
                    {item.title}
                  </span>
                </button>
              ))
            ) : (
              <div className="text-gray-500 text-center py-8">
                <p>正在加载目录...</p>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  )
}

export default AdvancedReadingProgressBar 
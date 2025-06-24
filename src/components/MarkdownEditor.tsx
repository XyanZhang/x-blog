'use client'

import { FC, useState } from 'react'
import { Bold, Italic, List, ListOrdered, Quote, Code, Link, Image, Eye, EyeOff } from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  isPreview?: boolean
  placeholder?: string
}

const MarkdownEditor: FC<MarkdownEditorProps> = ({
  value,
  onChange,
  isPreview = false,
  placeholder = '开始编写你的文章...'
}) => {
  const [isFullPreview, setIsFullPreview] = useState(false)

  // 工具栏按钮配置
  const toolbarButtons = [
    {
      icon: Bold,
      label: '粗体',
      action: () => insertText('**粗体文本**', 2, 6)
    },
    {
      icon: Italic,
      label: '斜体',
      action: () => insertText('*斜体文本*', 1, 5)
    },
    {
      icon: List,
      label: '无序列表',
      action: () => insertText('- 列表项\n- 列表项\n- 列表项', 0, 0)
    },
    {
      icon: ListOrdered,
      label: '有序列表',
      action: () => insertText('1. 列表项\n2. 列表项\n3. 列表项', 0, 0)
    },
    {
      icon: Quote,
      label: '引用',
      action: () => insertText('> 引用文本', 0, 0)
    },
    {
      icon: Code,
      label: '代码块',
      action: () => insertText('```\n代码块\n```', 0, 0)
    },
    {
      icon: Link,
      label: '链接',
      action: () => insertText('[链接文本](https://example.com)', 1, 5)
    },
    {
      icon: Image,
      label: '图片',
      action: () => insertText('![图片描述](图片URL)', 2, 6)
    }
  ]

  // 插入文本到编辑器
  const insertText = (text: string, startOffset: number, endOffset: number) => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    let newText: string
    if (selectedText) {
      // 如果有选中文本，替换它
      newText = value.substring(0, start) + text + value.substring(end)
    } else {
      // 如果没有选中文本，插入新文本
      newText = value.substring(0, start) + text + value.substring(start)
    }
    
    onChange(newText)
    
    // 设置光标位置
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + startOffset
      textarea.setSelectionRange(newCursorPos, newCursorPos + endOffset)
    }, 0)
  }

  // 处理键盘快捷键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          insertText('**粗体文本**', 2, 6)
          break
        case 'i':
          e.preventDefault()
          insertText('*斜体文本*', 1, 5)
          break
        case 'k':
          e.preventDefault()
          insertText('[链接文本](https://example.com)', 1, 5)
          break
      }
    }
  }

  if (isPreview || isFullPreview) {
    return (
      <div className="border border-gray-300 rounded-lg">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-300 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">预览</span>
          <button
            onClick={() => setIsFullPreview(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <EyeOff className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 prose max-w-none">
          <MarkdownRenderer content={value} />
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-300 rounded-lg">
      {/* 工具栏 */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-300 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.action}
              title={button.label}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            >
              <button.icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsFullPreview(true)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
          title="预览"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      {/* 编辑器 */}
      <div className="relative">
        <textarea
          id="markdown-editor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-96 p-4 border-0 resize-none focus:outline-none focus:ring-0"
          style={{ fontFamily: 'monospace' }}
        />
      </div>

      {/* 字数统计 */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-300 text-sm text-gray-500">
        字数: {value.length} | 行数: {value.split('\n').length}
      </div>
    </div>
  )
}

export default MarkdownEditor 
'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github-dark.css'

interface MarkdownRendererProps {
  content: string
  className?: string
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  // 生成锚点ID的函数
  const generateId = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // 自定义标题渲染
          h1: ({ children }) => {
            const title = typeof children === 'string' ? children : children?.toString() || ''
            const id = generateId(title)
            return (
              <h1 id={id} className="text-3xl font-bold text-gray-900 mb-6 mt-8 pb-2 border-b border-gray-200">
                {children}
              </h1>
            )
          },
          h2: ({ children }) => {
            const title = typeof children === 'string' ? children : children?.toString() || ''
            const id = generateId(title)
            return (
              <h2 id={id} className="text-2xl font-semibold text-gray-900 mb-4 mt-6 pb-2 border-b border-gray-100">
                {children}
              </h2>
            )
          },
          h3: ({ children }) => {
            const title = typeof children === 'string' ? children : children?.toString() || ''
            const id = generateId(title)
            return (
              <h3 id={id} className="text-xl font-semibold text-gray-900 mb-3 mt-5">
                {children}
              </h3>
            )
          },
          h4: ({ children }) => {
            const title = typeof children === 'string' ? children : children?.toString() || ''
            const id = generateId(title)
            return (
              <h4 id={id} className="text-lg font-medium text-gray-900 mb-2 mt-4">
                {children}
              </h4>
            )
          },
          h5: ({ children }) => {
            const title = typeof children === 'string' ? children : children?.toString() || ''
            const id = generateId(title)
            return (
              <h5 id={id} className="text-base font-medium text-gray-900 mb-2 mt-3">
                {children}
              </h5>
            )
          },
          h6: ({ children }) => {
            const title = typeof children === 'string' ? children : children?.toString() || ''
            const id = generateId(title)
            return (
              <h6 id={id} className="text-sm font-medium text-gray-900 mb-2 mt-3">
                {children}
              </h6>
            )
          },
          
          // 段落
          p: ({ children }) => (
            <p className="text-gray-700 leading-relaxed mb-4">
              {children}
            </p>
          ),
          
          // 链接
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          
          // 强调
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">
              {children}
            </strong>
          ),
          
          em: ({ children }) => (
            <em className="italic text-gray-800">
              {children}
            </em>
          ),
          
          // 列表
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 ml-4 space-y-1">
              {children}
            </ul>
          ),
          
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 ml-4 space-y-1">
              {children}
            </ol>
          ),
          
          li: ({ children }) => (
            <li className="text-gray-700">
              {children}
            </li>
          ),
          
          // 代码块
          code: ({ inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              )
            }
            
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          
          pre: ({ children }) => (
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm">
              {children}
            </pre>
          ),
          
          // 引用
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 text-gray-700 italic">
              {children}
            </blockquote>
          ),
          
          // 表格
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-gray-300 bg-white">
                {children}
              </table>
            </div>
          ),
          
          thead: ({ children }) => (
            <thead className="bg-gray-50">
              {children}
            </thead>
          ),
          
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200">
              {children}
            </tbody>
          ),
          
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50">
              {children}
            </tr>
          ),
          
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b border-gray-300">
              {children}
            </th>
          ),
          
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
              {children}
            </td>
          ),
          
          // 水平线
          hr: () => (
            <hr className="my-8 border-t border-gray-300" />
          ),
          
          // 图片
          img: ({ src, alt }) => (
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full h-auto rounded-lg shadow-md mb-4 mx-auto"
              loading="lazy"
            />
          ),
          
          // 删除线（GFM）
          del: ({ children }) => (
            <del className="line-through text-gray-500">
              {children}
            </del>
          ),
          
          // 任务列表（GFM）
          input: ({ type, checked, disabled }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  className="mr-2 accent-blue-600"
                  readOnly
                />
              )
            }
            return <input type={type} />
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer 
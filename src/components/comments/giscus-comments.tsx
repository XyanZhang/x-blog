'use client'

import Giscus from '@giscus/react'
import { useEffect, useState } from 'react'

interface GiscusCommentsProps {
  slug: string
  title: string
}

export default function GiscusComments({ slug, title }: GiscusCommentsProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // 临时配置检查
  const isConfigured = true // 配置完成后改为 true

  if (!mounted) {
    return (
      <div className="mt-8">
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">评论</h3>
          <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
        </div>
      </div>
    )
  }

  if (!isConfigured) {
    return (
      <div className="mt-8">
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">评论</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  评论系统配置中
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>请按照以下步骤配置 Giscus 评论系统：</p>
                  <ol className="mt-2 list-decimal list-inside space-y-1">
                    <li>在 GitHub 仓库中启用 Discussions 功能</li>
                    <li>安装 Giscus GitHub App</li>
                    <li>访问 <a href="https://giscus.app/zh-CN" className="underline" target="_blank" rel="noopener noreferrer">giscus.app</a> 获取配置参数</li>
                    <li>更新组件配置并将 isConfigured 设为 true</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">评论</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>调试信息：</strong><br/>
            仓库: XyanZhang/x-blog<br/>
            页面路径: {slug}<br/>
            标题: {title}
          </p>
        </div>
        <Giscus
          id="comments"
          repo="XyanZhang/x-blog"
          repoId="R_kgDOO3fwTg"
          category="General"
          categoryId="DIC_kwDOO3fwTs4CrNvL"
          mapping="pathname"
          term={slug}
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme="light"
          lang="zh-CN"
          loading="lazy"
        />
      </div>
    </div>
  )
} 
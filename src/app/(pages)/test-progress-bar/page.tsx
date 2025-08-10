'use client'

import React from 'react'
import AdvancedReadingProgressBar from '@/components/AdvancedReadingProgressBar'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function TestProgressBarPage() {
  const sampleContent = `
# 文章标题

## 第一章：介绍

### 1.1 背景
这是一个测试页面，用于验证阅读进度条和目录自动生成功能。

### 1.2 目标
- 测试进度条显示
- 测试目录生成
- 测试滚动跳转

## 第二章：主要内容

### 2.1 功能特性
- 自动提取Markdown标题
- 生成多级目录结构
- 支持平滑滚动跳转
- 响应式设计

### 2.2 技术实现
- React Hooks
- 滚动事件监听
- 动态ID生成
- CSS动画效果

## 第三章：总结

### 3.1 优势
- 用户体验良好
- 代码结构清晰
- 性能优化到位

### 3.2 改进方向
- 支持更多Markdown语法
- 优化移动端体验
- 添加更多自定义选项
`

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          目录自动生成功能测试
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* 增强版阅读进度条和目录 */}
          <AdvancedReadingProgressBar content={sampleContent} />
          
          {/* 使用MarkdownRenderer确保标题有正确的ID */}
          <div className="prose prose-lg max-w-none mt-8">
            <MarkdownRenderer content={sampleContent} />
          </div>
        </div>
        
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">功能说明</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• 页面顶部显示阅读进度条</li>
            <li>• 右下角浮动目录按钮，点击可显示目录</li>
            <li>• 滚动超过20%时显示回到顶部按钮</li>
            <li>• 目录支持多级标题缩进显示</li>
            <li>• 点击目录项可平滑跳转到对应标题</li>
            <li>• 滚动时自动高亮当前阅读位置的标题</li>
            <li>• 移动端友好的抽屉式目录</li>
            <li>• 使用MarkdownRenderer确保标题ID正确生成</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 
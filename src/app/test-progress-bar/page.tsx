'use client';

import { useState } from 'react';
import AdvancedReadingProgressBar from '@/components/AdvancedReadingProgressBar';

export default function TestProgressBarPage() {
  const [showPercentage, setShowPercentage] = useState(true);
  const [showGlow, setShowGlow] = useState(true);
  const [useGradient, setUseGradient] = useState(true);
  const [variant, setVariant] = useState<'thin' | 'medium' | 'thick'>('medium');

  return (
    <div className="min-h-screen bg-background">
      {/* 测试用的长内容 */}
      <div className="space-y-8 p-8">
        <h1 className="text-4xl font-bold text-center gradient-text">
          阅读进度条测试页面
        </h1>
        
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">进度条配置</h2>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showPercentage}
                    onChange={(e) => setShowPercentage(e.target.checked)}
                    className="rounded"
                  />
                  <span>显示百分比</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showGlow}
                    onChange={(e) => setShowGlow(e.target.checked)}
                    className="rounded"
                  />
                  <span>显示发光效果</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={useGradient}
                    onChange={(e) => setUseGradient(e.target.checked)}
                    className="rounded"
                  />
                  <span>使用渐变效果</span>
                </label>
              </div>
              
              <div>
                <label className="text-sm font-medium">进度条粗细：</label>
                <select
                  value={variant}
                  onChange={(e) => setVariant(e.target.value as 'thin' | 'medium' | 'thick')}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="thin">细 (2px)</option>
                  <option value="medium">中等 (4px)</option>
                  <option value="thick">粗 (6px)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">当前配置预览</h2>
            <AdvancedReadingProgressBar
              variant={variant}
              showPercentage={showPercentage}
              showGlow={showGlow}
              useGradient={useGradient}
              className="mb-4"
            />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✅ 进度条已固定在页面顶部，位于header下方</p>
              <p>✅ 滚动页面即可看到效果</p>
              <p>✅ 进度条会自动适应header高度</p>
              <p>✅ 支持多种样式配置选项</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
              💡 使用说明
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• 进度条现在位于header下方，不会被遮挡</li>
              <li>• 使用CSS变量自动适应header高度</li>
              <li>• 支持明暗主题自动切换</li>
              <li>• 响应式设计，适配各种设备</li>
            </ul>
          </div>
        </div>

        {/* 生成大量内容用于测试滚动 */}
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="max-w-2xl mx-auto">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-2">内容区块 {i + 1}</h3>
              <p className="text-muted-foreground">
                这是第 {i + 1} 个内容区块，用于测试阅读进度条的功能。
                当你滚动页面时，顶部的进度条会显示当前的阅读进度。
                进度条支持多种配置选项，包括粗细、发光效果、渐变效果和百分比显示。
              </p>
              <div className="mt-4 p-4 bg-muted rounded">
                <p className="text-sm">
                  区块 {i + 1} 的额外内容：Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
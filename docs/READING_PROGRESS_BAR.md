# 阅读进度条功能说明

## 概述

本项目已集成阅读进度条功能，可以在页面滚动时显示当前阅读进度。进度条固定在页面顶部，提供直观的阅读进度反馈。

## 功能特性

- 🎯 **实时进度显示** - 根据页面滚动位置实时更新进度
- 🎨 **多种样式选项** - 支持细、中、粗三种粗细
- ✨ **发光效果** - 可选的发光和渐变效果
- 📊 **百分比显示** - 可选的进度百分比显示
- 🌈 **主题适配** - 自动适配明暗主题
- 📱 **响应式设计** - 在各种设备上都能正常工作
- 🔝 **智能定位** - 自动位于header下方，避免被遮挡

## 位置说明

### 进度条位置
- 进度条固定在页面顶部，位于header下方
- 使用CSS变量 `--header-height` 自动适应header高度
- 不会被顶部导航栏遮挡
- 支持响应式布局，在不同屏幕尺寸下都能正确显示

### 技术实现
```css
/* 在 globals.css 中定义header高度 */
:root {
  --header-height: 64px;
}

/* 进度条使用CSS变量定位 */
.progress-bar {
  top: var(--header-height);
}
```

## 组件说明

### 基础进度条 (ReadingProgressBar)

简单的进度条组件，适合基本使用场景。

```tsx
import ReadingProgressBar from '@/components/ReadingProgressBar';

<ReadingProgressBar 
  variant="medium"
  showGlow={true}
  useGradient={true}
/>
```

### 高级进度条 (AdvancedReadingProgressBar)

功能更丰富的进度条组件，支持更多配置选项。

```tsx
import AdvancedReadingProgressBar from '@/components/AdvancedReadingProgressBar';

<AdvancedReadingProgressBar 
  variant="medium"
  showPercentage={true}
  showGlow={true}
  useGradient={true}
  onProgressChange={(progress) => console.log(`当前进度: ${progress}%`)}
/>
```

## 配置选项

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'thin' \| 'medium' \| 'thick'` | `'medium'` | 进度条粗细 |
| `showPercentage` | `boolean` | `false` | 是否显示百分比 |
| `showGlow` | `boolean` | `true` | 是否显示发光效果 |
| `useGradient` | `boolean` | `true` | 是否使用渐变效果 |
| `className` | `string` | `''` | 额外的CSS类名 |
| `onProgressChange` | `(progress: number) => void` | `undefined` | 进度变化回调函数 |

## 样式类

### 进度条粗细
- `.progress-thin` - 2px 高度
- `.progress-medium` - 4px 高度  
- `.progress-thick` - 6px 高度

### 特效样式
- `.reading-progress-bar` - 渐变背景
- `.reading-progress-bar-glow` - 发光效果
- `.progress-smooth` - 平滑过渡动画

## 使用方法

### 1. 全局使用（推荐）

在 `src/app/layout.tsx` 中已经集成了进度条，所有页面都会自动显示：

```tsx
import AdvancedReadingProgressBar from '@/components/AdvancedReadingProgressBar';

const RootLayout = ({ children }) => (
  <html>
    <body>
      <AdvancedReadingProgressBar 
        variant="medium"
        showPercentage={true}
        showGlow={true}
        useGradient={true}
      />
      {children}
    </body>
  </html>
);
```

### 2. 页面级使用

在特定页面中使用进度条：

```tsx
import ReadingProgressBar from '@/components/ReadingProgressBar';

export default function MyPage() {
  return (
    <div>
      <ReadingProgressBar variant="thick" />
      {/* 页面内容 */}
    </div>
  );
}
```

### 3. 自定义进度处理

监听进度变化并执行自定义逻辑：

```tsx
import AdvancedReadingProgressBar from '@/components/AdvancedReadingProgressBar';

export default function MyPage() {
  const handleProgressChange = (progress: number) => {
    if (progress > 50) {
      console.log('已阅读过半！');
    }
    if (progress === 100) {
      console.log('阅读完成！');
    }
  };

  return (
    <div>
      <AdvancedReadingProgressBar 
        onProgressChange={handleProgressChange}
        showPercentage={true}
      />
      {/* 页面内容 */}
    </div>
  );
}
```

## 测试页面

访问 `/test-progress-bar` 页面可以：
- 实时预览不同的进度条配置
- 测试各种样式选项
- 查看进度条在不同设置下的效果
- 验证进度条位置是否正确（不被header遮挡）

## 技术实现

- 使用 `useEffect` 和 `useState` 管理状态
- 监听 `scroll` 和 `resize` 事件
- 使用 CSS 变量适配主题色彩和header高度
- 支持服务端渲染 (SSR)
- 使用 Tailwind CSS 进行样式设计
- 智能定位，避免被header遮挡

## 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 性能优化

- 使用 `passive: true` 优化滚动事件监听
- 防抖处理避免过度频繁的更新
- 使用 CSS 硬件加速提升动画性能
- 支持 `backdrop-filter` 的现代浏览器
- 使用CSS变量减少JavaScript计算

## 自定义样式

可以通过修改 `src/app/globals.css` 中的样式类来自定义进度条外观：

```css
.reading-progress-bar {
  background: linear-gradient(90deg, #your-color-1, #your-color-2);
}

.reading-progress-bar-glow {
  box-shadow: 0 0 20px rgba(your-color, 0.5);
}

/* 调整header高度 */
:root {
  --header-height: 80px; /* 如果header高度变化 */
}
```

## 故障排除

### 进度条不显示
- 检查页面是否有足够的内容产生滚动
- 确认组件已正确导入和渲染
- 检查浏览器控制台是否有错误

### 进度条被遮挡
- 确认CSS变量 `--header-height` 已正确定义
- 检查header的z-index是否过高
- 验证进度条的z-index设置

### 进度计算不准确
- 确认页面内容高度计算正确
- 检查是否有动态加载的内容
- 验证滚动事件监听器正常工作

### 样式问题
- 检查 Tailwind CSS 是否正确配置
- 确认 CSS 变量是否正确定义
- 验证浏览器是否支持相关 CSS 特性

## 常见问题

### Q: 进度条被header遮挡怎么办？
A: 进度条已自动定位在header下方，使用CSS变量 `--header-height` 确保正确位置。

### Q: 如何调整进度条位置？
A: 修改 `src/app/globals.css` 中的 `--header-height` 变量值。

### Q: 进度条在移动端显示异常？
A: 进度条已支持响应式设计，会自动适应不同屏幕尺寸。

### Q: 可以同时使用多个进度条吗？
A: 可以，但建议在全局只使用一个，避免重复显示。 
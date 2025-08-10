# 文章目录（TOC）自动生成功能

## 功能概述

本项目实现了完整的文章目录自动生成功能，包括：

- 📚 **自动目录生成** - 从Markdown内容中自动提取标题结构
- 📱 **响应式设计** - 桌面端侧边栏 + 移动端抽屉式目录
- 🎯 **智能高亮** - 滚动时自动高亮当前阅读位置的标题
- 🚀 **平滑跳转** - 点击目录项平滑滚动到对应标题
- 📊 **阅读进度** - 顶部进度条显示阅读进度
- 🔝 **回到顶部** - 智能显示回到顶部按钮

## 组件说明

### 1. TableOfContents 组件

基础的目录组件，用于侧边栏显示。

**特性：**
- 支持6级标题（h1-h6）
- 自动生成锚点ID
- 滚动监听和高亮
- 折叠/展开功能
- 标题数量显示

**使用方法：**
```tsx
import TableOfContents from '@/components/TableOfContents'

<TableOfContents content={post.content} />
```

### 2. AdvancedReadingProgressBar 组件

增强版组件，包含进度条和浮动目录按钮。

**特性：**
- 顶部阅读进度条
- 右下角浮动目录按钮
- 移动端抽屉式目录
- 回到顶部按钮
- 完整的目录功能

**使用方法：**
```tsx
import AdvancedReadingProgressBar from '@/components/AdvancedReadingProgressBar'

<AdvancedReadingProgressBar content={post.content} />
```

## 在文章页面中的集成

### 桌面端布局

```tsx
<div className="relative">
  <div className="max-w-4xl mx-auto px-4 py-8">
    <main>
      {/* 文章内容 */}
      <MarkdownRenderer content={post.content} />
    </main>
  </div>
  
  {/* 侧边栏目录 */}
  <aside className="hidden xl:block fixed right-4 top-20 w-72">
    <TableOfContents content={post.content} />
  </aside>
</div>
```

### 移动端布局

```tsx
{/* 移动端目录 - 在文章内容之前显示 */}
<div className="xl:hidden mb-6">
  <TableOfContents content={post.content} />
</div>

{/* 文章内容 */}
<MarkdownRenderer content={post.content} />
```

### 完整集成示例

```tsx
const PostDetailPage = ({ params }) => {
  return (
    <article className="min-h-screen bg-gray-50">
      {/* 增强版阅读进度条和目录 */}
      <AdvancedReadingProgressBar content={post.content} />
      
      {/* 页面内容 */}
      <div className="relative">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <main>
            {/* 移动端目录 */}
            <div className="xl:hidden mb-6">
              <TableOfContents content={post.content} />
            </main>
            
            {/* 文章内容 */}
            <MarkdownRenderer content={post.content} />
          </main>
        </div>
        
        {/* 桌面端侧边栏 */}
        <aside className="hidden xl:block fixed right-4 top-20 w-72">
          <TableOfContents content={post.content} />
        </aside>
      </div>
    </article>
  )
}
```

## 标题结构要求

目录组件会自动解析Markdown中的标题结构：

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

**注意事项：**
- 标题必须使用标准的Markdown语法（# + 空格 + 标题内容）
- 标题层级建议不要超过6级
- 标题内容会自动转换为URL友好的锚点ID

## 样式定制

### 自定义样式类

```tsx
<TableOfContents 
  content={post.content} 
  className="custom-toc-styles" 
/>
```

### CSS变量

可以通过CSS变量自定义颜色：

```css
:root {
  --toc-active-color: #3b82f6;
  --toc-hover-color: #f3f4f6;
  --toc-border-color: #e5e7eb;
}
```

## 性能优化

### 滚动事件优化

- 使用 `passive: true` 优化滚动事件
- 节流处理滚动事件，避免过度触发
- 滚动监听在组件卸载时自动清理

### 内存管理

- 标题解析结果缓存
- 事件监听器正确清理
- 避免内存泄漏

## 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 测试页面

访问 `/test-progress-bar` 页面可以测试完整的目录功能：

- 多级标题结构
- 滚动高亮
- 点击跳转
- 移动端适配
- 进度条显示

## 故障排除

### 常见问题

1. **目录不显示**
   - 检查文章内容是否包含Markdown标题
   - 确认标题格式正确（# + 空格 + 内容）

2. **锚点跳转不准确**
   - 检查页面是否有固定头部
   - 调整 `scrollToHeading` 函数中的偏移量

3. **移动端目录不工作**
   - 确认 `xl:hidden` 类名正确
   - 检查z-index层级设置

### 调试技巧

- 在浏览器控制台查看组件状态
- 检查DOM元素是否正确生成
- 验证事件监听器是否正常工作

## 未来改进

- [ ] 添加目录搜索功能
- [ ] 支持自定义标题样式
- [ ] 添加目录导出功能
- [ ] 支持多语言标题
- [ ] 添加目录动画效果 
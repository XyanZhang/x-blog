# Giscus 评论系统配置指南

## 1. 准备工作

### 1.1 创建 GitHub 仓库
1. 在 GitHub 上创建一个公开仓库（可以是博客源码仓库）
2. 确保仓库是 **public** 的

### 1.2 启用 Discussions
1. 进入仓库设置页面
2. 滚动到 "Features" 部分
3. 勾选 "Discussions" 选项

## 2. 安装 Giscus App

1. 访问 [Giscus App](https://github.com/apps/giscus)
2. 点击 "Install" 按钮
3. 选择要安装的仓库（可以选择所有仓库或特定仓库）
4. 授权安装

## 3. 获取配置参数

1. 访问 [Giscus 配置页面](https://giscus.app/zh-CN)
2. 填写以下信息：

### 3.1 仓库信息
- **仓库**: `your-username/your-repo-name`
- **页面 ↔️ discussion 映射关系**: 选择 "pathname"
- **Discussion 分类**: 选择 "General" 或创建新分类

### 3.2 特性配置
- **启用反应**: ✅
- **发送 discussion 元数据**: ❌
- **输入框位置**: "评论框在上方"
- **主题**: "light" 或 "dark"
- **语言**: "zh-CN"

### 3.3 获取配置代码
配置完成后，页面会生成类似以下的配置：

```html
<script src="https://giscus.app/client.js"
        data-repo="your-username/your-repo"
        data-repo-id="R_kgDOxxxxxxx"
        data-category="General"
        data-category-id="DIC_kwDOxxxxxxx"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="top"
        data-theme="light"
        data-lang="zh-cn"
        crossorigin="anonymous"
        async>
</script>
```

## 4. 更新博客配置

将获取到的参数更新到 `src/components/comments/giscus-comments.tsx` 文件中：

```typescript
<Giscus
  id="comments"
  repo="your-username/your-repo"           // 替换为您的仓库
  repoId="R_kgDOxxxxxxx"                   // 替换为您的仓库 ID
  category="General"                       // 替换为您的分类
  categoryId="DIC_kwDOxxxxxxx"             // 替换为您的分类 ID
  mapping="pathname"
  term={slug}
  reactionsEnabled="1"
  emitMetadata="0"
  inputPosition="top"
  theme="light"
  lang="zh-CN"
  loading="lazy"
/>
```

## 5. 测试评论功能

1. 启动开发服务器：`pnpm run dev`
2. 访问任意文章页面
3. 滚动到页面底部查看评论区域
4. 使用 GitHub 账号登录并发表测试评论

## 6. 高级配置

### 6.1 主题切换支持
如果需要支持深色模式，可以安装 `next-themes` 并修改组件：

```bash
pnpm add next-themes
```

```typescript
import { useTheme } from 'next-themes'

export default function GiscusComments({ slug, title }: GiscusCommentsProps) {
  const { theme } = useTheme()
  
  return (
    <Giscus
      // ... 其他配置
      theme={theme === 'dark' ? 'dark' : 'light'}
    />
  )
}
```

### 6.2 自定义样式
可以通过 CSS 自定义 Giscus 的样式：

```css
.giscus {
  /* 自定义样式 */
}
```

## 7. 注意事项

1. **仓库必须是公开的** - Giscus 只支持公开仓库
2. **需要启用 Discussions** - 确保仓库已启用 Discussions 功能
3. **安装 Giscus App** - 必须在仓库中安装 Giscus GitHub App
4. **配置参数准确** - 确保 repo、repoId、category、categoryId 等参数正确

## 8. 故障排除

### 8.1 评论区域不显示
- 检查仓库是否为公开
- 确认已安装 Giscus App
- 验证配置参数是否正确

### 8.2 无法发表评论
- 确保用户已登录 GitHub
- 检查仓库权限设置
- 验证 Discussions 是否已启用

### 8.3 样式问题
- 检查 CSS 冲突
- 确认主题设置是否正确
- 验证容器样式是否影响显示

## 9. 示例配置

以下是一个完整的示例配置：

```typescript
// src/components/comments/giscus-comments.tsx
'use client'

import Giscus from '@giscus/react'

interface GiscusCommentsProps {
  slug: string
  title: string
}

export default function GiscusComments({ slug, title }: GiscusCommentsProps) {
  return (
    <div className="mt-8">
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">评论</h3>
        <Giscus
          id="comments"
          repo="zhangxinyan/my-blog"
          repoId="R_kgDOL1234567"
          category="General"
          categoryId="DIC_kwDOL1234567"
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
```

配置完成后，您的博客就拥有了基于 GitHub Discussions 的现代化评论系统！ 
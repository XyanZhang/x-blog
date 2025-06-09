# Giscus 配置检查清单

## 当前状态检查

### 1. GitHub 仓库检查
- [ ] 仓库是否为公开 (Public)
- [ ] 是否启用了 Discussions 功能
- [ ] 是否安装了 Giscus GitHub App

### 2. 访问以下链接进行检查：

#### 检查仓库状态
访问：https://github.com/XyanZhang/x-blog

确认：
- 仓库是公开的
- 在仓库顶部导航栏能看到 "Discussions" 标签

#### 检查 Discussions 是否启用
访问：https://github.com/XyanZhang/x-blog/discussions

如果看到 404 错误，说明 Discussions 未启用。

#### 启用 Discussions
1. 访问：https://github.com/XyanZhang/x-blog/settings
2. 滚动到 "Features" 部分
3. 勾选 "Discussions"

#### 安装 Giscus App
1. 访问：https://github.com/apps/giscus
2. 点击 "Install"
3. 选择 "XyanZhang/x-blog" 仓库
4. 点击 "Install"

### 3. 获取正确的配置参数

访问：https://giscus.app/zh-CN

输入仓库信息：
- 仓库：`XyanZhang/x-blog`
- 等待验证通过（绿色勾号）

选择配置：
- 页面 ↔️ discussion 映射关系：`pathname`
- Discussion 分类：`General`
- 特性：勾选 "启用反应"
- 主题：`light`
- 语言：`zh-CN`

### 4. 复制生成的配置

页面底部会生成类似以下的配置：

```html
<script src="https://giscus.app/client.js"
        data-repo="XyanZhang/x-blog"
        data-repo-id="R_kgDO..."
        data-category="General"
        data-category-id="DIC_kwDO..."
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

### 5. 更新组件配置

将获取的参数更新到 `src/components/comments/giscus-comments.tsx`：

```typescript
<Giscus
  id="comments"
  repo="XyanZhang/x-blog"
  repoId="R_kgDO..." // 替换为实际值
  category="General"
  categoryId="DIC_kwDO..." // 替换为实际值
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

## 常见问题排查

### 问题1：评论区域不显示
- 检查浏览器控制台是否有错误
- 确认仓库配置是否正确
- 验证 Giscus App 是否已安装

### 问题2：显示 "giscus is not installed" 错误
- 确认已安装 Giscus GitHub App
- 检查仓库权限设置

### 问题3：点击评论没有反应
- 确认用户已登录 GitHub
- 检查仓库的 Discussions 权限
- 验证配置参数是否正确

## 测试步骤

1. 完成上述所有配置
2. 访问文章页面
3. 滚动到评论区域
4. 应该能看到 Giscus 评论框
5. 使用 GitHub 账号登录并测试评论功能 
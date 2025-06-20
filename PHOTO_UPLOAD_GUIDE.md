# 图片上传功能使用指南

## 功能概述

图片上传功能允许用户上传图片文件并添加详细的元数据信息，包括标题、描述、拍摄参数等。

## 使用步骤

### 1. 访问上传页面
- 访问 `/admin/photos` 页面（需要登录）
- 或者访问 `/test-upload` 页面进行测试

### 2. 选择图片文件
- 点击"选择文件"按钮
- 选择要上传的图片文件（支持 jpg, jpeg, png, gif, webp 格式）
- 文件大小限制：10MB

### 3. 上传文件
- 选择文件后，会显示"上传文件"按钮
- 点击"上传文件"按钮开始上传
- 上传过程中会显示"上传中..."状态
- 上传成功后，会显示绿色的成功提示和媒体ID

### 4. 填写图片信息
上传成功后，可以填写以下信息：
- **图片标题**：必填，图片的标题
- **图片描述**：可选，图片的详细描述
- **拍摄地点**：可选，拍摄的地理位置
- **拍摄时间**：可选，图片拍摄的时间
- **相机型号**：可选，使用的相机型号
- **镜头型号**：可选，使用的镜头型号
- **拍摄参数**：可选，如 f/2.8, 1/1000s, ISO 100
- **标签**：可选，用逗号分隔多个标签
- **所属图册**：可选，选择图片所属的图册
- **设为精选图片**：可选，是否设为精选图片

### 5. 保存图片信息
- 填写完信息后，点击"保存图片信息"按钮
- 系统会创建图片记录并关联到上传的文件
- 保存成功后会显示成功提示并重置表单

## 注意事项

1. **两步操作**：必须先上传文件，然后才能保存图片信息
2. **文件格式**：只支持常见的图片格式
3. **文件大小**：单个文件不能超过10MB
4. **权限要求**：需要登录才能使用上传功能
5. **图册关联**：可以选择将图片添加到现有图册中

## 常见问题

### Q: 为什么"保存图片信息"按钮无法点击？
A: 需要先点击"上传文件"按钮上传图片文件，上传成功后按钮才会变为可点击状态。

### Q: 上传失败怎么办？
A: 检查文件格式是否正确，文件大小是否超过限制，网络连接是否正常。

### Q: 如何查看已上传的图片？
A: 访问 `/photos` 页面可以查看所有公开的图片，访问 `/albums` 页面可以按图册查看图片。

### Q: 如何编辑已上传的图片信息？
A: 目前功能正在开发中，后续会添加图片编辑功能。

### Q: 为什么外部图片无法显示？
A: 系统已配置支持以下图片服务域名：
- images.unsplash.com
- images.pexels.com
- picsum.photos
- via.placeholder.com
- source.unsplash.com

如果需要支持其他域名，请在 `next.config.ts` 中添加相应的配置。

## 技术实现

- 文件上传：使用 Next.js API 路由处理文件上传
- 文件存储：文件保存在 `public/uploads` 目录
- 数据库：使用 Prisma ORM 管理图片元数据
- 前端：使用 React 和 TypeScript 构建用户界面
- 样式：使用 Tailwind CSS 实现响应式设计
- 图片优化：使用 Next.js Image 组件进行图片优化和懒加载

## API 端点

- `POST /api/upload` - 文件上传
- `POST /api/photos` - 创建图片记录
- `GET /api/photos` - 获取图片列表
- `GET /api/albums` - 获取图册列表

## 配置说明

### 图片域名配置
在 `next.config.ts` 中配置了支持的图片域名：

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
      port: '',
      pathname: '/**',
    },
    // ... 其他域名
  ],
}
```

这样可以确保外部图片能够正常显示，同时保持安全性。 
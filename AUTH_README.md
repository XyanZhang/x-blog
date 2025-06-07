# 注册登录功能说明

## 功能概述

本项目已成功集成了完整的用户注册登录功能，包括：

- 用户注册
- 用户登录
- 用户登出
- 会话管理
- 路由保护
- 用户信息展示

## 技术栈

- **后端认证**: JWT (JSON Web Tokens)
- **密码加密**: bcryptjs
- **数据库**: Prisma + SQLite
- **前端状态管理**: React Context API
- **UI框架**: Tailwind CSS

## API 端点

### 注册
- **POST** `/api/auth/register`
- **请求体**:
  ```json
  {
    "username": "用户名",
    "email": "邮箱",
    "password": "密码",
    "displayName": "显示名称（可选）"
  }
  ```

### 登录
- **POST** `/api/auth/login`
- **请求体**:
  ```json
  {
    "login": "用户名或邮箱",
    "password": "密码"
  }
  ```

### 登出
- **POST** `/api/auth/logout`

### 获取当前用户信息
- **GET** `/api/auth/me`
- **需要认证**: 是

## 页面路由

- `/auth/login` - 登录页面
- `/auth/register` - 注册页面
- `/profile` - 个人资料页面（需要认证）

## 密码要求

- 至少8位字符
- 包含大写字母
- 包含小写字母
- 包含数字

## 用户名要求

- 3-20个字符
- 只能包含字母、数字、下划线和连字符

## 使用方法

### 1. 启动开发服务器
```bash
pnpm run dev
```

### 2. 访问注册页面
打开浏览器访问 `http://localhost:3000/auth/register`

### 3. 创建账户
填写用户名、邮箱和密码，点击注册

### 4. 登录
注册成功后会自动登录，或者访问 `http://localhost:3000/auth/login` 手动登录

### 5. 查看个人资料
登录后访问 `http://localhost:3000/profile` 查看个人信息

## 安全特性

- 密码使用 bcrypt 加密存储
- JWT token 有效期为7天
- 支持 HTTP-only cookies 和 Authorization header
- 路由级别的访问控制
- 输入验证和错误处理

## 环境变量

建议在 `.env.local` 文件中设置以下环境变量：

```env
JWT_SECRET=your-super-secret-jwt-key-here
```

## 测试账户

已创建测试账户：
- 用户名: `testuser`
- 邮箱: `test@example.com`
- 密码: `TestPass123`

## 组件说明

### AuthProvider
提供全局的认证状态管理，包装在根布局中。

### useAuth Hook
用于在组件中访问认证状态和方法：
```tsx
const { user, loading, login, register, logout } = useAuth()
```

### UserNav 组件
显示在页面头部的用户导航，包含登录/注册按钮或用户头像下拉菜单。

### 中间件
自动保护需要认证的路由，未登录用户会被重定向到登录页面。

## 扩展功能

可以进一步添加的功能：
- 邮箱验证
- 密码重置
- 社交登录
- 双因素认证
- 用户角色管理
- 个人资料编辑

## 故障排除

如果遇到问题，请检查：
1. 数据库连接是否正常
2. JWT_SECRET 是否设置
3. 浏览器控制台是否有错误信息
4. 网络请求是否成功 
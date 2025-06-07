import type { FC } from 'react'

const AboutPage: FC = () => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">关于 Z~Blog</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              欢迎来到 Z~Blog，这是一个基于 Next.js 构建的现代化博客平台。
              我们致力于分享技术知识，记录生活点滴，为读者提供有价值的内容。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">技术栈</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>前端框架：Next.js 15 + React 19</li>
              <li>样式框架：Tailwind CSS</li>
              <li>数据库：Prisma + SQLite</li>
              <li>身份认证：JWT + bcryptjs</li>
              <li>内容渲染：Markdown + 语法高亮</li>
              <li>部署平台：Vercel</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">功能特性</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>📝 Markdown 文章编写与渲染</li>
              <li>🔐 用户注册登录系统</li>
              <li>🏷️ 文章分类和标签管理</li>
              <li>💬 评论系统</li>
              <li>👤 用户个人资料管理</li>
              <li>📱 响应式设计，支持移动端</li>
              <li>🔍 全文搜索功能</li>
              <li>📊 文章阅读统计</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">联系方式</h2>
            <div className="text-gray-600 space-y-2">
              <p>如果您有任何问题或建议，欢迎通过以下方式联系我们：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>邮箱：admin@zblog.com</li>
                <li>GitHub：https://github.com/zblog</li>
                <li>Twitter：@zblog_official</li>
              </ul>
            </div>

            <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
              <p className="text-indigo-800 text-sm">
                💡 本博客系统开源免费，欢迎 Star 和贡献代码！
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default AboutPage 
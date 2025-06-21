import TypewriterText from '@/components/TypewriterText'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-8">
          <TypewriterText 
            texts={[
              '分享技术',
              '记录生活', 
              '探索世界',
              '创造价值',
              '学习成长',
              '传递知识'
            ]}
            speed={120}
            delay={2500}
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
          />
        </h1>
        <p className="text-xl text-gray-600">
          打字机效果演示
        </p>
      </div>
    </div>
  )
} 
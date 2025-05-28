export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tailwind CSS 测试</h1>
        <p className="text-gray-600 mb-4">如果你能看到蓝色背景和这个白色卡片，说明 Tailwind CSS 正在工作。</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          测试按钮
        </button>
      </div>
    </div>
  )
} 
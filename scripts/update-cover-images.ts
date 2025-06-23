import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 生成SVG封面图片
function generateSVGCover(title: string, categoryName: string, categoryIcon: string, categoryColor: string): string {
  const svg = `
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${categoryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${categoryColor}dd;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="400" fill="url(#grad)"/>
  <circle cx="200" cy="200" r="80" fill="rgba(255,255,255,0.1)"/>
  <circle cx="600" cy="150" r="60" fill="rgba(255,255,255,0.05)"/>
  <circle cx="650" cy="300" r="40" fill="rgba(255,255,255,0.08)"/>
  <text x="400" y="180" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">${categoryIcon}</text>
  <text x="400" y="240" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">${categoryName}</text>
  <text x="400" y="280" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="rgba(255,255,255,0.8)">${title}</text>
</svg>`

  // 使用 Buffer 处理中文字符
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`
}

async function updateCoverImages() {
  try {
    // 获取所有有封面图片的文章（包括外部链接的）
    const posts = await prisma.post.findMany({
      where: {
        coverImage: { not: null },
        isDeleted: false
      },
      include: {
        category: true
      }
    })

    console.log(`找到 ${posts.length} 篇有封面图片的文章`)

    // 为每篇文章更新封面图片
    for (const post of posts) {
      // 检查是否是外部链接（via.placeholder.com）
      if (post.coverImage && post.coverImage.includes('via.placeholder.com')) {
        console.log(`更新文章 "${post.title}" 的封面图片`)
        
        // 根据分类生成新的SVG封面
        let newCoverImage = ''
        
        if (post.category) {
          newCoverImage = generateSVGCover(
            post.title,
            post.category.name,
            post.category.icon || '📝',
            post.category.color || '#6b7280'
          )
        } else {
          newCoverImage = generateSVGCover(
            post.title,
            '文章',
            '📝',
            '#6b7280'
          )
        }

        // 更新文章
        await prisma.post.update({
          where: { id: post.id },
          data: { coverImage: newCoverImage }
        })

        console.log(`已更新文章 "${post.title}" 的封面图片`)
      } else {
        console.log(`文章 "${post.title}" 的封面图片无需更新`)
      }
    }

    console.log('所有文章的封面图片已更新完成！')
  } catch (error) {
    console.error('更新封面图片失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateCoverImages() 
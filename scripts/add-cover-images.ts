import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addCoverImages() {
  try {
    // 获取所有没有封面图片的文章
    const posts = await prisma.post.findMany({
      where: {
        coverImage: null,
        isDeleted: false
      },
      include: {
        category: true
      }
    })

    console.log(`找到 ${posts.length} 篇没有封面图片的文章`)

    // 为每篇文章添加默认封面图片
    for (const post of posts) {
      // 根据分类生成不同的默认封面
      let defaultCoverImage = ''
      
      if (post.category) {
        // 使用分类颜色和图标生成默认封面
        const categoryColor = post.category.color || '#6b7280'
        const categoryIcon = post.category.icon || '📝'
        
        // 这里可以使用在线服务生成图片，或者使用预设的图片
        // 暂时使用一个通用的默认图片
        defaultCoverImage = `https://via.placeholder.com/800x400/${categoryColor.replace('#', '')}/ffffff?text=${encodeURIComponent(categoryIcon + ' ' + post.category.name)}`
      } else {
        // 没有分类的文章使用通用封面
        defaultCoverImage = 'https://via.placeholder.com/800x400/6b7280/ffffff?text=📝%20文章'
      }

      // 更新文章
      await prisma.post.update({
        where: { id: post.id },
        data: { coverImage: defaultCoverImage }
      })

      console.log(`已为文章 "${post.title}" 添加封面图片`)
    }

    console.log('所有文章的封面图片已更新完成！')
  } catch (error) {
    console.error('更新封面图片失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addCoverImages() 
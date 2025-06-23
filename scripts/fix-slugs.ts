import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 生成slug - 使用标题和其他参数生成10位hash值
function generateSlug(title: string, authorId: string, timestamp: number): string {
  // 组合标题、作者ID和时间戳
  const input = `${title}-${authorId}-${timestamp}`
  
  // 简单的hash函数生成10位字符串
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  
  // 转换为36进制并取前10位
  const hashStr = Math.abs(hash).toString(36)
  return hashStr.substring(0, 10)
}

async function fixSlugs() {
  try {
    // 获取所有文章
    const posts = await prisma.post.findMany({
      where: {
        isDeleted: false
      },
      select: {
        id: true,
        title: true,
        slug: true,
        authorId: true,
        createdAt: true
      }
    })

    console.log(`找到 ${posts.length} 篇文章需要修复slug`)

    // 为每篇文章生成新的slug
    for (const post of posts) {
      // 检查当前slug是否包含中文字符或特殊字符
      const hasChineseOrSpecialChars = /[^\w-]/.test(post.slug)
      
      if (hasChineseOrSpecialChars) {
        console.log(`修复文章 "${post.title}" 的slug: ${post.slug}`)
        
        // 生成新的slug
        const timestamp = post.createdAt.getTime()
        let newSlug = generateSlug(post.title, post.authorId, timestamp)
        
        // 检查新slug是否已存在
        let existingPost = await prisma.post.findUnique({
          where: { slug: newSlug }
        })
        
        // 如果已存在，重新生成
        while (existingPost && existingPost.id !== post.id) {
          const newTimestamp = Date.now()
          newSlug = generateSlug(post.title, post.authorId, newTimestamp)
          existingPost = await prisma.post.findUnique({
            where: { slug: newSlug }
          })
        }
        
        // 更新文章slug
        await prisma.post.update({
          where: { id: post.id },
          data: { slug: newSlug }
        })
        
        console.log(`已更新为: ${newSlug}`)
      } else {
        console.log(`文章 "${post.title}" 的slug无需修复: ${post.slug}`)
      }
    }

    console.log('所有文章的slug修复完成！')
  } catch (error) {
    console.error('修复slug失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSlugs() 
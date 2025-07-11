import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { calculateReadingTime } from '@/lib/db'

// 获取单个文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // 验证用户登录
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ message: '请先登录' }, { status: 401 })
    }

    const post = await prisma.post.findUnique({
      where: {
        id,
        isDeleted: false
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true
              }
            }
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ message: '文章不存在' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('获取文章失败:', error)
    return NextResponse.json({ message: '获取文章失败' }, { status: 500 })
  }
}

// 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // 验证用户登录
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ message: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      excerpt,
      content,
      categoryId,
      isPublished,
      metaTitle,
      metaDescription,
      metaKeywords,
      coverImage
    } = body

    // 验证必填字段
    if (!title || !content) {
      return NextResponse.json({ message: '标题和内容不能为空' }, { status: 400 })
    }

    // 检查文章是否存在
    const existingPost = await prisma.post.findUnique({
      where: {
        id,
        isDeleted: false
      }
    })

    if (!existingPost) {
      return NextResponse.json({ message: '文章不存在' }, { status: 404 })
    }

    // 生成新的slug（如果标题改变了）
    let slug = existingPost.slug
    if (title !== existingPost.title) {
      // 生成slug - 使用标题和其他参数生成10位hash值
      const generateSlug = (title: string, authorId: string, timestamp: number): string => {
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

      const timestamp = Date.now()
      slug = generateSlug(title, existingPost.authorId, timestamp)

      // 检查新slug是否已存在（排除当前文章）
      const slugExists = await prisma.post.findFirst({
        where: {
          slug,
          id: { not: id },
          isDeleted: false
        }
      })

      if (slugExists) {
        // 如果slug已存在，重新生成
        const newTimestamp = Date.now()
        slug = generateSlug(title, existingPost.authorId, newTimestamp)
        
        // 再次检查是否唯一
        const existingWithNewSlug = await prisma.post.findFirst({
          where: {
            slug,
            id: { not: id },
            isDeleted: false
          }
        })
        
        if (existingWithNewSlug) {
          return NextResponse.json({ message: '文章更新失败，请重试' }, { status: 400 })
        }
      }
    }

    // 更新文章
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt: excerpt || content.substring(0, 200) + '...',
        content,
        htmlContent: content, // 这里可以添加Markdown转HTML的逻辑
        coverImage,
        isPublished,
        publishedAt: isPublished && !existingPost.isPublished ? new Date() : existingPost.publishedAt,
        readingTime: calculateReadingTime(content),
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || content.substring(0, 160),
        metaKeywords,
        categoryId: categoryId || null
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('更新文章失败:', error)
    return NextResponse.json({ message: '更新文章失败' }, { status: 500 })
  }
}

// 删除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // 验证用户登录
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ message: '请先登录' }, { status: 401 })
    }

    // 检查文章是否存在
    const existingPost = await prisma.post.findUnique({
      where: {
        id,
        isDeleted: false
      }
    })

    if (!existingPost) {
      return NextResponse.json({ message: '文章不存在' }, { status: 404 })
    }

    // 软删除文章
    await prisma.post.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    })

    return NextResponse.json({ message: '文章删除成功' })
  } catch (error) {
    console.error('删除文章失败:', error)
    return NextResponse.json({ message: '删除文章失败' }, { status: 500 })
  }
} 
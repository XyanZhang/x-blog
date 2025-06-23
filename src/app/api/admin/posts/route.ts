import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { calculateReadingTime } from '@/lib/db'

// 创建新文章
export async function POST(request: NextRequest) {
  try {
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
      isPublished = false,
      metaTitle,
      metaDescription,
      metaKeywords,
      coverImage
    } = body

    // 验证必填字段
    if (!title || !content) {
      return NextResponse.json({ message: '标题和内容不能为空' }, { status: 400 })
    }

    // 生成slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // 检查slug是否已存在
    const existingPost = await prisma.post.findUnique({
      where: { slug }
    })

    if (existingPost) {
      return NextResponse.json({ message: '文章标题已存在，请使用不同的标题' }, { status: 400 })
    }

    // 创建文章
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt: excerpt || content.substring(0, 200) + '...',
        content,
        htmlContent: content, // 这里可以添加Markdown转HTML的逻辑
        coverImage,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        readingTime: calculateReadingTime(content),
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || content.substring(0, 160),
        metaKeywords,
        authorId: user.id,
        categoryId: categoryId || null
      }
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('创建文章失败:', error)
    return NextResponse.json({ message: '创建文章失败' }, { status: 500 })
  }
}

// 获取文章列表（管理员用）
export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ message: '请先登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const categoryId = searchParams.get('categoryId')
    const isPublished = searchParams.get('isPublished')

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {
      isDeleted: false
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (isPublished !== null) {
      where.isPublished = isPublished === 'true'
    }

    // 获取文章列表
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              avatar: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取文章列表失败:', error)
    return NextResponse.json({ message: '获取文章列表失败' }, { status: 500 })
  }
} 
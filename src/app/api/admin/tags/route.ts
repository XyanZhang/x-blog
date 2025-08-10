import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 获取标签列表（管理员用）
export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ message: '请先登录' }, { status: 401 })
    }

    // 检查用户权限
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: '权限不足' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: {
      isActive?: boolean;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
    } = {}

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 获取标签列表
    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        },
        orderBy: [
          { postCount: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.tag.count({ where })
    ])

    return NextResponse.json({
      tags,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取标签列表失败:', error)
    return NextResponse.json({ message: '获取标签列表失败' }, { status: 500 })
  }
}

// 创建新标签
export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ message: '请先登录' }, { status: 401 })
    }

    // 检查用户权限
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: '权限不足' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, color, isActive = true } = body

    // 验证必填字段
    if (!name) {
      return NextResponse.json({ message: '标签名称不能为空' }, { status: 400 })
    }

    // 生成slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // 检查标签名是否已存在
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ]
      }
    })

    if (existingTag) {
      return NextResponse.json({ message: '标签名称或别名已存在' }, { status: 400 })
    }

    // 创建标签
    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
        description,
        color,
        isActive,
        postCount: 0
      }
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('创建标签失败:', error)
    return NextResponse.json({ message: '创建标签失败' }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 获取单个标签
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

    // 检查用户权限
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: '权限不足' }, { status: 403 })
    }

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    if (!tag) {
      return NextResponse.json({ message: '标签不存在' }, { status: 404 })
    }

    return NextResponse.json(tag)
  } catch (error) {
    console.error('获取标签失败:', error)
    return NextResponse.json({ message: '获取标签失败' }, { status: 500 })
  }
}

// 更新标签
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

    // 检查用户权限
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: '权限不足' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, color, isActive } = body

    // 验证必填字段
    if (!name) {
      return NextResponse.json({ message: '标签名称不能为空' }, { status: 400 })
    }

    // 生成slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // 检查标签名是否已存在（排除当前标签）
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ],
        NOT: {
          id
        }
      }
    })

    if (existingTag) {
      return NextResponse.json({ message: '标签名称或别名已存在' }, { status: 400 })
    }

    // 更新标签
    const updatedTag = await prisma.tag.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        color,
        isActive
      }
    })

    return NextResponse.json(updatedTag)
  } catch (error) {
    console.error('更新标签失败:', error)
    return NextResponse.json({ message: '更新标签失败' }, { status: 500 })
  }
}

// 删除标签
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

    // 检查用户权限
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: '权限不足' }, { status: 403 })
    }

    // 检查标签是否被文章使用
    const tagUsage = await prisma.postTag.findFirst({
      where: { tagId: id }
    })

    if (tagUsage) {
      return NextResponse.json({ 
        message: '该标签正在被文章使用，无法删除。请先移除文章中的标签关联。' 
      }, { status: 400 })
    }

    // 删除标签
    await prisma.tag.delete({
      where: { id }
    })

    return NextResponse.json({ message: '标签删除成功' })
  } catch (error) {
    console.error('删除标签失败:', error)
    return NextResponse.json({ message: '删除标签失败' }, { status: 500 })
  }
} 
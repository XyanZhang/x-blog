import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 获取所有分类
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
        slug: true,
        description: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('获取分类失败:', error)
    return NextResponse.json({ message: '获取分类失败' }, { status: 500 })
  }
} 
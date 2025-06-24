import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 获取所有分类
export async function GET() {
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
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// 获取图册列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');
    const creatorId = searchParams.get('creatorId');

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {
      isPublished: true,
      isPrivate: false,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (creatorId) {
      where.creatorId = creatorId;
    }

    const [albums, total] = await Promise.all([
      prisma.photoAlbum.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          photos: {
            include: {
              media: true,
            },
            take: 4, // 只获取前4张图片作为预览
            orderBy: {
              createdAt: 'desc',
            },
          },
          _count: {
            select: {
              photos: true,
            },
          },
        },
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.photoAlbum.count({ where }),
    ]);

    return NextResponse.json({
      albums,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}

// 创建新图册
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      coverImage,
      isPublished = false,
      isPrivate = false,
    } = body;

    // 生成slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // 检查slug是否已存在
    const existingAlbum = await prisma.photoAlbum.findUnique({
      where: { slug },
    });

    if (existingAlbum) {
      return NextResponse.json(
        { error: 'Album with this title already exists' },
        { status: 400 }
      );
    }

    const album = await prisma.photoAlbum.create({
      data: {
        title,
        slug,
        description,
        coverImage,
        isPublished,
        isPrivate,
        creatorId: user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(album, { status: 201 });
  } catch (error) {
    console.error('Error creating album:', error);
    return NextResponse.json(
      { error: 'Failed to create album' },
      { status: 500 }
    );
  }
} 
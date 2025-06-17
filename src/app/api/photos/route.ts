import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// 获取图片列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const albumId = searchParams.get('albumId');
    const isFeatured = searchParams.get('featured') === 'true';
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (albumId) {
      where.albumId = albumId;
      // 如果指定了图册，确保图册是公开的
      where.album = {
        isPublished: true,
        isPrivate: false,
      };
    } else {
      // 如果没有指定图册，允许没有图册的图片或者图册是公开的图片
      where.OR = [
        { albumId: null },
        {
          album: {
            isPublished: true,
            isPrivate: false,
          },
        },
      ];
    }

    if (isFeatured) {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where,
        include: {
          media: true,
          album: {
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
          },
          postPhotos: {
            include: {
              post: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { takenAt: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.photo.count({ where }),
    ]);

    return NextResponse.json({
      photos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

// 创建新图片
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
    console.log('Received photo creation request:', body);
    
    const {
      title,
      description,
      location,
      camera,
      lens,
      settings,
      tags,
      isFeatured = false,
      albumId,
      takenAt,
      mediaId,
    } = body;

    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    // 验证媒体文件是否存在
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      console.error('Media not found:', mediaId);
      return NextResponse.json(
        { error: 'Media file not found' },
        { status: 404 }
      );
    }

    // 如果指定了图册，验证图册是否存在且用户有权限
    if (albumId) {
      const album = await prisma.photoAlbum.findUnique({
        where: { id: albumId },
      });

      if (!album) {
        console.error('Album not found:', albumId);
        return NextResponse.json(
          { error: 'Album not found' },
          { status: 404 }
        );
      }

      if (album.creatorId !== user.id) {
        console.error('Permission denied for album:', albumId, 'user:', user.id);
        return NextResponse.json(
          { error: 'No permission to add photos to this album' },
          { status: 403 }
        );
      }
    }

    const photoData = {
      title,
      description,
      location,
      camera,
      lens,
      settings,
      tags,
      isFeatured,
      albumId: albumId || null,
      takenAt: takenAt ? new Date(takenAt) : null,
      mediaId,
    };

    console.log('Creating photo with data:', photoData);

    const photo = await prisma.photo.create({
      data: photoData,
      include: {
        media: true,
        album: {
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
        },
      },
    });

    console.log('Photo created successfully:', photo.id);
    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error('Error creating photo:', error);
    return NextResponse.json(
      { error: 'Failed to create photo' },
      { status: 500 }
    );
  }
} 
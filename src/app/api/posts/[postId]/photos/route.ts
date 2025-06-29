import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// 获取文章关联的图片
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    const postPhotos = await prisma.postPhoto.findMany({
      where: { postId },
      include: {
        photo: {
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
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return NextResponse.json(postPhotos);
  } catch (error) {
    console.error('Error fetching post photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post photos' },
      { status: 500 }
    );
  }
}

// 关联图片到文章
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { postId } = await params;
    const body = await request.json();
    const { photoId, sortOrder = 0 } = body;

    // 验证文章是否存在且用户有权限
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.authorId !== user.id) {
      return NextResponse.json(
        { error: 'No permission to modify this post' },
        { status: 403 }
      );
    }

    // 验证图片是否存在
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // 检查是否已经关联
    const existingLink = await prisma.postPhoto.findUnique({
      where: {
        postId_photoId: {
          postId,
          photoId,
        },
      },
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'Photo is already linked to this post' },
        { status: 400 }
      );
    }

    const postPhoto = await prisma.postPhoto.create({
      data: {
        postId,
        photoId,
        sortOrder,
      },
      include: {
        photo: {
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
        },
      },
    });

    return NextResponse.json(postPhoto, { status: 201 });
  } catch (error) {
    console.error('Error linking photo to post:', error);
    return NextResponse.json(
      { error: 'Failed to link photo to post' },
      { status: 500 }
    );
  }
}

// 删除图片与文章的关联
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { postId } = await params;
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photoId');

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // 验证文章是否存在且用户有权限
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.authorId !== user.id) {
      return NextResponse.json(
        { error: 'No permission to modify this post' },
        { status: 403 }
      );
    }

    // 删除关联关系
    await prisma.postPhoto.delete({
      where: {
        postId_photoId: {
          postId,
          photoId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unlinking photo from post:', error);
    return NextResponse.json(
      { error: 'Failed to unlink photo from post' },
      { status: 500 }
    );
  }
} 
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import PhotoDetail from '@/components/photos/photo-detail';

interface PhotoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PhotoPageProps): Promise<Metadata> {
  const { id } = await params;
  
  const photo = await prisma.photo.findUnique({
    where: { id },
    include: {
      media: true,
      album: {
        include: {
          creator: {
            select: {
              username: true,
              displayName: true,
            },
          },
        },
      },
    },
  });

  if (!photo) {
    return {
      title: '图片不存在 | My Blog',
    };
  }

  return {
    title: `${photo.title || '摄影作品'} | My Blog`,
    description: photo.description || '精美的摄影作品',
    openGraph: {
      images: [photo.media.url],
    },
  };
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { id } = await params;
  
  const photo = await prisma.photo.findUnique({
    where: { id },
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
              excerpt: true,
              coverImage: true,
              author: {
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
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  });

  if (!photo) {
    notFound();
  }

  // 增加浏览次数
  await prisma.photo.update({
    where: { id },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });

  // 转换照片数据以匹配 PhotoDetail 组件的期望结构
  const transformedPhoto = {
    id: photo.id,
    title: photo.title || '',
    description: photo.description,
    imageUrl: photo.media.url,
    location: photo.location,
    tags: photo.tags ? photo.tags.split(',').map(tag => tag.trim()) : [],
    createdAt: photo.createdAt,
    album: photo.album ? {
      id: photo.album.id,
      title: photo.album.title,
      slug: photo.album.slug,
      creator: {
        displayName: photo.album.creator.displayName || photo.album.creator.username,
        username: photo.album.creator.username,
      },
      coverImage: photo.album.coverImage
    } : null,
    likeCount: photo.likeCount || 0,
    viewCount: photo.viewCount || 0,
    isFeatured: photo.isFeatured || false,
    camera: photo.camera,
    lens: photo.lens,
    settings: photo.settings,
    postPhotos: photo.postPhotos.map(postPhoto => ({
      id: postPhoto.id,
      title: postPhoto.post.title,
      slug: postPhoto.post.slug,
      excerpt: postPhoto.post.excerpt,
      coverImage: postPhoto.post.coverImage,
      author: {
        id: postPhoto.post.author.id,
        username: postPhoto.post.author.username,
        displayName: postPhoto.post.author.displayName || postPhoto.post.author.username,
        avatar: postPhoto.post.author.avatar,
      },
    })),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PhotoDetail photo={transformedPhoto} />
    </div>
  );
} 
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

  return (
    <div className="container mx-auto px-4 py-8">
      <PhotoDetail photo={photo} />
    </div>
  );
} 
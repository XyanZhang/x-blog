import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import AlbumDetail from '@/components/photos/album-detail';

interface AlbumPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: AlbumPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const album = await prisma.photoAlbum.findUnique({
    where: { slug },
    include: {
      creator: {
        select: {
          username: true,
          displayName: true,
        },
      },
    },
  });

  if (!album) {
    return {
      title: '图册不存在 | My Blog',
    };
  }

  return {
    title: `${album.title} | My Blog`,
    description: album.description || '精美的摄影图册',
  };
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { slug } = await params;
  
  const album = await prisma.photoAlbum.findUnique({
    where: { slug },
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
        orderBy: [
          { isFeatured: 'desc' },
          { takenAt: 'desc' },
          { createdAt: 'desc' },
        ],
      },
      _count: {
        select: {
          photos: true,
        },
      },
    },
  });

  if (!album || !album.isPublished) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AlbumDetail album={album} />
    </div>
  );
} 
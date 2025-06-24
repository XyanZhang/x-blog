import { Suspense } from 'react';
import { Metadata } from 'next';
import AlbumGrid from '@/components/photos/album-grid';
import AlbumSearch from '@/components/photos/album-search';

export const metadata: Metadata = {
  title: '摄影图册 | My Blog',
  description: '浏览精选的摄影作品集，发现美丽的瞬间',
};

export default function AlbumsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          摄影图册
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          浏览精选的摄影作品集，发现美丽的瞬间
        </p>
      </div>

      <Suspense fallback={null}>
        <AlbumSearch />
      </Suspense>
      
      <Suspense fallback={<AlbumGridSkeleton />}>
        <AlbumGrid />
      </Suspense>
    </div>
  );
}

function AlbumGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
} 
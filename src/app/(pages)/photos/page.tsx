import { Suspense } from 'react';
import { Metadata } from 'next';
import PhotoGrid from '@/components/photos/photo-grid';
import PhotoSearch from '@/components/photos/photo-search';

export const metadata: Metadata = {
  title: '摄影作品 | My Blog',
  description: '浏览精选的摄影作品，感受光影的魅力',
};

export default function PhotosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          摄影作品
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          浏览精选的摄影作品，感受光影的魅力
        </p>
      </div>

      <Suspense fallback={null}>
        <PhotoSearch />
      </Suspense>
      
      <Suspense fallback={<PhotoGridSkeleton />}>
        <PhotoGrid />
      </Suspense>
    </div>
  );
}

function PhotoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      ))}
    </div>
  );
} 
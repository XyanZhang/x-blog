'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Photo } from '@/types/blog';

interface PhotoGridProps {
  searchParams?: {
    search?: string;
    page?: string;
    albumId?: string;
    featured?: string;
  };
}

export default function PhotoGrid({ searchParams }: PhotoGridProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchParams?.search) {
        params.append('search', searchParams.search);
      }
      
      if (searchParams?.page) {
        params.append('page', searchParams.page);
      }

      if (searchParams?.albumId) {
        params.append('albumId', searchParams.albumId);
      }

      if (searchParams?.featured) {
        params.append('featured', searchParams.featured);
      }

      const response = await fetch(`/api/photos?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setPhotos(data.photos);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-lg">
          暂无图片
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {photos.map((photo) => (
          <Link
            key={photo.id}
            href={`/photos/${photo.id}`}
            className="group relative aspect-square overflow-hidden rounded-lg hover:shadow-lg transition-shadow duration-300"
          >
            <Image
              src={photo.media.url}
              alt={photo.title || '摄影作品'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* 精选标识 */}
            {photo.isFeatured && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                精选
              </div>
            )}
            
            {/* 悬停信息 */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end">
              <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full">
                {photo.title && (
                  <h3 className="font-medium text-sm mb-1 truncate">
                    {photo.title}
                  </h3>
                )}
                
                {photo.location && (
                  <p className="text-xs text-gray-200 truncate">
                    📍 {photo.location}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-200 mt-2">
                  <span>👁️ {photo.viewCount}</span>
                  <span>❤️ {photo.likeCount}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex space-x-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/photos?page=${page}${
                  searchParams?.search ? `&search=${searchParams.search}` : ''
                }${
                  searchParams?.albumId ? `&albumId=${searchParams.albumId}` : ''
                }${
                  searchParams?.featured ? `&featured=${searchParams.featured}` : ''
                }`}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  page === pagination.page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {page}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
} 
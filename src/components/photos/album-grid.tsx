'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PhotoAlbum } from '@/types/blog';

interface AlbumGridProps {
  searchParams?: {
    search?: string;
    page?: string;
  };
}

export default function AlbumGrid({ searchParams }: AlbumGridProps) {
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchAlbums = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchParams?.search) {
        params.append('search', searchParams.search);
      }
      
      if (searchParams?.page) {
        params.append('page', searchParams.page);
      }

      const response = await fetch(`/api/albums?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setAlbums(data.albums);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  if (loading) {
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

  if (albums.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-lg">
          暂无图册
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {albums.map((album) => (
          <Link
            key={album.id}
            href={`/albums/${album.slug}`}
            className="group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="aspect-square relative overflow-hidden">
              {album.coverImage ? (
                <Image
                  src={album.coverImage}
                  alt={album.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : album.photos.length > 0 ? (
                <div className={`grid ${getGridClass(album.photos.length)} gap-1 h-full`}>
                  {album.photos.slice(0, Math.min(album.photos.length, 4)).map((photo) => (
                    <div key={photo.id} className="relative">
                      <Image
                        src={photo.media.url}
                        alt={photo.title || album.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-500">暂无图片</span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {album.title}
              </h3>
              
              {album.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {album.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{album.photos.length} 张图片</span>
                <div className="flex items-center space-x-2">
                  {album.creator.avatar && (
                    <Image
                      src={album.creator.avatar}
                      alt={album.creator.displayName || album.creator.username}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  )}
                  <span>{album.creator.displayName || album.creator.username}</span>
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
                href={`/albums?page=${page}${searchParams?.search ? `&search=${searchParams.search}` : ''}`}
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

// 根据图片数量返回网格类名
function getGridClass(photoCount: number): string {
  switch (photoCount) {
    case 1:
      return 'grid-cols-1';
    case 2:
      return 'grid-cols-2';
    case 3:
      return 'grid-cols-2';
    case 4:
      return 'grid-cols-2';
    default:
      return 'grid-cols-2';
  }
} 
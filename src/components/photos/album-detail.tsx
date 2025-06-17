'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PhotoAlbum } from '@/types/blog';

interface AlbumDetailProps {
  album: PhotoAlbum & {
    creator: any;
    photos: any[];
    _count: {
      photos: number;
    };
  };
}

export default function AlbumDetail({ album }: AlbumDetailProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 图册头部信息 */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {album.title}
            </h1>
            
            {album.description && (
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                {album.description}
              </p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>📸 {album._count.photos} 张图片</span>
              <span>📅 {formatDate(album.createdAt)}</span>
            </div>
          </div>
          
          {/* 创建者信息 */}
          <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            {album.creator.avatar && (
              <Image
                src={album.creator.avatar}
                alt={album.creator.displayName || album.creator.username}
                width={48}
                height={48}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {album.creator.displayName || album.creator.username}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                创建者
              </p>
            </div>
          </div>
        </div>
        
        {/* 封面图片 */}
        {album.coverImage && (
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
            <Image
              src={album.coverImage}
              alt={album.title}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* 图片网格 */}
      {album.photos.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            图册内容
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {album.photos.map((photo) => (
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
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 text-lg">
            暂无图片
          </div>
        </div>
      )}
    </div>
  );
} 
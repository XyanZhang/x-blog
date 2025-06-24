'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface PhotoDetailProps {
  photo: {
    id: string
    title: string
    description?: string | null
    imageUrl: string
    location?: string | null
    tags?: string[]
    createdAt: Date
    album?: {
      id: string
      title: string
      slug: string
      coverImage?: string | null
      creator: {
        displayName: string
        username: string
      }
    } | null
    isFeatured: boolean
    viewCount: number
    likeCount: number
    camera?: string | null
    lens?: string | null
    settings?: string | null
    postPhotos: Array<{
      id: string
      post: {
        id: string
        title: string
        slug: string
        coverImage?: string | null
        excerpt?: string | null
        author: {
          displayName: string
          username: string
          avatar?: string | null
        }
      }
    }>
  }
  onClose: () => void
}

export default function PhotoDetail({ photo }: PhotoDetailProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    // TODO: 实现点赞功能
    setIsLiked(!isLiked);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 图片区域 */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Image
              src={photo.imageUrl}
              alt={photo.title || '摄影作品'}
              fill
              className="object-contain"
              priority
            />
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiked
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <span>❤️</span>
                <span>{photo.likeCount + (isLiked ? 1 : 0)}</span>
              </button>
              
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <span>👁️</span>
                <span>{photo.viewCount}</span>
              </div>
            </div>
            
            {photo.isFeatured && (
              <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
                精选作品
              </div>
            )}
          </div>
        </div>

        {/* 信息区域 */}
        <div className="space-y-6">
          {/* 标题和描述 */}
          <div>
            {photo.title && (
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {photo.title}
              </h1>
            )}
            
            {photo.description && (
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                {photo.description}
              </p>
            )}
          </div>

          {/* 拍摄信息 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              拍摄信息
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {photo.location && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">📍 拍摄地点：</span>
                  <span className="text-gray-900 dark:text-white">{photo.location}</span>
                </div>
              )}
              
              {photo.createdAt && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">📅 拍摄时间：</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(photo.createdAt)}
                  </span>
                </div>
              )}
              
              {photo.camera && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">📷 相机：</span>
                  <span className="text-gray-900 dark:text-white">{photo.camera}</span>
                </div>
              )}
              
              {photo.lens && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">🔍 镜头：</span>
                  <span className="text-gray-900 dark:text-white">{photo.lens}</span>
                </div>
              )}
              
              {photo.settings && (
                <div className="md:col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">⚙️ 拍摄参数：</span>
                  <span className="text-gray-900 dark:text-white">{photo.settings}</span>
                </div>
              )}
            </div>
          </div>

          {/* 所属图册 */}
          {photo.album && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                所属图册
              </h3>
              <Link
                href={`/albums/${photo.album.slug}`}
                className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
              >
                {photo.album.coverImage && (
                  <Image
                    src={photo.album.coverImage}
                    alt={photo.album.title}
                    width={60}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                )}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {photo.album.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    by {photo.album.creator.displayName || photo.album.creator.username}
                  </p>
                </div>
              </Link>
            </div>
          )}

          {/* 标签 */}
          {photo.tags && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                标签
              </h3>
              <div className="flex flex-wrap gap-2">
                {photo.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 关联的博客文章 */}
      {photo.postPhotos.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            相关博客文章
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photo.postPhotos.map((postPhoto) => (
              <Link
                key={postPhoto.id}
                href={`/posts/${postPhoto.post.slug}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {postPhoto.post.coverImage && (
                  <div className="aspect-video relative">
                    <Image
                      src={postPhoto.post.coverImage}
                      alt={postPhoto.post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {postPhoto.post.title}
                  </h3>
                  {postPhoto.post.excerpt && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {postPhoto.post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {postPhoto.post.author.avatar && (
                      <Image
                        src={postPhoto.post.author.avatar}
                        alt={postPhoto.post.author.displayName || postPhoto.post.author.username}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    )}
                    <span>{postPhoto.post.author.displayName || postPhoto.post.author.username}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
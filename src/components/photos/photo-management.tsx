'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CreateAlbumForm from './create-album-form';
import UploadPhotoForm from './upload-photo-form';

export default function PhotoManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'albums' | 'photos'>('albums');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        router.push('/auth/login');
      }
    } catch {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 标签页 */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('albums')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'albums'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            图册管理
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'photos'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            图片管理
          </button>
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="mt-6">
        {activeTab === 'albums' && <CreateAlbumForm />}
        {activeTab === 'photos' && <UploadPhotoForm />}
      </div>
    </div>
  );
} 
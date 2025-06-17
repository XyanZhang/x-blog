'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Album {
  id: string;
  title: string;
}

interface Media {
  id: string;
  url: string;
  filename: string;
}

export default function UploadPhotoForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    camera: '',
    lens: '',
    settings: '',
    tags: '',
    isFeatured: false,
    albumId: '',
    takenAt: '',
  });
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<Media | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const response = await fetch('/api/albums');
      const data = await response.json();
      if (response.ok) {
        setAlbums(data.albums);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // 创建预览URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setMessage('请先选择文件');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadedMedia(data.media);
        setMessage('文件上传成功！');
        // 自动填充媒体ID
        setFormData(prev => ({ ...prev, mediaId: data.media.id }));
      } else {
        setMessage(data.error || '上传失败');
      }
    } catch (error) {
      setMessage('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedMedia) {
      setMessage('请先上传图片文件');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const requestBody = {
        ...formData,
        mediaId: uploadedMedia.id,
        takenAt: formData.takenAt ? new Date(formData.takenAt).toISOString() : null,
      };

      console.log('Submitting photo data:', requestBody);

      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('图片上传成功！');
        // 重置表单
        setFormData({
          title: '',
          description: '',
          location: '',
          camera: '',
          lens: '',
          settings: '',
          tags: '',
          isFeatured: false,
          albumId: '',
          takenAt: '',
        });
        setSelectedFile(null);
        setUploadedMedia(null);
        setPreviewUrl('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        console.error('Photo creation failed:', data);
        setMessage(data.error || '上传失败');
      }
    } catch (error) {
      console.error('Error submitting photo:', error);
      setMessage('上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        上传新图片
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 文件上传区域 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              选择图片文件 *
            </label>
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  dark:file:bg-blue-900/20 dark:file:text-blue-400"
              />
              {selectedFile && !uploadedMedia && (
                <button
                  type="button"
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? '上传中...' : '上传文件'}
                </button>
              )}
            </div>
            {selectedFile && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                已选择: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            {selectedFile && !uploadedMedia && (
              <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">
                ⚠️ 请先点击"上传文件"按钮上传图片
              </p>
            )}
          </div>

          {/* 图片预览 */}
          {previewUrl && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
              <Image
                src={previewUrl}
                alt="预览"
                fill
                className="object-contain"
              />
            </div>
          )}

          {/* 上传状态 */}
          {uploadedMedia && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-md">
              <p className="text-sm">✅ 文件上传成功！</p>
              <p className="text-xs mt-1">媒体ID: {uploadedMedia.id}</p>
              <p className="text-xs mt-1">现在可以填写图片信息并保存</p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            图片标题
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="输入图片标题"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            图片描述
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="输入图片描述"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              拍摄地点
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="输入拍摄地点"
            />
          </div>

          <div>
            <label htmlFor="takenAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              拍摄时间
            </label>
            <input
              type="datetime-local"
              id="takenAt"
              name="takenAt"
              value={formData.takenAt}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="camera" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              相机型号
            </label>
            <input
              type="text"
              id="camera"
              name="camera"
              value={formData.camera}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="输入相机型号"
            />
          </div>

          <div>
            <label htmlFor="lens" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              镜头型号
            </label>
            <input
              type="text"
              id="lens"
              name="lens"
              value={formData.lens}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="输入镜头型号"
            />
          </div>
        </div>

        <div>
          <label htmlFor="settings" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            拍摄参数
          </label>
          <input
            type="text"
            id="settings"
            name="settings"
            value={formData.settings}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="如：f/2.8, 1/1000s, ISO 100"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            标签
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="用逗号分隔多个标签"
          />
        </div>

        <div>
          <label htmlFor="albumId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            所属图册
          </label>
          <select
            id="albumId"
            name="albumId"
            value={formData.albumId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">选择图册（可选）</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isFeatured"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            设为精选图片
          </label>
        </div>

        {message && (
          <div className={`p-3 rounded-md ${
            message.includes('成功') 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !uploadedMedia}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '保存中...' : uploadedMedia ? '保存图片信息' : '请先上传图片文件'}
        </button>
        
        {!uploadedMedia && selectedFile && (
          <p className="text-center text-sm text-orange-600 dark:text-orange-400">
            请先点击"上传文件"按钮上传图片，然后才能保存图片信息
          </p>
        )}
      </form>
    </div>
  );
} 
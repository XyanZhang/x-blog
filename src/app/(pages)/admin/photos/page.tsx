import { Metadata } from 'next';
import PhotoManagement from '@/components/photos/photo-management';

export const metadata: Metadata = {
  title: '摄影管理 | My Blog',
  description: '管理摄影图册和图片',
};

export default function PhotoManagementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          摄影管理
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          管理您的摄影图册和图片
        </p>
      </div>

      <PhotoManagement />
    </div>
  );
} 
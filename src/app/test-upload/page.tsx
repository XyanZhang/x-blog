import UploadPhotoForm from '@/components/photos/upload-photo-form';

export default function TestUploadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        测试图片上传功能
      </h1>
      <UploadPhotoForm />
    </div>
  );
} 
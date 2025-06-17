import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始添加测试摄影数据...');

  // 创建测试用户（如果不存在）
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashedpassword', // 实际应用中应该哈希密码
      displayName: '测试用户',
      role: 'USER',
    },
  });

  console.log('用户已创建/更新:', user.username);

  // 创建测试图册
  const album = await prisma.photoAlbum.create({
    data: {
      title: '自然风光',
      slug: 'nature-landscape',
      description: '美丽的自然风光摄影作品集',
      isPublished: true,
      isPrivate: false,
      creatorId: user.id,
    },
  });

  console.log('图册已创建:', album.title);

  // 创建测试媒体文件
  const media = await prisma.media.create({
    data: {
      filename: 'test-photo.jpg',
      originalName: 'test-photo.jpg',
      mimeType: 'image/jpeg',
      size: 1024000,
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      alt: '美丽的山脉风景',
      caption: '壮丽的山脉风景',
      width: 800,
      height: 600,
      uploaderId: user.id,
    },
  });

  console.log('媒体文件已创建:', media.filename);

  // 创建测试图片
  const photo = await prisma.photo.create({
    data: {
      title: '山脉日出',
      description: '清晨时分，阳光洒在山脉上，形成美丽的金色光芒',
      location: '阿尔卑斯山脉',
      camera: 'Canon EOS R5',
      lens: 'RF 24-70mm f/2.8L IS USM',
      settings: 'f/8, 1/125s, ISO 100',
      tags: '风景,山脉,日出,自然',
      isFeatured: true,
      mediaId: media.id,
      albumId: album.id,
      takenAt: new Date('2024-01-15T06:30:00Z'),
    },
  });

  console.log('图片已创建:', photo.title);

  // 创建测试博客文章（如果不存在）
  const post = await prisma.post.upsert({
    where: { slug: 'test-post' },
    update: {},
    create: {
      title: '测试博客文章',
      slug: 'test-post',
      content: '# 测试博客文章\n\n这是一篇测试博客文章，用于测试图片关联功能。',
      authorId: user.id,
      isPublished: true,
      isDraft: false,
    },
  });

  console.log('博客文章已创建/更新:', post.title);

  // 关联图片到博客文章
  const postPhoto = await prisma.postPhoto.create({
    data: {
      postId: post.id,
      photoId: photo.id,
      sortOrder: 1,
    },
  });

  console.log('图片已关联到博客文章');

  console.log('测试数据添加完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
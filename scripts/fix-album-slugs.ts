import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 生成 slug 的函数（只保留英文、数字、-，其余全部去掉）
function generateSlug(title: string, fallback: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // 只保留英文小写、数字、空格和-
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') // 去除首尾-
    .trim();
  return slug || fallback;
}

async function fixAlbumSlugs() {
  console.log('开始修复图册 slug...');

  try {
    // 查找所有图册
    const allAlbums = await prisma.photoAlbum.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    console.log(`找到 ${allAlbums.length} 个图册`);

    // 找出需要修复 slug 的图册
    const albumsToFix = allAlbums.filter(album => !album.slug || album.slug === '' || /[^a-z0-9-]/.test(album.slug));
    
    console.log(`需要修复 slug 的图册: ${albumsToFix.length} 个`);

    for (const album of albumsToFix) {
      const baseSlug = generateSlug(album.title, album.id.slice(0, 8));
      let finalSlug = baseSlug;
      let counter = 1;

      // 检查 slug 是否已存在，如果存在则添加数字后缀
      while (true) {
        const existingAlbum = await prisma.photoAlbum.findUnique({
          where: { slug: finalSlug },
        });

        if (!existingAlbum || existingAlbum.id === album.id) {
          break; // slug 不存在或属于当前图册
        }

        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      // 更新图册的 slug
      await prisma.photoAlbum.update({
        where: { id: album.id },
        data: { slug: finalSlug },
      });

      console.log(`修复图册 "${album.title}" 的 slug: ${finalSlug}`);
    }

    // 显示所有图册的 slug
    const updatedAlbums = await prisma.photoAlbum.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log('\n所有图册的 slug 状态:');
    updatedAlbums.forEach(album => {
      console.log(`- ${album.title}: ${album.slug || '无 slug'}`);
    });

    console.log('\n图册 slug 修复完成！');
  } catch (error) {
    console.error('修复图册 slug 时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行脚本
fixAlbumSlugs(); 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'all'; // all, posts, tags, categories

    if (!query.trim()) {
      return NextResponse.json({ results: [], total: 0, page, limit });
    }

    const skip = (page - 1) * limit;

    let results = [];
    let total = 0;

    if (type === 'all' || type === 'posts') {
      // 搜索文章
      const posts = await prisma.post.findMany({
        where: {
          AND: [
            { isPublished: true },
            { isDeleted: false },
            {
              OR: [
                { title: { contains: query } },
                { content: { contains: query } },
                { excerpt: { contains: query } },
                {
                  tags: {
                    some: {
                      tag: {
                        name: { contains: query }
                      }
                    }
                  }
                }
              ]
            }
          ]
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        },
        orderBy: [
          { publishedAt: 'desc' },
          { viewCount: 'desc' }
        ],
        skip,
        take: limit
      });

      const postsCount = await prisma.post.count({
        where: {
          AND: [
            { isPublished: true },
            { isDeleted: false },
            {
              OR: [
                { title: { contains: query } },
                { content: { contains: query } },
                { excerpt: { contains: query } },
                {
                  tags: {
                    some: {
                      tag: {
                        name: { contains: query }
                      }
                    }
                  }
                }
              ]
            }
          ]
        }
      });

      results.push(...posts.map(post => ({
        ...post,
        type: 'post',
        searchScore: calculateSearchScore(post, query)
      })));

      total += postsCount;
    }

    if (type === 'all' || type === 'tags') {
      // 搜索标签
      const tags = await prisma.tag.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } }
          ]
        },
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        },
        orderBy: {
          posts: {
            _count: 'desc'
          }
        },
        skip: type === 'all' ? 0 : skip,
        take: type === 'all' ? 5 : limit
      });

      const tagsCount = await prisma.tag.count({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } }
          ]
        }
      });

      results.push(...tags.map(tag => ({
        ...tag,
        type: 'tag',
        searchScore: calculateTagSearchScore(tag, query)
      })));

      if (type === 'tags') {
        total = tagsCount;
      }
    }

    if (type === 'all' || type === 'categories') {
      // 搜索分类
      const categories = await prisma.category.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } }
          ]
        },
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        },
        orderBy: {
          posts: {
            _count: 'desc'
          }
        },
        skip: type === 'all' ? 0 : skip,
        take: type === 'all' ? 5 : limit
      });

      const categoriesCount = await prisma.category.count({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } }
          ]
        }
      });

      results.push(...categories.map(category => ({
        ...category,
        type: 'category',
        searchScore: calculateCategorySearchScore(category, query)
      })));

      if (type === 'categories') {
        total = categoriesCount;
      }
    }

    // 按搜索分数排序
    if (type === 'all') {
      results.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));
      results = results.slice(0, limit);
    }

    return NextResponse.json({
      results,
      total,
      page,
      limit,
      query
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: '搜索失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 计算文章搜索分数
function calculateSearchScore(post: {
  title: string;
  excerpt?: string | null;
  content: string;
  tags?: Array<{ tag: { name: string } }>;
  publishedAt?: Date | null;
  viewCount?: number;
}, query: string): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();
  
  // 标题匹配权重最高
  if (post.title.toLowerCase().includes(lowerQuery)) {
    score += 100;
  }
  
  // 摘要匹配
  if (post.excerpt?.toLowerCase().includes(lowerQuery)) {
    score += 50;
  }
  
  // 内容匹配
  if (post.content.toLowerCase().includes(lowerQuery)) {
    score += 30;
  }
  
  // 标签匹配
  if (post.tags?.some((pt) => pt.tag.name.toLowerCase().includes(lowerQuery))) {
    score += 40;
  }
  
  // 发布时间越新分数越高
  if (post.publishedAt) {
    const daysSincePublished = Math.floor((Date.now() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60 * 24));
    score += Math.max(0, 20 - daysSincePublished);
  }
  
  // 浏览量加分
  score += Math.min(post.viewCount || 0, 50);
  
  return score;
}

// 计算标签搜索分数
function calculateTagSearchScore(tag: {
  name: string;
  description?: string | null;
  _count?: { posts: number };
}, query: string): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();
  
  if (tag.name.toLowerCase().includes(lowerQuery)) {
    score += 100;
  }
  
  if (tag.description?.toLowerCase().includes(lowerQuery)) {
    score += 50;
  }
  
  // 关联文章数量加分
  score += Math.min(tag._count?.posts || 0, 30);
  
  return score;
}

// 计算分类搜索分数
function calculateCategorySearchScore(category: {
  name: string;
  description?: string | null;
  _count?: { posts: number };
}, query: string): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();
  
  if (category.name.toLowerCase().includes(lowerQuery)) {
    score += 100;
  }
  
  if (category.description?.toLowerCase().includes(lowerQuery)) {
    score += 50;
  }
  
  // 关联文章数量加分
  score += Math.min(category._count?.posts || 0, 30);
  
  return score;
} 
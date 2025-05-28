import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface DocMetadata {
  title: string
  excerpt: string
  slug: string
  tags: string[]
  categorySlug: string
}

// 从Markdown内容中提取元数据
function extractMetadata(content: string, filename: string): DocMetadata {
  const lines = content.split('\n')
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1].replace(/\s*🚀|📚|⚡|🔧|📋|🔍|⚙️|🏃‍♂️|🌐|📁|🔄|📊|💡|🔧|📝/g, '').trim() : filename.replace('.md', '')
  
  // 生成slug
  const slug = filename.replace('.md', '').toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // 提取摘要（第一个段落或者前100个字符）
  const paragraphs = content.split('\n\n').filter(p => 
    p.trim() && 
    !p.startsWith('#') && 
    !p.startsWith('```') &&
    !p.startsWith('|') &&
    !p.startsWith('>')
  )
  
  const excerpt = paragraphs[0] ? 
    paragraphs[0].substring(0, 150).replace(/\n/g, ' ').trim() + '...' :
    `这是关于${title}的详细指南，包含实用的命令和示例。`

  // 根据文件名确定分类和标签
  let categorySlug = 'programming'
  let tags: string[] = []

  if (filename.includes('shell') || filename.includes('command')) {
    categorySlug = 'tools'
    tags = ['Shell', '命令行', '终端', 'CLI', '开发工具']
  } else if (filename.includes('guide')) {
    tags.push('指南', '教程')
  } else if (filename.includes('cheatsheet')) {
    tags.push('速查表', '参考')
  }

  // 从内容中提取更多标签
  if (content.includes('curl')) tags.push('curl')
  if (content.includes('grep')) tags.push('grep')
  if (content.includes('docker')) tags.push('Docker')
  if (content.includes('git')) tags.push('Git')
  if (content.includes('npm') || content.includes('pnpm')) tags.push('Node.js')
  if (content.includes('api')) tags.push('API')

  return {
    title,
    excerpt,
    slug,
    tags: [...new Set(tags)], // 去重
    categorySlug
  }
}

async function importDocs() {
  try {
    console.log('🚀 开始导入文档...')
    
    const docsDir = path.join(process.cwd(), 'docs')
    const files = fs.readdirSync(docsDir).filter(file => file.endsWith('.md'))
    
    console.log(`📁 找到 ${files.length} 个文档文件`)

    // 获取或创建作者
    let author = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: 'admin@example.com' },
          { username: 'admin' }
        ]
      }
    })

    if (!author) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      author = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          username: 'docs-admin',
          displayName: '文档管理员',
          bio: '系统文档管理员',
          password: hashedPassword
        }
      })
      console.log('�� 创建了新的作者账户')
    }

    // 确保分类存在
    const categories = [
      {
        name: '编程技术',
        slug: 'programming',
        description: '编程相关技术文章',
        color: '#3B82F6'
      },
      {
        name: '开发工具',
        slug: 'tools',
        description: '开发工具和实用技巧',
        color: '#10B981'
      }
    ]

    for (const categoryData of categories) {
      await prisma.category.upsert({
        where: { slug: categoryData.slug },
        update: {},
        create: categoryData
      })
    }

    // 处理每个文档文件
    for (const filename of files) {
      const filePath = path.join(docsDir, filename)
      const content = fs.readFileSync(filePath, 'utf-8')
      const metadata = extractMetadata(content, filename)

      console.log(`📝 处理文档: ${metadata.title}`)

      // 检查文章是否已存在
      const existingPost = await prisma.post.findUnique({
        where: { slug: metadata.slug }
      })

      if (existingPost) {
        console.log(`⚠️  文章已存在，跳过: ${metadata.slug}`)
        continue
      }

      // 获取分类
      const category = await prisma.category.findUnique({
        where: { slug: metadata.categorySlug }
      })

      if (!category) {
        console.log(`❌ 找不到分类: ${metadata.categorySlug}`)
        continue
      }

      // 创建文章
      const post = await prisma.post.create({
        data: {
          title: metadata.title,
          slug: metadata.slug,
          content: content,
          excerpt: metadata.excerpt,
          isPublished: true,
          isDraft: false,
          authorId: author.id,
          categoryId: category.id,
          publishedAt: new Date(),
          readingTime: Math.ceil(content.length / 1000) // 估算阅读时间
        }
      })

      // 处理标签
      for (const tagName of metadata.tags) {
        // 生成标签slug
        const tagSlug = tagName.toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
          .replace(/^-+|-+$/g, '')

        // 查找是否已存在标签
        let tag = await prisma.tag.findFirst({
          where: {
            OR: [
              { name: tagName },
              { slug: tagSlug }
            ]
          }
        })

        // 如果不存在则创建
        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              slug: tagSlug,
              color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
            }
          })
        }

        // 检查文章标签关联是否已存在
        const existingPostTag = await prisma.postTag.findFirst({
          where: {
            postId: post.id,
            tagId: tag.id
          }
        })

        // 如果关联不存在则创建
        if (!existingPostTag) {
          await prisma.postTag.create({
            data: {
              postId: post.id,
              tagId: tag.id
            }
          })
        }
      }

      console.log(`✅ 成功导入: ${metadata.title} (${metadata.tags.length} 个标签)`)
    }

    console.log('🎉 文档导入完成!')

  } catch (error) {
    console.error('❌ 导入失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 执行导入
importDocs() 
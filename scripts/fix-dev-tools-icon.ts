import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixDevToolsIcon() {
  try {
    // 查找开发工具分类
    const devToolsCategory = await prisma.category.findFirst({
      where: {
        name: '开发工具'
      }
    })

    if (devToolsCategory) {
      console.log('找到开发工具分类，正在更新图标...')
      
      // 更新图标
      await prisma.category.update({
        where: {
          id: devToolsCategory.id
        },
        data: {
          icon: '🛠️'
        }
      })
      
      console.log('✅ 开发工具分类图标已更新为 🛠️')
    } else {
      console.log('未找到开发工具分类，正在创建...')
      
      // 创建开发工具分类
      await prisma.category.create({
        data: {
          name: '开发工具',
          slug: 'dev-tools',
          description: '开发工具、命令行、效率工具等',
          color: '#10B981',
          icon: '🛠️'
        }
      })
      
      console.log('✅ 开发工具分类已创建，图标为 🛠️')
    }

    // 为编程技术分类添加图标
    const programmingCategory = await prisma.category.findFirst({
      where: {
        name: '编程技术'
      }
    })

    if (programmingCategory && !programmingCategory.icon) {
      console.log('找到编程技术分类，正在添加图标...')
      
      await prisma.category.update({
        where: {
          id: programmingCategory.id
        },
        data: {
          icon: '⚡'
        }
      })
      
      console.log('✅ 编程技术分类图标已更新为 ⚡')
    }

    // 显示所有分类
    const allCategories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    console.log('\n📋 所有分类:')
    allCategories.forEach(category => {
      console.log(`${category.icon || '❓'} ${category.name} (${category.slug})`)
    })

  } catch (error) {
    console.error('❌ 更新失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixDevToolsIcon() 
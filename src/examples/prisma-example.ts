import { prisma } from '../lib/prisma'

async function main() {
  // 查询所有用户
  const allUsers = await prisma.user.findMany({
    include: {
      orders: true // 包含用户的订单
    }
  })
  console.log('All users:', allUsers)

  // 创建新用户
  const newUser = await prisma.user.create({
    data: {
      username: 'alice_brown',
      email: 'alice2@example.com'
    }
  })
  console.log('New user created:', newUser)

  // 查询特定产品
  const product = await prisma.product.findFirst({
    where: {
      name: 'Laptop'
    },
    include: {
      orders: true // 包含产品的订单
    }
  })
  console.log('Laptop product:', product)

  // 创建新订单
  const newOrder = await prisma.order.create({
    data: {
      userId: newUser.id,
      productId: 1, // 假设 Laptop 的 ID 是 1
      quantity: 1,
      totalPrice: 999.99
    },
    include: {
      user: true,
      product: true
    }
  })
  console.log('New order created:', newOrder)
}

// 执行示例
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // 关闭 Prisma Client
    await prisma.$disconnect()
  }) 
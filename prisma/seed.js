const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.product.createMany({
    data: [
      { name: 'Espresso', price: 1.5, category: 'Hot Coffee' },
      { name: 'Americano', price: 2.0, category: 'Hot Coffee' },
      { name: 'Latte', price: 2.5, category: 'Hot Coffee' },
      { name: 'Cappuccino', price: 2.5, category: 'Hot Coffee' },
      { name: 'Iced Latte', price: 3.0, category: 'Iced Coffee' },
      { name: 'Mocha', price: 3.5, category: 'Iced Coffee' },
      { name: 'Green Tea', price: 2.0, category: 'Tea' },
      { name: 'Croissant', price: 1.8, category: 'Pastry' },
    ]
  })
  console.log('Seeded 8 products!')
}

main()
// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient()



// export async function GET(){
//     const product = await prisma.product.findMany()
//     return NextResponse.json(product)
// }

// export async function POST(req: Request) {
//   const body = await req.json()
//   console.log('Received:', body) // ដើម្បីមើល log

//   const product = await prisma.product.create({
//     data: {
//       name: body.name,
//       price: parseFloat(body.price),
//       category: body.category,
//       image: body.image || null, // <--- បន្ថែមបន្ទាត់នេះសំខាន់
//       stock: 100
//     }
//   })
//   return NextResponse.json(product)
// }





import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET() {
  const products = await prisma.product.findMany({
    include: { image: true } // ទាញរូបមកជាមួយ
  })
  // ប្តូរអោយ frontend ងាយប្រើ
  const result = products.map(p => ({
   ...p,
    image: p.image?.data || null
  }))
  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const body = await req.json()

  let imageId = null
  if (body.image) {
    const img = await prisma.productImage.create({
      data: { data: body.image }
    })
    imageId = img.id
  }

  const product = await prisma.product.create({
    data: {
      name: body.name,
      price: parseFloat(body.price),
      category: body.category,
      imageId: imageId,
      stock: Number(100)
    }
  })
  return NextResponse.json(product)
}




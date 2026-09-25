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
      stock: 100
    }
  })
  return NextResponse.json(product)
}



export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, name, price, category, stock, image } = body

    console.log(price)

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    // 1. ស្វែងរក Product ចាស់ដើម្បីមើលថាមាន imageId ឬនៅ
    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    let imageId = existingProduct.imageId

    // 2. ប្រសិនបើមានផ្ញើរូបភាពថ្មី (Base64 string) មក
    if (image) {
      if (imageId) {
        // បើមានរូបចាស់ ធ្វើការ Update រូបភាពចាស់នោះ
        await prisma.productImage.update({
          where: { id: imageId },
          data: { data: image },
        })
      } else {
        // បើគ្មានរូបពីមុនទេ ធ្វើការ Create រូបភាពថ្មី
        const newImg = await prisma.productImage.create({
          data: { data: image },
        })
        imageId = newImg.id
      }
    }

    // 3. Update ទិន្នន័យ Product
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name: name ?? existingProduct.name,
        price: price ? parseFloat(price) : existingProduct.price,
        category: category ?? existingProduct.category,
        stock: stock ? parseInt(stock) : existingProduct.stock,
        imageId: imageId,
      },
      include: { image: true },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}
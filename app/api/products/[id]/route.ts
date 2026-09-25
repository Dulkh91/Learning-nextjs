/*
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/products/[id] — យក product មួយ (សម្រាប់ initialData របស់ form)

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params

  const product = await prisma.product.findUnique({
    where: { id },
    include: { image: true },
  })

  if (!product) {
    return NextResponse.json({ error: 'រកមិនឃើញទំនិញ' }, { status: 404 })
  }

  return NextResponse.json({
    ...product,
    image: product.image?.data || null, // ធ្វើឲ្យដូច format ក្នុង GET /api/products
  })
}




// PUT /api/products/[id] — កែប្រែទំនិញ (ត្រូវនឹង handleSubmit ក្នុង form)
export async function PUT(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const { name, price, category, image } = body

    if (!name || !category || price === undefined || price === '') {
      return NextResponse.json(
        { error: 'ត្រូវការ name, price និង category' },
        { status: 400 }
      )
    }

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { imageId: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'រកមិនឃើញទំនិញនេះទេ' }, { status: 404 })
    }

    // មានតែពេលអ្នកប្តូររូបភាពថ្មីប៉ុណ្ណោះ ទើបកែ/បង្កើត ProductImage
    let imageId = existing.imageId
    if (image) {
      if (imageId) {
        await prisma.productImage.update({
          where: { id: imageId },
          data: { data: image },
        })
      } else {
        const newImage = await prisma.productImage.create({
          data: { data: image },
        })
        imageId = newImage.id
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: parseFloat(price),
        category,
        imageId,
      },
      include: { image: true },
    })

    return NextResponse.json({
      ...updated,
      image: updated.image?.data || null,
    })
  } catch (error: any) {
    console.error('PUT /api/products/[id] error:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'រកមិនឃើញទំនិញនេះទេ' }, { status: 404 })
    }
    return NextResponse.json({ error: 'មិនអាចកែប្រែទិន្នន័យបានទេ' }, { status: 500 })
  }
}





// DELETE /api/products/[id] — លុបទំនិញ ព្រមទាំងរូបភាពដែលភ្ជាប់

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { imageId: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'រកមិនឃើញទំនិញនេះទេ' }, { status: 404 })
    }

    await prisma.product.delete({ where: { id } })

    if (existing.imageId) {
      await prisma.productImage.delete({ where: { id: existing.imageId } }).catch(() => {})
    }

    return NextResponse.json({ message: 'លុបទិន្នន័យជោគជ័យ' })
  } catch (error: any) {
    console.error('DELETE /api/products/[id] error:', error)
    return NextResponse.json({ error: 'មិនអាចលុបបានទេ' }, { status: 500 })
  }
}
*/




import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PUT /api/products/[id] — កែប្រែទំនិញ
export async function PUT(
  req: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { name, price, category, image } = body;

    // Validation
    if (!name || !category || price === undefined || price === "") {
      return NextResponse.json(
        { error: "ត្រូវការ name, price និង category" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { imageId: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "រកមិនឃើញទំនិញនេះទេ" },
        { status: 404 }
      );
    }

    // Handle image update
    let imageId = existingProduct.imageId;

    if (image) {
      if (imageId) {
        await prisma.productImage.update({
          where: { id: imageId },
          data: { data: image },
        });
      } else {
        const newImage = await prisma.productImage.create({
          data: { data: image },
        });
        imageId = newImage.id;
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: parseFloat(price),
        category,
        imageId,
      },
      include: { image: true },
    });

    return NextResponse.json({
      ...updatedProduct,
      image: updatedProduct.image?.data ?? null,
    });
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);

    // Prisma record not found error
    if (error instanceof Error && error.message.includes("P2025")) {
      return NextResponse.json(
        { error: "រកមិនឃើញទំនិញនេះទេ" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "មិនអាចកែប្រែទិន្នន័យបានទេ" },
      { status: 500 }
    );
  }
}
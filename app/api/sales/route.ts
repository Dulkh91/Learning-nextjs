// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient()

// export async function POST(req: Request) {
//   const { cart, total } = await req.json()
//   const sale = await prisma.sale.create({
//     data: {
//       total,
//       items: JSON.stringify(cart)
//     }
//   })
//   return NextResponse.json(sale)
// }

// export async function GET() {
//   const sales = await prisma.sale.findMany({ orderBy: { createdAt: 'desc' } })
//   return NextResponse.json(sales)
// }


{/*======= V2 ======*/}

/*
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET() {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(sales)
}

export async function POST(req: Request) {
  const { cart, total } = await req.json()
  const sale = await prisma.sale.create({
    data: { total, items: JSON.stringify(cart) }
  })
  return NextResponse.json(sale)
}
*/


{/*===== V3 =======*/}
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      invoice: true,
    },
  })

  return NextResponse.json(sales)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const cart = body?.cart
    const total = body?.total

    if (
      !Array.isArray(cart) ||
      cart.length === 0 ||
      !cart.every(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          Number.isFinite(item.price) &&
          Number.isInteger(item.qty) &&
          item.qty > 0,
      ) ||
      !Number.isFinite(total) ||
      total <= 0
    ) {
      return NextResponse.json({ error: 'Invalid sale data' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {

      // 1. Create Sale
      const sale = await tx.sale.create({
        data: {
          total,
          items: JSON.stringify(cart),
        },
      })

      // 2. Create date key
      const today = new Date()

      const dateKey =
        today.getFullYear().toString() +
        String(today.getMonth() + 1).padStart(2, '0') +
        String(today.getDate()).padStart(2, '0')

      // 3. Get next invoice sequence
      const counter = await tx.invoiceCounter.upsert({
        where: {
          date: dateKey,
        },

        create: {
          date: dateKey,
          current: 1,
        },

        update: {
          current: {
            increment: 1,
          },
        },
      })

      // 4. Generate Invoice Number
      const invoiceNo =
        `INV-${dateKey}-${String(counter.current).padStart(4, '0')}`

      // 5. Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNo,
          saleId: sale.id,
        },
      })

      return {
        sale,
        invoice,
      }
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Create sale error:', error)

    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    )
  }
}

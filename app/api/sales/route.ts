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
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    const { cart, total } = await req.json()

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
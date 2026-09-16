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
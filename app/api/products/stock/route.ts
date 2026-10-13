import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const movements = await prisma.stockMovement.findMany({
      where: { type: "IN" },
      include: { product: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error("Get stock history error:", error);
    return NextResponse.json({ error: "Failed to fetch stock history" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productId = body?.productId;
    const quantity = body?.quantity;
    const note = typeof body?.note === "string" ? body.note.trim() : null;

    if (typeof productId !== "string" || !Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Invalid product ID or quantity" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId }, select: { id: true } });
      if (!product) return null;

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: { increment: quantity } },
      });
      const movement = await tx.stockMovement.create({
        data: { productId, type: "IN", quantity, note: note || null },
      });

      return { product: updatedProduct, movement };
    });

    if (!result) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Stock added successfully", ...result });
  } catch (error) {
    console.error("Add stock error:", error);
    return NextResponse.json({ error: "Failed to add stock" }, { status: 500 });
  }
}

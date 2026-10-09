import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const productId = body?.productId;
        const quantity = body?.quantity

        // Validate Data
        if(typeof productId !== 'string' || 
            !Number.isInteger(quantity) ||
            quantity <= 0
        ){
            return NextResponse.json(
                {error: "Invalid product ID or quantity"},
                {status: 400}
            );
        }

        // Check product exists
        const product = await prisma.product.findUnique({
            where:{
                id: productId
            },
        });

        if(!product){
            return NextResponse.json(
                {error: "Product not found"},
                {status: 400}
            )
        }

        // Add stock
        const updateProduct = await prisma.product.update({
            where: {
                id: productId
            },
            data:{
                stock: {
                    increment: quantity
                }
            }
        });

        return NextResponse.json(
            {
                message: "Stock added successfully",
                product: updateProduct
            });

    } catch (error) {
        console.error("Add stock error:", error); 
        return NextResponse.json(
            {error: "Failed to add stock"},
            {status: 500}
        )
    }
}



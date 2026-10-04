import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(
    request: Request, 
    {params}:{params: Promise<{id: string}>})
{
    try {
        const {id} = await params;
        const product = await prisma.product.findUnique({
            where: {
                id
            },
            select: {
                image: {
                    select: {
                        data: true
                    }
                }
            }
        })

        if(!product?.image){
            return new NextResponse("Image not found!",{
                status: 404
            });
        }
        const imageData = product.image.data;
        const match = imageData.match(/^data:(.+);base64,(.+)$/);

        if(!match){
            return new NextResponse("Invalid image data",{
                status: 400
            });
        }

        const contentType = match[1]
        const base64Data = match[2]

        const buffer = Buffer.from(base64Data, "base64")

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Catche-Control": "public, max-age=86400, stale-while-revalidate=604800",
            }
        })

    } catch (error) {
        console.error("Get product image error:", error);
        return new NextResponse("Failed to get image", {
            status: 500
        });
    }

}
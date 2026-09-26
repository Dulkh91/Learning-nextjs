import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Period = "today" | "week" | "month" | "year" | "custom";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);


    const period = searchParams.get("period") as Period | null;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const now = new Date();

    let startDate: Date;
    let endDate: Date;

    // =========================
    // TODAY
    // =========================
    if (period === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0,0 );
      
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      
    }

    // =========================
    // WEEK
    // =========================
    else if (period === "week") {
      const day = now.getDay();

      startDate = new Date( now.getFullYear(), now.getMonth(), now.getDate() - day, 0, 0, 0 );

      endDate = new Date( now.getFullYear(), now.getMonth(), now.getDate() + (7 - day), 0, 0, 0);

    }

    // =========================
    // MONTH
    // =========================
    else if (period === "month") {
      startDate = new Date( now.getFullYear(), now.getMonth(), 1);

      endDate = new Date( now.getFullYear(), now.getMonth() + 1, 1);
    } else if (period === "year"){
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // =========================
    // CUSTOM
    // =========================
    else if (period === "custom" && from && to) {
      startDate = new Date(`${from}T00:00:00`);

      endDate = new Date(`${to}T00:00:00`);
      endDate.setDate(endDate.getDate() + 1);
    }

    // =========================
    // DEFAULT
    // =========================
    else {
      startDate = new Date( now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0 );

      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0
      );
    }

    
    // =========================
    // GET SALES
    // =========================

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    // =========================
    // GROUP PRODUCTS
    // =========================

    const productMap = new Map<
      string,
      {
        quantity: number;
        revenue: number;
      }
    >();
      
    for (const sale of sales) {
      const items = JSON.parse(sale.items);
        

      for (const item of items) {

        
        const productId = item.id;
        const quantity = Number(item.qty);
        const price = Number(item.price);
        
        
        if (!productId) continue;

        
        const existing = productMap.get(productId);
        
        if (existing) {
          existing.quantity += quantity;
          existing.revenue += quantity * price;
        } else {
          productMap.set(productId, {
            quantity,
            revenue: quantity * price,
          });
        }
      }
    }

    // =========================
    // GET PRODUCTS
    // =========================

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: Array.from(productMap.keys()),
        },
      },
      select: {
        id: true,
        name: true,
        category: true,
        price: true,

        image:{
            select: {
                id: true,
                data: true
            }
        }
      },
    });

    // =========================
    // COMBINE DATA
    // =========================

    const topProducts = products
      .map((product) => {
        const data = productMap.get(product.id);

        return {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          image: product.image?.data?? null,
          quantity: data?.quantity ?? 0,
          revenue: data?.revenue ?? 0,
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json({
      period,
      topProducts,
    });
  } catch (error) {
    console.error("Top products error:", error);

    return NextResponse.json(
      {
        message: "Failed to get top products",
      },
      {
        status: 500,
      }
    );
  }
}
// /app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Period = "today" | "week" | "month" | "custom";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") as Period | null;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let groupBy: "hour" | "day";

    // TODAY - Group by HOUR
    if (period === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      groupBy = "hour";
    }
    // THIS WEEK
    else if (period === "week") {
      const day = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - day), 0, 0, 0);
      groupBy = "day";
    }
    // THIS MONTH
    else if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      groupBy = "day";
    }
    // CUSTOM
    else if (period === "custom" && from && to) {
      startDate = new Date(`${from}T00:00:00`);
      endDate = new Date(`${to}T00:00:00`);
      endDate.setDate(endDate.getDate() + 1);

      const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      groupBy = diffDays <= 1 ? "hour" : "day";
    }
    // DEFAULT
    else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      groupBy = "hour";
    }

    // GET SALES
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // CALCULATE
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = sales.length;
    const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

    // GROUP DATA
    const dataMap = new Map<string, number>();

    for (const sale of sales) {
      const key =
        groupBy === "hour"
          ? `${String(sale.createdAt.getHours()).padStart(2, "0")}:00`
          : sale.createdAt.toISOString().slice(0, 10);
      dataMap.set(key, (dataMap.get(key) || 0) + sale.total);
    }

    // FILL CHART DATA
    const chartData: { label: string; total: number }[] = [];

    if (groupBy === "hour") {
      for (let i = 0; i < 24; i++) {
        const hour = `${String(i).padStart(2, "0")}:00`;
        chartData.push({ label: hour, total: dataMap.get(hour) || 0 });
      }
    } else {
      const current = new Date(startDate);
      while (current < endDate) {
        const dateStr = current.toISOString().slice(0, 10);
        chartData.push({ label: dateStr, total: dataMap.get(dateStr) || 0 });
        current.setDate(current.getDate() + 1);
      }
    }

    return NextResponse.json({
      period,
      groupBy,
      totalSales,
      totalOrders,
      averageOrder: Math.round(averageOrder * 100) / 100,
      chartData,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ message: "Failed to get analytics" }, { status: 500 });
  }
}
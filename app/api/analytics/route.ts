// /app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Period = "today" | "week" | "month" | "custom";

// Format types for labels
type LabelFormat = "hour" | "dayNumber" | "shortDate";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") as Period | null;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let labelFormat: LabelFormat;

    // TODAY - Group by HOUR (00:00, 01:00, ...)
    if (period === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      labelFormat = "hour";
    }
    // THIS WEEK - Group by SHORT DATE (09-24, 09-25, ...)
    else if (period === "week") {
      const day = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - day), 0, 0, 0);
      labelFormat = "shortDate";
    }
    // THIS MONTH - Group by DAY NUMBER (1, 2, 3, ..., 31) ✅
    else if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      labelFormat = "dayNumber";
    }
    // CUSTOM
    else if (period === "custom" && from && to) {
      startDate = new Date(`${from}T00:00:00`);
      endDate = new Date(`${to}T00:00:00`);
      endDate.setDate(endDate.getDate() + 1);

      const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      // 1 day → hour, 2-31 days → dayNumber, 32+ days → shortDate
      labelFormat = diffDays <= 1 ? "hour" : diffDays <= 31 ? "dayNumber" : "shortDate";
    }
    // DEFAULT
    else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      labelFormat = "hour";
    }

    // GET SALES
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: startDate, lt: endDate },
      },
      orderBy: { createdAt: "asc" },
    });

    // CALCULATE
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = sales.length;
    const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

    // GROUP DATA with proper label format
    const dataMap = new Map<string, number>();

    for (const sale of sales) {
      const date = sale.createdAt;
      let key: string;

      switch (labelFormat) {
        case "hour":
          key = `${String(date.getHours()).padStart(2, "0")}:00`;
          break;
        case "dayNumber":
          key = String(date.getDate()); // ✅ "1", "2", "3", ...
          break;
        case "shortDate":
          key = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          break;
        default:
          key = String(date.getDate());
      }

      dataMap.set(key, (dataMap.get(key) || 0) + sale.total);
    }

    // FILL CHART DATA with empty slots
    const chartData: { label: string; total: number }[] = [];


    if (labelFormat === "hour") {
      const fullDayData: { label: string; total: number }[] = [];

        // 00:00 - 23:00
        for (let i = 0; i < 24; i++) {
            const hour = `${String(i).padStart(2, "0")}:00`;

            fullDayData.push({
            label: hour,
            total: dataMap.get(hour) || 0,
            });
        }

        // First hour with sales
        const firstIndex = fullDayData.findIndex(
            (item) => item.total > 0
        );

        // Last hour with sales
        let lastIndex = -1;

        for (let i = fullDayData.length - 1; i >= 0; i--) {
            if (fullDayData[i].total > 0) {
            lastIndex = i;
            break;
            }
        }

        // Trim only leading/trailing empty hours
        if (firstIndex !== -1) {
            chartData.push(
            ...fullDayData.slice(firstIndex, lastIndex + 1)
            );
        }
    } else if (labelFormat === "dayNumber") {
      // 1 - 31 (days of month) ✅
      const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const day = String(i);
        chartData.push({ label: day, total: dataMap.get(day) || 0 });
      }
    } else {
      // shortDate: 09-24, 09-25, ...
      const current = new Date(startDate);
      while (current < endDate) {
        const key = `${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
        chartData.push({ label: key, total: dataMap.get(key) || 0 });
        current.setDate(current.getDate() + 1);
      }
    }

    return NextResponse.json({
      period,
      labelFormat,
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
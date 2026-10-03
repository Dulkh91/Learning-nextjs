// /app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Period = "today" | "week" | "month" | "custom";

// Format types for labels
type LabelFormat = "hour" | "dayNumber" | "shortDate";

const TIME_ZONE = "Asia/Phnom_Penh";

/**
 * Get date/time parts in Cambodia timezone
 */
function getCambodiaParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "0";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
  };
}

/**
 * Create a UTC Date representing midnight in Cambodia
 *
 * Example:
 * Cambodia 2026-10-03 00:00
 * → UTC 2026-10-02 17:00
 */
function cambodiaDateToUTC(
  year: number,
  month: number,
  day: number
): Date {
  return new Date(
    Date.UTC(year, month - 1, day, 0, 0, 0) - 7 * 60 * 60 * 1000
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const period = searchParams.get("period") as Period | null;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    /**
     * Get current Cambodia date
     */
    const now = new Date();
    const nowCambodia = getCambodiaParts(now);

    let startDate: Date;
    let endDate: Date;
    let labelFormat: LabelFormat;

    // ============================================================
    // TODAY - Group by HOUR
    // ============================================================
    if (period === "today") {
      startDate = cambodiaDateToUTC(
        nowCambodia.year,
        nowCambodia.month,
        nowCambodia.day
      );

      const tomorrow = new Date(
        Date.UTC(
          nowCambodia.year,
          nowCambodia.month - 1,
          nowCambodia.day + 1
        )
      );

      endDate = new Date(
        tomorrow.getTime() - 7 * 60 * 60 * 1000
      );

      labelFormat = "hour";
    }

    // ============================================================
    // THIS WEEK - Sunday → Saturday
    // ============================================================
    else if (period === "week") {
      /**
       * Create a JS date representing the Cambodia calendar date.
       * We only use it to calculate the day of week.
       */
      const currentDate = new Date(
        nowCambodia.year,
        nowCambodia.month - 1,
        nowCambodia.day
      );

      const day = currentDate.getDay();

      // Start of Sunday
      const sunday = new Date(currentDate);
      sunday.setDate(currentDate.getDate() - day);

      startDate = cambodiaDateToUTC(
        sunday.getFullYear(),
        sunday.getMonth() + 1,
        sunday.getDate()
      );

      // End = next Sunday
      const nextSunday = new Date(sunday);
      nextSunday.setDate(sunday.getDate() + 7);

      endDate = cambodiaDateToUTC(
        nextSunday.getFullYear(),
        nextSunday.getMonth() + 1,
        nextSunday.getDate()
      );

      labelFormat = "shortDate";
    }

    // ============================================================
    // THIS MONTH - Group by DAY NUMBER
    // ============================================================
    else if (period === "month") {
      startDate = cambodiaDateToUTC(
        nowCambodia.year,
        nowCambodia.month,
        1
      );

      const nextMonth = new Date(
        nowCambodia.year,
        nowCambodia.month,
        1
      );

      endDate = cambodiaDateToUTC(
        nextMonth.getFullYear(),
        nextMonth.getMonth() + 1,
        1
      );

      labelFormat = "dayNumber";
    }

    // ============================================================
    // CUSTOM
    // ============================================================
    else if (period === "custom" && from && to) {
      /**
       * from / to are expected as:
       * YYYY-MM-DD
       */

      const [fromYear, fromMonth, fromDay] = from
        .split("-")
        .map(Number);

      const [toYear, toMonth, toDay] = to
        .split("-")
        .map(Number);

      startDate = cambodiaDateToUTC(
        fromYear,
        fromMonth,
        fromDay
      );

      // End date is the next day at Cambodia 00:00
      const toDate = new Date(
        toYear,
        toMonth - 1,
        toDay
      );

      toDate.setDate(toDate.getDate() + 1);

      endDate = cambodiaDateToUTC(
        toDate.getFullYear(),
        toDate.getMonth() + 1,
        toDate.getDate()
      );

      /**
       * Calculate number of calendar days.
       *
       * We use the Cambodia dates rather than UTC dates.
       */
      const startCalendar = new Date(
        fromYear,
        fromMonth - 1,
        fromDay
      );

      const endCalendar = new Date(
        toYear,
        toMonth - 1,
        toDay
      );

      const diffDays =
        Math.floor(
          (endCalendar.getTime() -
            startCalendar.getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      // 1 day → hour
      // 2-31 days → dayNumber
      // 32+ days → shortDate
      labelFormat =
        diffDays <= 1
          ? "hour"
          : diffDays <= 31
          ? "dayNumber"
          : "shortDate";
    }

    // ============================================================
    // DEFAULT
    // ============================================================
    else {
      startDate = cambodiaDateToUTC(
        nowCambodia.year,
        nowCambodia.month,
        nowCambodia.day
      );

      const tomorrow = new Date(
        Date.UTC(
          nowCambodia.year,
          nowCambodia.month - 1,
          nowCambodia.day + 1
        )
      );

      endDate = new Date(
        tomorrow.getTime() - 7 * 60 * 60 * 1000
      );

      labelFormat = "hour";
    }

    // ============================================================
    // GET SALES
    // ============================================================
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // ============================================================
    // CALCULATE SUMMARY
    // ============================================================
    const totalSales = sales.reduce(
      (sum, sale) => sum + sale.total,
      0
    );

    const totalOrders = sales.length;

    const averageOrder =
      totalOrders > 0
        ? totalSales / totalOrders
        : 0;

    // ============================================================
    // GROUP DATA
    // ============================================================
    const dataMap = new Map<string, number>();

    for (const sale of sales) {
      /**
       * IMPORTANT:
       * Convert database UTC time → Cambodia time
       */
      const date = getCambodiaParts(sale.createdAt);

      let key: string;

      switch (labelFormat) {
        case "hour":
          key = `${String(date.hour).padStart(2, "0")}:00`;
          break;

        case "dayNumber":
          key = String(date.day);
          break;

        case "shortDate":
          key = `${String(date.month).padStart(2, "0")}-${String(
            date.day
          ).padStart(2, "0")}`;
          break;

        default:
          key = String(date.day);
      }

      dataMap.set(
        key,
        (dataMap.get(key) || 0) + sale.total
      );
    }

    // ============================================================
    // FILL CHART DATA
    // ============================================================
    const chartData: {
      label: string;
      total: number;
    }[] = [];

    // ============================================================
    // HOURLY
    // ============================================================
    if (labelFormat === "hour") {
      const fullDayData: {
        label: string;
        total: number;
      }[] = [];

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

      for (
        let i = fullDayData.length - 1;
        i >= 0;
        i--
      ) {
        if (fullDayData[i].total > 0) {
          lastIndex = i;
          break;
        }
      }

      // Trim only leading/trailing empty hours
      if (firstIndex !== -1) {
        chartData.push(
          ...fullDayData.slice(
            firstIndex,
            lastIndex + 1
          )
        );
      }
    }

    // ============================================================
    // DAY NUMBER
    // ============================================================
    else if (labelFormat === "dayNumber") {
      /**
       * Determine number of days in the month
       * using Cambodia calendar.
       */
      const startParts = getCambodiaParts(startDate);

      const daysInMonth = new Date(
        startParts.year,
        startParts.month,
        0
      ).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        const day = String(i);

        chartData.push({
          label: day,
          total: dataMap.get(day) || 0,
        });
      }
    }

    // ============================================================
    // SHORT DATE
    // ============================================================
    else {
      /**
       * Build calendar dates using Cambodia timezone.
       */
      const startParts = getCambodiaParts(startDate);

      const endParts = getCambodiaParts(
        new Date(endDate.getTime() - 1)
      );

      const current = new Date(
        startParts.year,
        startParts.month - 1,
        startParts.day
      );

      const endCalendar = new Date(
        endParts.year,
        endParts.month - 1,
        endParts.day
      );

      while (current <= endCalendar) {
        const key = `${String(
          current.getMonth() + 1
        ).padStart(2, "0")}-${String(
          current.getDate()
        ).padStart(2, "0")}`;

        chartData.push({
          label: key,
          total: dataMap.get(key) || 0,
        });

        current.setDate(current.getDate() + 1);
      }
    }

    // ============================================================
    // RESPONSE
    // ============================================================
    return NextResponse.json({
      period,
      labelFormat,
      totalSales,
      totalOrders,
      averageOrder:
        Math.round(averageOrder * 100) / 100,
      chartData,
    });
  } catch (error) {
    console.error("Analytics error:", error);

    return NextResponse.json(
      {
        message: "Failed to get analytics",
      },
      {
        status: 500,
      }
    );
  }
}
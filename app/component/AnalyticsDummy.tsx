'use client'
import { useMemo, useState } from "react"
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
 } from "recharts"


type Sale = {
  id: number;
  total: number;
  createdAt: string;
};

const sales: Sale[] = [
    {
    id: 1,
    total: 4.6,
    createdAt: "2026-09-25T08:10:00",
  },
  {
    id: 1,
    total: 5.6,
    createdAt: "2026-09-25T08:11:00",
  },
  {
    id: 1,
    total: 4.6,
    createdAt: "2026-09-24T09:20:00",
  },
  {
    id: 2,
    total: 3.2,
    createdAt: "2026-09-24T10:15:00",
  },
  {
    id: 3,
    total: 5.5,
    createdAt: "2026-09-23T14:30:00",
  },
  {
    id: 4,
    total: 2.8,
    createdAt: "2026-09-22T16:20:00",
  },
  {
    id: 5,
    total: 7.2,
    createdAt: "2026-09-20T11:30:00",
  },
];

// type Period = "today" | "week" | "month" | "custom";
enum Period  {
    today,
    week,
    month,
    custom
}


export default function Analytics(){
   const [period, setPeriod] = useState<Period>(Period.today);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");    


  const filteredSales = useMemo(() => {
    const now = new Date();

    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);

      // -------------------------
      // Today
      // -------------------------
      if (period === Period.today) {
        return (
          saleDate.getFullYear() === now.getFullYear() &&
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getDate() === now.getDate()
        );
      }

      // -------------------------
      // This Week
      // -------------------------
      if (period === Period.week) {
        const currentDay = now.getDay();

        const firstDay = new Date(now);

        firstDay.setDate(now.getDate() - currentDay);
        firstDay.setHours(0, 0, 0, 0);

        const lastDay = new Date(firstDay);

        lastDay.setDate(firstDay.getDate() + 7);

        return saleDate >= firstDay && saleDate < lastDay;
      }

      // -------------------------
      // This Month
      // -------------------------
      if (period === Period.month) {
        return (
          saleDate.getFullYear() === now.getFullYear() &&
          saleDate.getMonth() === now.getMonth()
        );
      }

      // -------------------------
      // Custom Date
      // -------------------------
      if (period === Period.custom) {
        if (!startDate || !endDate) {
          return false;
        }

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return saleDate >= start && saleDate <= end;
      }

      return true;
    });
  }, [period, startDate, endDate]);

  // Total sales
  const totalSales = filteredSales.reduce(
    (sum, sale) => sum + sale.total,
    0
  );

  // Number of orders
  const totalOrders = filteredSales.length;

  // Average order
  const averageOrder =
    totalOrders > 0 ? totalSales / totalOrders : 0;

  // Chart data
  const chartData = filteredSales.map((sale) => ({
    date: new Date(sale.createdAt).toLocaleDateString("km-KH", {
      day: "2-digit",
      month: "2-digit",
    }),
    sales: sale.total,
  }));

    return (
         <div className="space-y-6">

      {/* =========================
          FILTER
      ========================= */}

      <div className="flex flex-wrap items-center gap-2">

        <button
          onClick={() => setPeriod(Period.today)}
          className={`rounded-lg px-4 py-2 ${
            period === Period.today
              ? "bg-black text-white"
              : "bg-gray-300 text-stone-900"
          }`}
        >
          ថ្ងៃនេះ
        </button>

        <button
          onClick={() => setPeriod(Period.week)}
          className={`rounded-lg px-4 py-2 ${
            period === Period.week
              ? "bg-black text-white"
              : "bg-gray-100  text-stone-900"
          }`}
        >
          សប្តាហ៍
        </button>

        <button
          onClick={() => setPeriod(Period.month)}
          className={`rounded-lg px-4 py-2 ${
            period === Period.month
              ? "bg-black text-white"
              : "bg-gray-100  text-stone-900"
          }`}
        >
          ខែ
        </button>

        <button
          onClick={() => setPeriod(Period.custom)}
          className={`rounded-lg px-4 py-2 ${
            period === Period.custom
              ? "bg-black text-white"
              : "bg-gray-100  text-stone-900"
          }`}
        >
          កំណត់ថ្ងៃ
        </button>

      </div>


      {/* =========================
          CUSTOM DATE
      ========================= */}

      {period === Period.custom && (
        <div className="flex flex-wrap gap-3">

          <div>
            <label className="mb-1 block text-sm">
              ចាប់ពី
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.target.value)
              }
              className="rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">
              ដល់
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(e.target.value)
              }
              className="rounded-lg border px-3 py-2"
            />
          </div>

        </div>
      )}


      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-xl bg-gray-300 p-5 shadow">
          <p className="text-gray-500">
            ចំណូលសរុប
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            ${totalSales.toFixed(2)}
          </h2>
        </div>


        <div className="rounded-xl  p-5 shadow">
          <p className="text-gray-500">
            ចំនួនការលក់
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {totalOrders}
          </h2>
        </div>


        <div className="rounded-xl bg-gray-300 p-5 shadow">
          <p className="text-gray-500">
            មធ្យមក្នុងមួយ Order
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            ${averageOrder.toFixed(2)}
          </h2>
        </div>

      </div>


      {/* =========================
          SALES CHART
      ========================= */}

      <div className="rounded-xl bg-stone-950 p-5 shadow">

        <div className="mb-5">
          <h2 className="text-xl font-bold">
            ការលក់
          </h2>

          <p className="text-sm text-gray-500">
            បង្ហាញតាមរយៈពេលដែលអ្នកបានជ្រើស
          </p>
        </div>

        <div className="h-[350px]">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart data={chartData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip
                formatter={(value) =>
                  `$${Number(value).toFixed(2)}`
                }
              />

              <Line
                type="monotone"
                dataKey="sales"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
    )
}
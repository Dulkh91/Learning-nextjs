"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ✅ កែ type ឱ្យត្រឹមត្រូវ
type ChartDataPoint = {
  label: string;
  total: number;
};

type AnalyticsData = {
  period: string;
  groupBy: "hour" | "day" | "shortDate";
  totalSales: number;
  totalOrders: number;
  averageOrder: number;
  chartData: ChartDataPoint[];
};

enum Period {
  Today = "today",
  Week = "week",
  Month = "month",
  Custom = "custom",
}

export default function Analytics() {
  const [period, setPeriod] = useState<Period>(Period.Today);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    period: "today",
    groupBy: "hour",
    totalSales: 0,
    totalOrders: 0,
    averageOrder: 0,
    chartData: [],
  });

  useEffect(() => {
    async function getAnalytics() {
      let url = `/api/analytics?period=${period}`;

      if (period === Period.Custom) {
        if (!startDate || !endDate) return;
        url = `/api/analytics?period=${period}&from=${startDate}&to=${endDate}`;
      }

      const res = await fetch(url);
      const data: AnalyticsData = await res.json();
      setAnalytics(data);
    }

    getAnalytics();
  }, [period, startDate, endDate]);

  // ✅ កំណត់ interval សម្រាប់ XAxis
  const xAxisInterval = analytics.groupBy === "hour" ? 2 : 0;

  return (
    <div className="space-y-6">
      {/* =========================
          FILTER BUTTONS
      ========================= */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPeriod(Period.Today)}
          className={`rounded-lg px-4 py-2 ${
            period === Period.Today
              ? "bg-black text-white"
              : "bg-gray-300 text-stone-900"
          }`}
        >
          ថ្ងៃនេះ
        </button>

        <button
          onClick={() => setPeriod(Period.Week)}
          className={`rounded-lg px-4 py-2 ${
            period === Period.Week
              ? "bg-black text-white"
              : "bg-gray-100 text-stone-900"
          }`}
        >
          សប្តាហ៍
        </button>

        <button
          onClick={() => setPeriod(Period.Month)}
          className={`rounded-lg px-4 py-2 ${
            period === Period.Month
              ? "bg-black text-white"
              : "bg-gray-100 text-stone-900"
          }`}
        >
          ខែ
        </button>

        <button
          onClick={() => setPeriod(Period.Custom)}
          className={`rounded-lg px-4 py-2 ${
            period === Period.Custom
              ? "bg-black text-white"
              : "bg-gray-100 text-stone-900"
          }`}
        >
          កំណត់ថ្ងៃ
        </button>
      </div>

      {/* =========================
          CUSTOM DATE
      ========================= */}
      {period === Period.Custom && (
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="mb-1 block text-sm">ចាប់ពី</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">ដល់</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border px-3 py-2"
            />
          </div>
        </div>
      )}

      {/* =========================
          SUMMARY CARDS (កែទាំអស់)
      ========================= */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Card 1: ចំណូលសរុប */}
        <div className="rounded-xl bg-gray-300 p-5 shadow">
          <p className="text-gray-500">ចំណូលសរុប</p>
          <h2 className="mt-2 text-3xl font-bold">
            ${analytics.totalSales.toFixed(2)}
          </h2>
        </div>

        {/* Card 2: ចំនួនការលក់ ✅ កែពី totalSales ទៅ totalOrders */}
        <div className="rounded-xl bg-gray-300 p-5 shadow">
          <p className="text-gray-500">ចំនួនការលក់</p>
          <h2 className="mt-2 text-3xl font-bold">
            {analytics.totalOrders}
          </h2>
        </div>

        {/* Card 3: មធ្យមក្នុងមួយ Order */}
        <div className="rounded-xl bg-gray-300 p-5 shadow">
          <p className="text-gray-500">មធ្យមក្នុងមួយ Order</p>
          <h2 className="mt-2 text-3xl font-bold">
            ${analytics.averageOrder.toFixed(2)}
          </h2>
        </div>
      </div>

      {/* =========================
          SALES CHART
      ========================= */}
      <div className="rounded-xl bg-stone-950 p-5 shadow">
        <div className="mb-5">
          <h2 className="text-xl font-bold">ការលក់</h2>
          <p className="text-sm text-gray-500">
            {analytics.groupBy === "hour"
              ? "បង្ហាញតាមម៉ោង (00:00 - 23:00)"
              : "បង្ហាញតាមថ្ងៃ"}
          </p>
        </div>

        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              
              {/* ✅ កែ dataKey ពី "date" ទៅ "label" */}
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                interval={xAxisInterval}
              />
              
              <YAxis tick={{ fill: "#9ca3af" }} />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fff" }}
                formatter={(value: number) => [
                  `$${value.toFixed(2)}`,
                  "លក់បាន",
                ]}
                labelFormatter={(label) =>
                  analytics.groupBy === "hour"
                    ? `ម៉ោង ${label}`
                    : label
                }
              />
              
              <Line
                type="monotone"
                dataKey="total"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ r: 4, fill: "#06b6d4" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
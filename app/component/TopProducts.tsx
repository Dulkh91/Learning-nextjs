"use client";

import { useEffect, useState } from "react";
import { Trophy, TrendingUp, Package, DollarSign } from "lucide-react"; 

type TopProduct = {
  rank: number;
  id: string;
  name: string;
  image: string | null;
  quantity: number;
  revenue: number;
  orders: number;
  revenuePercent: number;
  quantityPercent: number;
};

type TopProductsData = {
  period: string;
  sortBy: string;
  totalProducts: number;
  topProducts: TopProduct[];
};

enum Period {
  Today = "today",
  Week = "week",
  Month = "month",
  Year = "year",
}

enum SortBy {
  Revenue = "revenue",
  Quantity = "quantity",
  Orders = "orders",
}

export default function TopProducts() {
  const [period, setPeriod] = useState<Period>(Period.Today);
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Revenue);
  const [data, setData] = useState<TopProductsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchTopProducts() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/analytics/top-product?period=${period}&sortBy=${sortBy}&limit=5`
        );
        const result = await res.json();
        console.log(result)
        setData(result);
      } catch (error) {
        console.error("Failed to fetch top products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopProducts();
  }, [period, sortBy]);

  // Medal colors for top 3
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/50";
      case 2:
        return "text-gray-300 bg-gray-300/10 border-gray-300/50";
      case 3:
        return "text-amber-600 bg-amber-600/10 border-amber-600/50";
      default:
        return "text-cyan-500 bg-cyan-500/10 border-cyan-500/50";
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================
          HEADER & FILTERS
      ========================= */}
      <div className="flex flex-wrap items-center justify-between gap-4">

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Period */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="rounded-lg border bg-stone-800 px-3 py-2 text-sm"
          >
            <option value={Period.Today}>ថ្ងៃនេះ</option>
            <option value={Period.Week}>៧ ថ្ងៃ</option>
            <option value={Period.Month}>ខែនេះ</option>
            <option value={Period.Year}>ឆ្នាំនេះ</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-lg border bg-stone-800 px-3 py-2 text-sm"
          >
            <option value={SortBy.Revenue}>តាមចំណូល</option>
            <option value={SortBy.Quantity}>តាមចំនួន</option>
            <option value={SortBy.Orders}>តាមការបញ្ជា</option>
          </select>
        </div>
      </div>

      {/* =========================
          TOP PRODUCTS LIST
      ========================= */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
        </div>
      ) : data?.topProducts.length === 0 ? (
        <div className="rounded-xl bg-stone-800 p-8 text-center text-gray-500">
          មិនមានទិន្នន័យការលក់
        </div>
      ) : (
        <div className="space-y-3">
          {data?.topProducts.map((product) => (
            <div
              key={product.id}
              className={`flex items-center gap-4 rounded-xl border p-4 transition-all hover:bg-stone-800/50 ${
                product.rank <= 3 ? "bg-stone-800/30" : "bg-stone-900"
              }`}
            >
                
              {/* Rank Badge */}
              {/* <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-bold ${
                  getMedalColor(product.rank)
                }`}
              >
                {product.rank}
              </div> */}

              {/* Product Image */}
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-700">
                
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">
                    ☕
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium">{product.name}</h3>
                
                {/* Progress Bar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>
                      {/* {sortBy === SortBy.Revenue && `$${product.revenue.toFixed(2)}`} */}
                      {sortBy === SortBy.Quantity && `${product.quantity} កែវ`}
                      {sortBy === SortBy.Orders && `${product.orders} orders`}
                    </span>
                    <span>
                      {/* {sortBy === SortBy.Revenue && `${product.revenuePercent}%`} */}
                      {sortBy === SortBy.Quantity && `${product.quantityPercent}%`}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-700">
                    <div
                      className={`h-full rounded-full transition-all ${
                        product.rank === 1
                          ? "bg-yellow-500"
                          : product.rank === 2
                          ? "bg-gray-400"
                          : product.rank === 3
                          ? "bg-amber-600"
                          : "bg-cyan-500"
                      }`}
                      style={{
                        width: `${
                          sortBy === SortBy.Revenue
                            ? product.revenuePercent
                            : product.quantityPercent
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden shrink-0 gap-4 text-right sm:flex">
               
                <div>
                  <p className="text-xs text-gray-500">ចំនួនកែវ</p>
                  <p className="font-bold">{product.quantity}</p>
                </div>
                 <div>
                  <p className="text-xs text-gray-500">ចំណូល</p>
                  <p className="font-bold text-cyan-400">
                    ${product.revenue.toFixed(0)}
                  </p>
                </div>

                {/* <div>
                  <p className="text-xs text-gray-500">Orders</p>
                  <p className="font-bold">{product.orders}</p>
                </div> */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================
          SUMMARY FOOTER
      ========================= */}
      {data && (
        <div className="rounded-xl bg-stone-800/50 p-4 text-center text-sm text-gray-500">
          បង្ហាញពីផលិតផលចំនួន {data.topProducts.length} ក្នុងចំណោម {data.totalProducts} ផលិតផលសរុប
        </div>
      )}
    </div>
  );
}
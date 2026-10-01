"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { format } from "date-fns";
import { Search, Eye } from "lucide-react";
import Receipt from "../../component/Receipt";
import Pagination from "../../component/Pagination";

type Invoice = {
  id: string;
  invoiceNo: string;
  saleId: string;
  createdAt: string;
  sale: {
    id: string;
    total: number;
    items: string;
    createdAt: string;
  };
};

type PaginationData = {
  invoices: Invoice[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};



export default function InvoicesPage() {
  const [data, setData] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  const limit = 10;

  useEffect(() => {
    const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: activeSearch,
      });
      const response = await fetch(`/api/invoices?${params}`);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch invoices");
      }
      setErrorMessage("");
      setData(result);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

     fetchInvoices();
  }, [currentPage, activeSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveSearch(searchQuery.trim());
  };

  const handleView = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`);
      const invoice = await response.json();
      if (!response.ok) {
        throw new Error(invoice.error || "Failed to fetch invoice");
      }
      setViewInvoice(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to fetch invoice");
    }
  };


  const parseItems = (itemsString: string) => {
    try {
      return JSON.parse(itemsString || "[]");
    } catch {
      return [];
    }
  };


  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Invoices</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by invoice no or items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-[150px]">Invoice No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : errorMessage ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-red-600">
                  {errorMessage}
                </TableCell>
              </TableRow>
            ) : data?.invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              data?.invoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {invoice.invoiceNo}
                  </TableCell>
                  <TableCell>
                    {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>${invoice.sale.total.toFixed(2)}</TableCell>
                  <TableCell>
                    {/* <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        getStatus(invoice.createdAt) === "Paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {getStatus(invoice.createdAt)}
                    </span> */}
                    
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium  bg-green-100 text-green-800`}
                    >
                      Paid
                    </span>
                    

                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(invoice.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {data && !loading && !errorMessage && (
        <Pagination
          currentPage={currentPage}
          totalPages={data.totalPages}
          totalCount={data.totalCount}
          pageSize={limit}
          onPageChange={setCurrentPage}
        />
      )}
      {viewInvoice && (
        <Receipt
          cart={parseItems(viewInvoice.sale.items)}
          total={viewInvoice.sale.total}
          invoiceNo={viewInvoice.invoiceNo}
          onClose={() => setViewInvoice(null)}
        />
      )}
    </div>
  );
}

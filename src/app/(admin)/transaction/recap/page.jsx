"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { clearAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export default function DataPage() {
  const { addToast } = useToast();
  const router = useRouter();
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "",
    search: "",
  });
  const [isFiltered, setIsFiltered] = useState(false);
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState("date");
  const [orderDir, setOrderDir] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    page: 1,
    pages: 1,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: filters.search || "",
        limit: limit,
        page: page.toString(),
        order_by: orderBy,
        order_dir: orderDir,
        start_date: filters.startDate || "",
        end_date: filters.endDate || "",
        category: filters.category || "",
      });

      const response = await api.get(`/recap?${params.toString()}`);

      const data = await response.data;

      setAllData(data.data || []);
      setPagination({
        total: data.meta?.total || 0,
        limit: data.meta?.limit || 10,
        page: data.meta?.page || 1,
        pages: data.meta?.pages || 1,
      });
    } catch (err) {
      if (err.status == 401) {
        addToast("Session expired", "", "warning");
        clearAuth();
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (orderBy === field) {
      setOrderDir(orderDir === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(field);
      setOrderDir("asc");
    }
  };

  const totalPages = Math.ceil(pagination.total / Number(limit));

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setIsFiltered(true);
    setPage(1);
    fetchData();
  };

  useEffect(() => {
    setPage(1);
  }, [pagination.limit]);

  const handleResetFilter = () => {
    setIsFiltered(false);
    setPage(1);
  };

  useEffect(() => {
    setFilters({ startDate: "", endDate: "", category: "", search: "" });
    fetchData();
  }, [!isFiltered]);

  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, orderBy, orderDir]);

  const renderPageNumbers = () => {
    const pages = [];
    const visibleRange = 3;
    const start = Math.max(1, page - visibleRange);
    const end = Math.min(totalPages, page + visibleRange);

    for (let i = start; i <= end; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === page ? "default" : "outline"}
          className={i === page ? "bg-primary text-white" : ""}
          onClick={() => changePage(i)}
        >
          {i}
        </Button>
      );
    }
    return pages;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const isLastPage = pagination.page === pagination.pages;
  const showing = isLastPage
    ? pagination.total - pagination.limit * (pagination.page - 1)
    : pagination.limit;

  const text = `menampilkan ${showing} dari ${pagination.total} data`;

  return (
    <div className="p-6 space-y-6 bg-white rounded-sm shadow-sm">
      <form
        onSubmit={handleFilterSubmit}
        className="flex flex-col sm:flex-row justify-between items-center gap-3 flex-wrap"
      >
        <div></div>

        <div className="flex flex-wrap justify-end items-center gap-2 w-full sm:w-auto">
          {isFiltered && (
            <Button
              type="button"
              variant="outline"
              onClick={handleResetFilter}
              className="text-red-500 border-red-300 hover:bg-red-50 hover:text-red-600 hover:cursor-pointer"
            >
              Reset Filter
            </Button>
          )}
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            className="w-[140px]"
          />
          to
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            className="w-[140px]"
          />
          <Select
            value={filters.category}
            onValueChange={(v) => setFilters({ ...filters, category: v })}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Income">Income</SelectItem>
              <SelectItem value="Expense">Expanse</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="text"
            placeholder="Cari data..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-[180px]"
          />
          <Button
            type="submit"
            className="bg-primary text-white hover:bg-primary/80 hover:cursor-pointer"
          >
            Filter
          </Button>
        </div>
      </form>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>

              <TableHead
                onClick={() => handleSort("date")}
                className="cursor-pointer select-none"
              >
                Tanggal
                {orderBy === "date" && (
                  <span className="ml-1 text-xs">
                    {orderDir === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </TableHead>

              <TableHead
                onClick={() => handleSort("category")}
                className="cursor-pointer select-none"
              >
                Kategori
                {orderBy === "category" && (
                  <span className="ml-1 text-xs">
                    {orderDir === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </TableHead>

              <TableHead
                onClick={() => handleSort("value_idr")}
                className="cursor-pointer select-none"
              >
                Nominal
                {orderBy === "value_idr" && (
                  <span className="ml-1 text-xs">
                    {orderDir === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {allData.length > 0 ? (
              allData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {(page - 1) * Number(limit) + index + 1}
                  </TableCell>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">
                    {item.value_idr.toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-12 text-center">
                  Data tidak ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-600">{text}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => changePage(page - 1)}
          >
            Prev
          </Button>
          {renderPageNumbers()}
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => changePage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

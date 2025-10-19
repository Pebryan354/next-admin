"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { clearAuth } from "@/lib/auth";
import { NumericFormat } from "react-number-format";

export default function EditTransaksiPage() {
  const { id } = useParams(); // ambil ID dari URL
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    code: "",
    description: "",
    rate_euro: "",
    date_paid: "",
  });

  const [transactions, setTransactions] = useState([]);
  const [errorValidation, setErrorValidation] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/transactions/${id}`);

        let response = res.data;

        setForm({
          code: response.data.code || "",
          description: response.data.description || "",
          rate_euro: response.data.rate_euro?.toString() || "",
          date_paid: response.data.date_paid
            ? response.data.date_paid.split(" ")[0]
            : "",
        });

        const details = response.data.details;

        const grouped = details.reduce((acc, item) => {
          const catId = item.transaction_category_id;

          if (!acc[catId]) {
            acc[catId] = [];
          }

          acc[catId].push({
            name: item.name,
            nominal: item.value_idr.toString(),
            transaction_category_id: item.transaction_category_id, // tetap disimpan
          });

          return acc;
        }, {});

        const formatted = Object.keys(grouped).map((catId) => ({
          id: Date.now() + Number(catId),
          category: Number(catId),
          details: grouped[catId],
        }));

        setTransactions(formatted);
      } catch (err) {
        addToast("Gagal memuat data transaksi", "", "error");
        router.replace("/transaction/list");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChangeForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleChangeDetail = (catId, index, field, value) => {
    setTransactions((prev) =>
      prev.map((cat) => {
        if (cat.id === catId) {
          const updated = [...cat.details];
          updated[index][field] = value;
          return { ...cat, details: updated };
        }
        return cat;
      })
    );
  };

  const handleAddCategory = () => {
    setTransactions((prev) => [
      ...prev,
      {
        id: Date.now(),
        category: 1,
        details: [{ name: "", nominal: "" }],
      },
    ]);
  };

  const handleAddRow = (catId) => {
    setTransactions((prev) =>
      prev.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              details: [
                ...cat.details,
                {
                  name: "",
                  nominal: "",
                  transaction_category_id: cat.category,
                },
              ],
            }
          : cat
      )
    );
  };

  const handleRemoveRow = (catId, index) => {
    setTransactions((prev) =>
      prev.map((cat) => {
        if (cat.id === catId) {
          const updated = [...cat.details];
          if (updated.length > 1) updated.splice(index, 1);
          return { ...cat, details: updated };
        }
        return cat;
      })
    );
  };

  const handleChangeCategory = (id, value) => {
    setTransactions((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, category: value } : cat))
    );
  };

  const handleSave = async () => {
    try {
      const payload = {
        code: form.code,
        description: form.description,
        rate_euro: Number(form.rate_euro),
        date_paid: form.date_paid,
        details: transactions.flatMap((cat) =>
          cat.details.map((d) => ({
            transaction_category_id: d.transaction_category_id || 1,
            name: d.name,
            value_idr: Number(d.nominal),
          }))
        ),
      };

      await api.patch(`/transactions/${id}`, payload);

      addToast("Data transaksi berhasil diperbarui!", "", "success");
      router.replace("/transaction/list");
    } catch (err) {
      if (err.status == 401) {
        addToast("Session expired", "", "warning");
        clearAuth();
        router.push("/login");
      }

      addToast("Gagal update data!", "", "error");
    }
  };

  if (loading) return <div className="p-6">Memuat data...</div>;

  return (
    <div className="p-6 space-y-8 bg-white rounded-sm shadow-sm">
      <div>
        <h1 className="text-xl font-semibold mb-4">Edit Data Transaksi</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              placeholder="Contoh: Transaksi Bulan Agustus"
              className="h-41 resize-none"
              value={form.description}
              onChange={(e) => handleChangeForm("description", e.target.value)}
            />
            <small className="text-xs text-red-500">
              {errorValidation.description}
            </small>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Code</label>
              <Input
                value={form.code}
                onChange={(e) => handleChangeForm("code", e.target.value)}
              />
              <small className="text-xs text-red-500">
                {errorValidation.code}
              </small>
            </div>
            <div>
              <label className="block text-sm font-medium">Rate Euro</label>
              <NumericFormat
                thousandSeparator="."
                decimalSeparator=","
                customInput={Input}
                allowNegative={false}
                value={form.rate_euro}
                onValueChange={(values) =>
                  handleChangeForm("rate_euro", values.value)
                }
              />
              <small className="text-xs text-red-500">
                {errorValidation.rate_euro}
              </small>
            </div>
            <div>
              <label className="block text-sm font-medium">Date Paid</label>
              <Input
                type="date"
                value={form.date_paid}
                onChange={(e) => handleChangeForm("date_paid", e.target.value)}
              />
              <small className="text-xs text-red-500">
                {errorValidation.date_paid}
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {transactions.map((cat, i) => (
          <Card key={cat.id} className="p-4 relative overflow-hidden">
            <div className="flex gap-4">
              <div className="flex flex-col items-start min-w-[160px]">
                <span className="font-medium text-gray-700 mb-2">
                  Kategori:
                </span>
              </div>

              <div className="flex-1">
                <Select
                  value={cat.category}
                  onValueChange={(v) => handleChangeCategory(cat.id, v)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={1}>Income</SelectItem>
                    <SelectItem value={2}>Expense</SelectItem>
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-2 font-semibold text-sm text-gray-600 border mt-2 p-2 bg-gray-100">
                  <span>Nama Transaksi</span>
                  <span>Nominal (IDR)</span>
                </div>

                {cat.details.map((row, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 gap-2 items-center p-2 border"
                  >
                    <Input
                      value={row.name}
                      onChange={(e) =>
                        handleChangeDetail(
                          cat.id,
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Nama transaksi"
                    />
                    <div className="flex items-center gap-2">
                      <NumericFormat
                        thousandSeparator="."
                        decimalSeparator=","
                        customInput={Input}
                        allowNegative={false}
                        value={row.nominal}
                        onValueChange={(values) =>
                          handleChangeDetail(
                            cat.id,
                            index,
                            "nominal",
                            values.value
                          )
                        }
                        placeholder="Nominal"
                      />
                      {cat.details.length > 1 && (
                        <Button
                          className="hover:cursor-pointer text-red-500 hover:text-red-600"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRow(cat.id, index)}
                        >
                          <X />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <small className="text-xs text-red-500">
                  {errorValidation.details}
                </small>
              </div>

              <div className="flex items-center justify-start min-w-[160px] px-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleAddRow(cat.id)}
                  className="rounded-full bg-blue-500 text-white hover:bg-blue-600 hover:text-white hover:cursor-pointer"
                >
                  <Plus />
                </Button>
              </div>
            </div>

            {transactions.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-red-500 hover:text-red-600 hover:cursor-pointer"
                onClick={() => handleRemoveCategory(cat.id)}
              >
                <X />
              </Button>
            )}
          </Card>
        ))}

        <div className="flex justify-end">
          <Button
            variant="outline"
            className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white hover:cursor-pointer"
            onClick={handleAddCategory}
          >
            <Plus /> Tambah Kategori
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          className="bg-red-500 text-white hover:bg-red-600 hover:text-white hover:cursor-pointer"
          onClick={() => router.back()}
        >
          Batal
        </Button>
        <Button
          onClick={handleSave}
          className="bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer"
          disabled={loading}
        >
          {loading ? "Loading..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}

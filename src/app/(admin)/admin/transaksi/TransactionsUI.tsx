"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

type Transaction = {
  id: string; userName: string; userEmail: string; courseTitle: string;
  amount: number; status: "SUCCESS" | "PENDING" | "FAILED" | "EXPIRED";
  paymentMethod: string | null; createdAt: string; paidAt: string | null;
};
type Summary = { total: number; paid: number; pending: number };

const STATUS_LABELS: Record<string, string> = {
  SUCCESS: "PAID", PENDING: "PENDING", FAILED: "FAILED", EXPIRED: "EXPIRED",
};
const STATUS_STYLES: Record<string, string> = {
  SUCCESS: "bg-[#eff6ff] text-[#2563eb]",
  PENDING: "bg-[#fff4e8] text-orange-500",
  FAILED:  "bg-[#fff2f2] text-red-500",
  EXPIRED: "bg-stone-100 text-stone-400",
};

export default function TransactionsUI({ transactions, summary }: { transactions: Transaction[]; summary: Summary }) {
  const [filter, setFilter] = useState<"All" | "SUCCESS" | "PENDING" | "FAILED">("All");
  const [search, setSearch] = useState("");

  const filtered = transactions.filter((t) => {
    const matchFilter = filter === "All" || t.status === filter;
    const matchSearch = t.userName.toLowerCase().includes(search.toLowerCase()) ||
      t.courseTitle.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div>
      {/* Header */}
      <h1 className="mb-6 text-[28px] font-extrabold text-stone-900">Transactions</h1>

      {/* Search */}
      <div className="mb-4 flex h-14 items-center gap-3 rounded-[18px] bg-white px-4 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <Search size={18} className="shrink-0 text-stone-300" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transaction..." className="flex-1 bg-transparent text-sm outline-none" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {(["All", "Paid", "Pending", "Failed"] as const).map((f) => {
          const val = f === "Paid" ? "SUCCESS" : f === "Pending" ? "PENDING" : f === "Failed" ? "FAILED" : "All";
          const active = filter === val;
          return (
            <button key={f} onClick={() => setFilter(val as typeof filter)}
              className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                active ? "bg-[#2563eb] text-white" : "bg-white text-stone-500"
              }`}>{f}</button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mb-5 flex justify-between rounded-[22px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        {[
          { label: "Total", value: summary.total },
          { label: "Paid", value: summary.paid },
          { label: "Pending", value: summary.pending },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-xl font-bold text-[#2563eb]">{s.value}</p>
            <p className="mt-1 text-[11px] text-stone-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Transaction Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-[22px] bg-white p-8 text-center shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <p className="text-sm text-stone-400">Tidak ada transaksi ditemukan</p>
          </div>
        ) : filtered.map((t) => (
          <div key={t.id} className="rounded-[22px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-stone-900">{t.userName}</p>
                <p className="mt-1 text-sm text-stone-400">{t.courseTitle}</p>
              </div>
              <p className="text-lg font-extrabold text-[#2563eb]">
                Rp {(t.amount / 1000).toFixed(0)}K
              </p>
            </div>

            <div className="mt-3">
              <span className={`inline-block rounded-full px-3 py-1.5 text-[11px] font-bold ${STATUS_STYLES[t.status]}`}>
                {STATUS_LABELS[t.status]}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-[12px] bg-[#f8fafc] p-2.5">
                <p className="text-[11px] text-stone-400">Method</p>
                <p className="mt-1 text-sm font-semibold text-stone-700">{t.paymentMethod ?? "—"}</p>
              </div>
              <div className="rounded-[12px] bg-[#f8fafc] p-2.5">
                <p className="text-[11px] text-stone-400">Date</p>
                <p className="mt-1 text-sm font-semibold text-stone-700">
                  {formatDate(t.paidAt ?? t.createdAt)}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <Link href={`/admin/transaksi/${t.id}`}>
                <button className="h-[44px] w-full rounded-[12px] bg-[#2563eb] text-sm font-bold text-white">
                  View Detail
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

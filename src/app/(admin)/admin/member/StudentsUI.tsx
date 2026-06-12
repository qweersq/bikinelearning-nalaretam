"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Users, ChevronLeft, ChevronRight } from "lucide-react";

type Student = {
  id: string; name: string; email: string; hasAccess: boolean;
  completedCount: number; certCount: number; progress: number;
};
type Stats = { total: number; active: number; certificates: number; avgProgress: number };
type Pagination = { page: number; totalCount: number; pageSize: number };

export default function StudentsUI({
  students, stats, pagination, currentQ, currentFilter,
}: {
  students: Student[];
  stats: Stats;
  pagination: Pagination;
  currentQ: string;
  currentFilter: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(currentQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize);

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    const merged = { q: currentQ, filter: currentFilter, page: "1", ...overrides };
    if (merged.q) params.set("q", merged.q);
    if (merged.filter && merged.filter !== "All") params.set("filter", merged.filter);
    if (merged.page && merged.page !== "1") params.set("page", merged.page);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  useEffect(() => {
    setSearch(currentQ);
  }, [currentQ]);

  function handleSearchChange(val: string) {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.push(buildUrl({ q: val, page: "1" }));
    }, 400);
  }

  function initials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }

  const filters = ["All", "Active", "Inactive", "Completed"] as const;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[30px] font-extrabold text-stone-900">Students</h1>
        <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[16px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <Users size={20} className="text-stone-400" />
        </div>
      </div>

      {/* Search */}
      <div className="mb-5 flex h-14 items-center gap-3 rounded-[18px] bg-white px-4 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <Search size={18} className="shrink-0 text-stone-300" />
        <input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Cari nama atau email..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
        {search && (
          <button onClick={() => handleSearchChange("")} className="text-xs text-stone-400">✕</button>
        )}
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        {[
          { label: "Total Students", value: stats.total },
          { label: "Active Students", value: stats.active },
          { label: "Certificates", value: stats.certificates },
          { label: "Avg Progress", value: `${stats.avgProgress}%` },
        ].map((s) => (
          <div key={s.label} className="rounded-[20px] bg-white p-[18px] text-center shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <h3 className="text-[26px] font-bold text-[#2563eb]">{s.value}</h3>
            <p className="mt-1 text-xs text-stone-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {filters.map((f) => (
          <Link key={f} href={buildUrl({ filter: f, page: "1" })}>
            <button className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
              currentFilter === f ? "bg-[#2563eb] text-white" : "bg-white text-stone-500"
            }`}>{f}</button>
          </Link>
        ))}
      </div>

      {/* Result info */}
      <p className="mb-3 text-xs text-stone-400">
        {pagination.totalCount} siswa ditemukan
        {currentQ && ` untuk "${currentQ}"`}
        {" · "}Halaman {pagination.page} dari {Math.max(1, totalPages)}
      </p>

      {/* Student Cards */}
      <div className="space-y-3">
        {students.length === 0 ? (
          <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <p className="text-sm text-stone-400">Tidak ada siswa ditemukan</p>
          </div>
        ) : students.map((s) => (
          <div key={s.id} className="rounded-[24px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="flex h-[55px] w-[55px] shrink-0 items-center justify-center rounded-[16px] bg-[#eff6ff] text-lg font-extrabold text-[#2563eb]">
                {initials(s.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-stone-900">{s.name}</p>
                <p className="mt-0.5 truncate text-sm text-stone-400">{s.email}</p>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
                s.hasAccess ? "bg-[#eff6ff] text-[#2563eb]" : "bg-stone-100 text-stone-400"
              }`}>
                {s.hasAccess ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: "Progress", value: `${s.progress}%` },
                { label: "Completed", value: s.completedCount },
                { label: "Certificates", value: s.certCount },
              ].map((item) => (
                <div key={item.label} className="rounded-[12px] bg-[#f8fafc] p-3 text-center">
                  <p className="font-bold text-[#2563eb]">{item.value}</p>
                  <p className="mt-1 text-[11px] text-stone-400">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button className="h-[44px] flex-1 rounded-[12px] bg-[#f4f6f8] text-sm font-bold text-stone-600">
                Message
              </button>
              <Link href={`/admin/member/${s.id}`} className="flex-1">
                <button className="h-[44px] w-full rounded-[12px] bg-[#2563eb] text-sm font-bold text-white">
                  View Detail
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Link href={buildUrl({ page: String(pagination.page - 1) })}
            aria-disabled={pagination.page <= 1}
            className={pagination.page <= 1 ? "pointer-events-none opacity-30" : ""}>
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <ChevronLeft size={16} className="text-stone-600" />
            </div>
          </Link>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - pagination.page) <= 1)
            .reduce<(number | "...")[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-1 text-sm text-stone-400">…</span>
              ) : (
                <Link key={p} href={buildUrl({ page: String(p) })}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] text-sm font-bold transition-colors ${
                    pagination.page === p
                      ? "bg-[#2563eb] text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                      : "bg-white text-stone-600 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                  }`}>
                    {p}
                  </div>
                </Link>
              )
            )}

          <Link href={buildUrl({ page: String(pagination.page + 1) })}
            aria-disabled={pagination.page >= totalPages}
            className={pagination.page >= totalPages ? "pointer-events-none opacity-30" : ""}>
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <ChevronRight size={16} className="text-stone-600" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

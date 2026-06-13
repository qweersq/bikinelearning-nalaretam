"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, BookOpen, Tag } from "lucide-react";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: "PUBLISHED" | "DRAFT";
  moduleCount: number;
  studentCount: number;
  revenue: number;
};

function formatRevenue(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}JT`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}RB`;
  return `${n}`;
}

export default function CourseListUI({ courses }: { courses: Course[] }) {
  const [filter, setFilter] = useState<"All" | "PUBLISHED" | "DRAFT">("All");
  const [search, setSearch] = useState("");

  const filtered = courses.filter((c) => {
    const matchFilter = filter === "All" || c.status === filter;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[30px] font-extrabold text-stone-900">Mata Pelajaran</h1>
          <p className="mt-1 text-sm text-stone-400">Kelola mata pelajaran dan kategori belajar.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/kursus/kategori">
            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[16px] bg-white text-[#2563eb] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <Tag size={22} />
            </div>
          </Link>
          <Link href="/admin/kursus/tambah">
            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[16px] bg-[#2563eb] text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
              <Plus size={24} />
            </div>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 flex h-14 items-center gap-3 rounded-[18px] bg-white px-4 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <Search size={18} className="shrink-0 text-stone-300" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari materi..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      {/* Filters */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {(["All", "Published", "Draft"] as const).map((f) => {
          const val = f === "Published" ? "PUBLISHED" : f === "Draft" ? "DRAFT" : "All";
          const active = filter === val;
          return (
            <button
              key={f}
              onClick={() => setFilter(val as typeof filter)}
              className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                active ? "bg-[#2563eb] text-white" : "bg-white text-stone-500"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Course Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <BookOpen size={40} className="mx-auto mb-3 text-stone-200" />
            <p className="text-sm text-stone-400">Tidak ada kursus ditemukan</p>
          </div>
        ) : filtered.map((c) => (
          <div key={c.id} className="rounded-[24px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            {/* Top */}
            <div className="mb-4 flex gap-4">
              <div className="flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-[18px] bg-[#eff6ff]">
                <BookOpen size={28} className="text-[#2563eb]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold ${
                  c.status === "PUBLISHED" ? "bg-[#eff6ff] text-[#2563eb]" : "bg-[#fff4e8] text-orange-500"
                }`}>
                  {c.status}
                </span>
                <p className="mt-2 text-[18px] font-bold leading-tight text-stone-900">{c.title}</p>
                {c.description && (
                  <p className="mt-1 truncate text-sm text-stone-400">{c.description}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Modules", value: c.moduleCount },
                { label: "Students", value: c.studentCount },
                { label: "Revenue", value: formatRevenue(c.revenue) },
              ].map((s) => (
                <div key={s.label} className="rounded-[14px] bg-[#f8fafc] p-3 text-center">
                  <p className="font-bold text-[#2563eb]">{s.value}</p>
                  <p className="mt-1 text-[11px] text-stone-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <Link href={`/dashboard/modul/${c.slug}`} target="_blank" className="flex-1">
                <button className="h-[46px] w-full rounded-[14px] bg-[#f4f6f8] text-sm font-bold text-stone-700">
                  Preview
                </button>
              </Link>
              <Link href={`/admin/kursus/${c.id}`} className="flex-1">
                <button className="h-[46px] w-full rounded-[14px] bg-[#2563eb] text-sm font-bold text-white">
                  {c.status === "DRAFT" ? "Continue" : "Edit"}
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

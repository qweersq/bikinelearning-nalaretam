"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Award, ExternalLink } from "lucide-react";

type Cert = {
  id: string; certificateNumber: string; issuedAt: string;
  userName: string; userEmail: string; userId: string;
  courseTitle: string; courseId: string;
};

export default function SertifikatUI({ certs, totalStudents }: { certs: Cert[]; totalStudents: number }) {
  const [search, setSearch] = useState("");

  const filtered = certs.filter((c) =>
    c.userName.toLowerCase().includes(search.toLowerCase()) ||
    c.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
    c.certificateNumber.toLowerCase().includes(search.toLowerCase())
  );

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  }

  const coveragePercent = totalStudents > 0 ? Math.round((certs.length / totalStudents) * 100) : 0;

  return (
    <div>
      {/* Coverage bar */}
      <div className="mb-5 rounded-[22px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-700">Certificate Coverage</p>
          <p className="text-sm font-bold text-[#2563eb]">{coveragePercent}%</p>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#f1f3f5]">
          <div className="h-full rounded-full bg-[#2563eb] transition-all" style={{ width: `${coveragePercent}%` }} />
        </div>
        <p className="mt-2 text-xs text-stone-400">{certs.length} dari {totalStudents} siswa sudah punya sertifikat</p>
      </div>

      {/* Search */}
      <div className="mb-4 flex h-14 items-center gap-3 rounded-[18px] bg-white px-4 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <Search size={18} className="shrink-0 text-stone-300" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, kursus, atau nomor sertifikat..."
          className="flex-1 bg-transparent text-sm outline-none" />
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-[22px] bg-white p-8 text-center shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <Award size={32} className="mx-auto mb-3 text-stone-200" />
            <p className="text-sm text-stone-400">
              {certs.length === 0 ? "Belum ada sertifikat yang diterbitkan" : "Tidak ada hasil ditemukan"}
            </p>
          </div>
        ) : filtered.map((c) => (
          <div key={c.id} className="rounded-[22px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            {/* Top row */}
            <div className="flex items-start gap-3">
              <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] bg-[#eff6ff]">
                <Award size={22} className="text-[#2563eb]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-stone-900 truncate">{c.userName}</p>
                <p className="mt-0.5 text-xs text-stone-400 truncate">{c.userEmail}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#eff6ff] px-2.5 py-1 text-[10px] font-bold text-[#2563eb]">
                ISSUED
              </span>
            </div>

            {/* Details */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-[12px] bg-[#f8fafc] p-2.5">
                <p className="text-[10px] text-stone-400">Kursus</p>
                <p className="mt-0.5 text-xs font-semibold text-stone-700 line-clamp-1">{c.courseTitle}</p>
              </div>
              <div className="rounded-[12px] bg-[#f8fafc] p-2.5">
                <p className="text-[10px] text-stone-400">Tanggal Terbit</p>
                <p className="mt-0.5 text-xs font-semibold text-stone-700">{formatDate(c.issuedAt)}</p>
              </div>
            </div>

            {/* Cert number */}
            <div className="mt-2 rounded-[12px] bg-[#f8fafc] p-2.5">
              <p className="text-[10px] text-stone-400">Nomor Sertifikat</p>
              <p className="mt-0.5 font-mono text-xs font-semibold text-stone-600">{c.certificateNumber}</p>
            </div>

            {/* Actions */}
            <div className="mt-3 flex gap-2">
              <Link href={`/admin/member/${c.userId}`} className="flex-1">
                <button className="h-[40px] w-full rounded-[12px] bg-[#f4f6f8] text-xs font-bold text-stone-600">
                  View Student
                </button>
              </Link>
              <Link href={`/verify/${c.certificateNumber}`} target="_blank" className="flex-1">
                <button className="flex h-[40px] w-full items-center justify-center gap-1.5 rounded-[12px] bg-[#2563eb] text-xs font-bold text-white">
                  <ExternalLink size={13} />
                  Verify
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

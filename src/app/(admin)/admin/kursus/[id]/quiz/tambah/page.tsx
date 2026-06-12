"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TambahQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params);
  const router = useRouter();

  const [form, setForm] = useState({ title: "", description: "", passingScore: 70, timeLimit: "", isPublished: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title: form.title,
          description: form.description || undefined,
          passingScore: form.passingScore,
          timeLimit: form.timeLimit ? Number(form.timeLimit) : undefined,
          isPublished: form.isPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      router.push(`/admin/kursus/${courseId}/quiz/${data.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link href={`/admin/kursus/${courseId}/quiz`}>
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <ArrowLeft size={18} className="text-stone-600" />
          </div>
        </Link>
        <h1 className="text-[22px] font-extrabold text-stone-900">Buat Quiz</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Informasi Quiz</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Judul Quiz *</label>
              <input
                value={form.title} onChange={(e) => set("title", e.target.value)} required
                placeholder="Contoh: Kuis Akhir - Aljabar & Fungsi"
                className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Deskripsi</label>
              <textarea
                value={form.description} onChange={(e) => set("description", e.target.value)} rows={3}
                placeholder="Deskripsi singkat tentang quiz ini..."
                className="w-full resize-none rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]"
              />
            </div>
          </div>
        </div>

        {/* Quiz Settings */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Pengaturan Quiz</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Passing Score (%)</label>
              <input
                type="number" min={0} max={100}
                value={form.passingScore} onChange={(e) => set("passingScore", Number(e.target.value))}
                className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Time Limit (menit, kosongkan = tidak ada)</label>
              <input
                type="number" min={1}
                value={form.timeLimit} onChange={(e) => set("timeLimit", e.target.value)}
                placeholder="Contoh: 30"
                className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Status Publikasi</h3>
          <div className="flex gap-3">
            {[{ label: "Draft", value: false }, { label: "Published", value: true }].map((opt) => (
              <button
                key={String(opt.value)} type="button"
                onClick={() => set("isPublished", opt.value)}
                className={`flex-1 rounded-[12px] py-3 text-sm font-bold transition-colors ${form.isPublished === opt.value ? "bg-[#2563eb] text-white" : "bg-[#f8fafc] text-stone-500"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="rounded-[12px] bg-red-50 p-3 text-center text-sm text-red-500">{error}</p>}

        <button
          type="submit" disabled={loading}
          className="h-[56px] w-full rounded-[16px] bg-[#2563eb] text-sm font-bold text-white disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Buat Quiz"}
        </button>
      </form>
    </div>
  );
}

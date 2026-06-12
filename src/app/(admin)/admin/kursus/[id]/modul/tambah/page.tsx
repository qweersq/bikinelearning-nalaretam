"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function toSlug(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function CreateModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params);
  const router = useRouter();

  const [form, setForm] = useState({
    title: "", slug: "", duration: "", description: "", youtubeId: "",
    order: "1", isPublished: true,
  });
  const [totalModules, setTotalModules] = useState<number | null>(null);
  const [orderError, setOrderError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/kursus/${courseId}`)
      .then((r) => r.json())
      .then((data) => {
        const count = data.modules?.length ?? 0;
        setTotalModules(count);
        setForm((f) => ({ ...f, order: String(count + 1) }));
      });
  }, [courseId]);

  function handleOrderChange(val: string) {
    setForm((f) => ({ ...f, order: val }));
    const num = Number(val);
    if (!val || isNaN(num) || num < 1 || !Number.isInteger(num)) {
      setOrderError("Urutan harus berupa angka bulat minimal 1.");
    } else {
      setOrderError("");
    }
  }

  function handleTitle(title: string) {
    setForm((f) => ({ ...f, title, slug: toSlug(title) }));
  }

  async function handleSubmit() {
    if (!form.title || !form.youtubeId) { setError("Judul dan YouTube ID wajib diisi."); return; }
    const orderNum = Number(form.order);
    if (!form.order || isNaN(orderNum) || orderNum < 1 || !Number.isInteger(orderNum)) {
      setError("Urutan tidak valid."); return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/modul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title, slug: form.slug, description: form.description,
          youtubeId: form.youtubeId, duration: Number(form.duration) || 0,
          order: Number(form.order) || 1, courseId, isFree: false, isPublished: form.isPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      router.push(`/admin/kursus/${courseId}/modul`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/admin/kursus/${courseId}/modul`}>
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <ArrowLeft size={18} className="text-stone-600" />
          </div>
        </Link>
        <h1 className="text-[28px] font-extrabold text-stone-900">Create Module</h1>
      </div>

      <div className="rounded-[24px] bg-white p-[22px] shadow-[0_5px_20px_rgba(0,0,0,0.04)]">

        {/* Title */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-stone-700">Module Title</label>
          <input className="h-[54px] w-full rounded-[16px] border-2 border-[#edf1f5] px-4 text-sm outline-none focus:border-[#2563eb]"
            placeholder="e.g. Introduction" value={form.title} onChange={(e) => handleTitle(e.target.value)} />
        </div>

        {/* Duration */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-stone-700">Duration (Minutes)</label>
          <input type="number" className="h-[54px] w-full rounded-[16px] border-2 border-[#edf1f5] px-4 text-sm outline-none focus:border-[#2563eb]"
            placeholder="e.g. 10" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} />
        </div>

        {/* Order */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold text-stone-700">Urutan Modul</label>
            {totalModules !== null && (
              <span className="text-xs text-stone-400">{totalModules} modul sudah ada · disarankan: {totalModules + 1}</span>
            )}
          </div>
          <input
            type="number" min={1} step={1}
            className={`h-[54px] w-full rounded-[16px] border-2 px-4 text-sm outline-none transition-colors ${
              orderError ? "border-red-400 bg-red-50 focus:border-red-500" : "border-[#edf1f5] focus:border-[#2563eb]"
            }`}
            value={form.order}
            onChange={(e) => handleOrderChange(e.target.value)}
          />
          {orderError && <p className="mt-1.5 text-xs text-red-500">{orderError}</p>}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-stone-700">Description</label>
          <textarea className="h-[120px] w-full resize-none rounded-[16px] border-2 border-[#edf1f5] p-4 text-sm outline-none focus:border-[#2563eb]"
            placeholder="Write module description..." value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>

        {/* YouTube ID */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-stone-700">YouTube Video ID</label>
          <input className="h-[54px] w-full rounded-[16px] border-2 border-[#edf1f5] px-4 text-sm outline-none focus:border-[#2563eb]"
            placeholder="e.g. dQw4w9WgXcQ" value={form.youtubeId}
            onChange={(e) => setForm((f) => ({ ...f, youtubeId: e.target.value }))} />
        </div>

        {/* Status */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-stone-700">Status</label>
          <div className="flex gap-3">
            {([true, false] as const).map((pub) => (
              <button key={String(pub)} onClick={() => setForm((f) => ({ ...f, isPublished: pub }))}
                className={`flex h-[52px] flex-1 items-center justify-center rounded-[16px] border-2 text-sm font-semibold transition-colors ${
                  form.isPublished === pub ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]" : "border-[#edf1f5] text-stone-400"
                }`}>
                {pub ? "Published" : "Draft"}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <button onClick={handleSubmit} disabled={loading}
          className="h-[58px] w-full rounded-[18px] bg-[#2563eb] text-[15px] font-bold text-white disabled:opacity-60">
          {loading ? "Creating..." : "Create Module"}
        </button>
      </div>
    </div>
  );
}

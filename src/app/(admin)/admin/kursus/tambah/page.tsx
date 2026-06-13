"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImageIcon, Info, X } from "lucide-react";

type Category = { id: string; name: string };

function toSlug(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function CreateCoursePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: "", slug: "", categoryId: "", description: "", status: "DRAFT" as "PUBLISHED" | "DRAFT",
  });
  const [thumbnail, setThumbnail] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories);
  }, []);

  function handleTitle(title: string) {
    setForm((f) => ({ ...f, title, slug: toSlug(title) }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setThumbnail(data.url);
    else setError(data.message);
    setUploading(false);
    e.target.value = "";
  }

  async function handleSubmit() {
    if (!form.title || !form.categoryId) { setError("Judul dan kategori wajib diisi."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/kursus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: 0, thumbnail: thumbnail || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      router.push(`/admin/kursus/${data.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/kursus">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <ArrowLeft size={18} className="text-stone-600" />
          </div>
        </Link>
        <h1 className="text-[28px] font-extrabold text-stone-900">Tambah Mata Pelajaran</h1>
      </div>

      <div className="rounded-[28px] bg-white p-6 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">

        {/* Thumbnail upload */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-stone-700">Sampul Mata Pelajaran</label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {thumbnail ? (
            <div className="relative h-[180px] overflow-hidden rounded-[20px]">
              <img src={thumbnail} alt="thumbnail" className="h-full w-full object-cover" />
              <button
                onClick={() => setThumbnail("")}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex h-[180px] w-full flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-stone-200 bg-stone-50 text-stone-400 transition-colors hover:border-[#2563eb] hover:bg-[#f0fdf7] disabled:opacity-60"
            >
              {uploading ? (
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-[#2563eb]" />
              ) : (
                <>
                  <ImageIcon size={36} className="text-stone-300" />
                  <span className="text-sm">Klik untuk upload thumbnail</span>
                  <span className="text-xs text-stone-300">JPG, PNG, WebP · Maks 5MB</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Course Name */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-stone-700">Nama Mata Pelajaran</label>
          <input
            className="h-[54px] w-full rounded-[16px] border-2 border-[#edf1f5] px-4 text-sm outline-none focus:border-[#2563eb]"
            placeholder="e.g. UTBK Matematika - Aljabar"
            value={form.title}
            onChange={(e) => handleTitle(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-stone-700">Category</label>
          <select
            className="h-[54px] w-full rounded-[16px] border-2 border-[#edf1f5] px-4 text-sm outline-none focus:border-[#2563eb] bg-white"
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          >
            <option value="">Pilih Kategori</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-stone-700">Deskripsi Singkat</label>
          <textarea
            className="h-[120px] w-full resize-none rounded-[16px] border-2 border-[#edf1f5] p-4 text-sm outline-none focus:border-[#2563eb]"
            placeholder="Jelaskan tentang mata pelajaran ini..."
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        {/* Status */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-stone-700">Status</label>
          <div className="flex gap-3">
            {(["PUBLISHED", "DRAFT"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setForm((f) => ({ ...f, status: s }))}
                className={`flex h-[52px] flex-1 items-center justify-center rounded-[16px] border-2 text-sm font-semibold transition-colors ${
                  form.status === s
                    ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]"
                    : "border-[#edf1f5] text-stone-400"
                }`}
              >
                {s === "PUBLISHED" ? "Published" : "Draft"}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mb-5 rounded-[18px] bg-[#f8fafc] p-4">
          <div className="flex gap-2 text-stone-400">
            <Info size={16} className="mt-0.5 shrink-0" />
            <p className="text-[13px] leading-relaxed">
              Setelah mata pelajaran dibuat, Anda dapat menambahkan Materi, Kuis, dan Pengaturan Sertifikat.
            </p>
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="h-[58px] w-full rounded-[18px] bg-[#2563eb] text-[15px] font-bold text-white disabled:opacity-60"
        >
          {loading ? "Membuat..." : "Buat Mata Pelajaran"}
        </button>
      </div>
    </div>
  );
}

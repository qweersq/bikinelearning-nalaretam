"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, ClipboardList, Award, Users, ChevronRight, ImageIcon, X } from "lucide-react";

type Category = { id: string; name: string };
type CourseData = {
  id: string; title: string; slug: string; description: string;
  status: "PUBLISHED" | "DRAFT"; categoryId: string;
  thumbnail: string;
  moduleCount: number; studentCount: number; revenue: number; hasQuiz: boolean;
};

function formatRevenue(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}JT`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}RB`;
  return `${n}`;
}

export default function CourseDetailClient({ course, categories }: { course: CourseData; categories: Category[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: course.title, slug: course.slug, description: course.description,
    status: course.status, categoryId: course.categoryId,
  });
  const [thumbnail, setThumbnail] = useState(course.thumbnail);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

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

  async function handleSave() {
    setLoading(true); setError(""); setSaved(false);
    try {
      const res = await fetch(`/api/admin/kursus/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: 0, thumbnail: thumbnail || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setSaved(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const manageItems = [
    { icon: BookOpen,       label: "Modules",     sub: "Manage lessons & videos",         href: `/admin/kursus/${course.id}/modul` },
    // { icon: Award,          label: "Certificate",  sub: "View issued certificates",        href: `/admin/sertifikat` },
    { icon: Users,          label: "Students",     sub: "View enrolled students",          href: `/admin/member?course=${course.id}` },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link href="/admin/kursus">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <ArrowLeft size={18} className="text-stone-600" />
          </div>
        </Link>
        <h1 className="text-[26px] font-extrabold text-stone-900">Course Detail</h1>
      </div>

      {/* Cover Card */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <div className="mb-5 overflow-hidden rounded-[28px] bg-white shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <div className="relative h-[180px]">
          {thumbnail ? (
            <>
              <img src={thumbnail} alt="thumbnail" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all hover:bg-black/30 hover:opacity-100">
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="rounded-full bg-white px-4 py-2 text-xs font-bold text-stone-800">
                  {uploading ? "Uploading..." : "Ganti"}
                </button>
                <button onClick={() => setThumbnail("")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500">
                  <X size={14} />
                </button>
              </div>
            </>
          ) : (
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#2563eb] to-[#3b82f6] text-white/80 hover:from-[#0b8a4d] hover:to-[#1aad62]">
              {uploading
                ? <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                : <><ImageIcon size={36} /><span className="text-sm font-semibold">Upload Thumbnail</span></>
              }
            </button>
          )}
        </div>
        <div className="p-5">
          <span className={`inline-block rounded-full px-3 py-1.5 text-xs font-bold ${
            form.status === "PUBLISHED" ? "bg-[#eff6ff] text-[#2563eb]" : "bg-[#fff4e8] text-orange-500"
          }`}>{form.status}</span>
          <h2 className="mt-3 text-2xl font-extrabold text-stone-900">{form.title}</h2>
          {form.description && <p className="mt-2 text-sm leading-relaxed text-stone-400">{form.description}</p>}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Modules", value: course.moduleCount },
              { label: "Students", value: course.studentCount },
              { label: "Revenue", value: formatRevenue(course.revenue) },
            ].map((s) => (
              <div key={s.label} className="rounded-[14px] bg-[#f8fafc] p-3 text-center">
                <p className="font-bold text-[#2563eb]">{s.value}</p>
                <p className="mt-1 text-[11px] text-stone-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <h2 className="mb-3 text-[22px] font-extrabold text-stone-900">Basic Information</h2>
      <div className="mb-5 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-stone-700">Course Name</label>
          <input className="h-[52px] w-full rounded-[14px] border-2 border-[#edf1f5] px-4 text-sm outline-none focus:border-[#2563eb]"
            value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-stone-700">Category</label>
          <select className="h-[52px] w-full rounded-[14px] border-2 border-[#edf1f5] bg-white px-4 text-sm outline-none focus:border-[#2563eb]"
            value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-stone-700">Description</label>
          <textarea className="h-[100px] w-full resize-none rounded-[14px] border-2 border-[#edf1f5] p-4 text-sm outline-none focus:border-[#2563eb]"
            value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700">Status</label>
          <div className="flex gap-3">
            {(["PUBLISHED", "DRAFT"] as const).map((s) => (
              <button key={s} onClick={() => setForm((f) => ({ ...f, status: s }))}
                className={`flex h-[50px] flex-1 items-center justify-center rounded-[14px] border-2 text-sm font-semibold transition-colors ${
                  form.status === s ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]" : "border-[#edf1f5] text-stone-400"
                }`}>
                {s === "PUBLISHED" ? "Published" : "Draft"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Manage */}
      <h2 className="mb-3 text-[22px] font-extrabold text-stone-900">Manage Course</h2>
      <div className="mb-6 flex flex-col gap-[14px]">
        {manageItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center justify-between rounded-[20px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#f8fafc]">
                    <Icon size={22} className="text-stone-500" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900">{item.label}</p>
                    <p className="mt-0.5 text-xs text-stone-400">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-stone-300" />
              </div>
            </Link>
          );
        })}
      </div>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
      {saved && <p className="mb-3 text-sm text-[#2563eb]">Perubahan tersimpan!</p>}

      {/* Actions */}
      <div className="flex gap-3">
        <Link href={`/dashboard/modul/${form.slug}`} target="_blank" className="flex-1">
          <button className="h-[56px] w-full rounded-[16px] bg-[#f4f6f8] text-sm font-bold text-stone-700">Preview</button>
        </Link>
        <button onClick={handleSave} disabled={loading}
          className="h-[56px] flex-1 rounded-[16px] bg-[#2563eb] text-sm font-bold text-white disabled:opacity-60">
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

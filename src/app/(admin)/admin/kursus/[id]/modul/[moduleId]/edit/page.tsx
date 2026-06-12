"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Params = { id: string; moduleId: string };

export default function EditModulePage({ params }: { params: Promise<Params> }) {
  const { id: courseId, moduleId } = use(params);
  const router = useRouter();

  const [form, setForm] = useState({
    title: "", slug: "", description: "", youtubeId: "", duration: "", order: "", isPublished: true, isFree: false, courseId,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/modul/${moduleId}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          title: data.title, slug: data.slug, description: data.description ?? "",
          youtubeId: data.youtubeId, duration: String(data.duration), order: String(data.order),
          isPublished: data.isPublished, isFree: data.isFree, courseId: data.courseId,
        });
        setLoading(false);
      });
  }, [moduleId]);

  async function handleSave() {
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/admin/modul/${moduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, duration: Number(form.duration) || 0, order: Number(form.order) || 1 }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      router.push(`/admin/kursus/${courseId}/modul`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Hapus modul ini? Data progress siswa juga akan dihapus.")) return;
    setDeleting(true);
    await fetch(`/api/admin/modul/${moduleId}`, { method: "DELETE" });
    router.push(`/admin/kursus/${courseId}/modul`);
  }

  if (loading) return <div className="pt-20 text-center text-sm text-stone-400">Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link href={`/admin/kursus/${courseId}/modul`}>
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <ArrowLeft size={18} className="text-stone-600" />
          </div>
        </Link>
        <h1 className="text-[26px] font-extrabold text-stone-900">Edit Module</h1>
      </div>

      {/* Module Info Card */}
      <div className="mb-5 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <span className="inline-block rounded-full bg-[#e8f4ff] px-3 py-1.5 text-xs font-bold text-blue-600">VIDEO MODULE</span>
        <h2 className="mt-3 text-[22px] font-extrabold text-stone-900">{form.title}</h2>
        <p className="mt-1 text-sm text-stone-400">Module #{form.order} · {form.duration} Minutes</p>
      </div>

      {/* Basic Info */}
      <div className="mb-4 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <h3 className="mb-4 text-lg font-bold text-stone-900">Basic Information</h3>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-stone-700">Module Title</label>
          <input className="h-[54px] w-full rounded-[14px] border-2 border-[#edf1f5] px-4 text-sm outline-none focus:border-[#2563eb]"
            value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-stone-700">Duration (Minutes)</label>
          <input type="number" className="h-[54px] w-full rounded-[14px] border-2 border-[#edf1f5] px-4 text-sm outline-none focus:border-[#2563eb]"
            value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700">Description</label>
          <textarea className="h-[140px] w-full resize-none rounded-[14px] border-2 border-[#edf1f5] p-4 text-sm outline-none focus:border-[#2563eb]"
            value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
      </div>

      {/* YouTube ID */}
      <div className="mb-4 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <h3 className="mb-4 text-lg font-bold text-stone-900">Video Content</h3>
        <div className="rounded-[16px] bg-[#f8fafc] p-4">
          <p className="mb-1 text-sm font-semibold text-stone-700">YouTube Video ID</p>
          <input className="mt-2 h-[48px] w-full rounded-[12px] border-2 border-[#edf1f5] bg-white px-4 text-sm outline-none focus:border-[#2563eb]"
            value={form.youtubeId} onChange={(e) => setForm((f) => ({ ...f, youtubeId: e.target.value }))} />
        </div>
      </div>

      {/* Status */}
      <div className="mb-6 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <h3 className="mb-4 text-lg font-bold text-stone-900">Status</h3>
        <div className="flex gap-3">
          {([true, false] as const).map((pub) => (
            <button key={String(pub)} onClick={() => setForm((f) => ({ ...f, isPublished: pub }))}
              className={`flex h-[50px] flex-1 items-center justify-center rounded-[14px] border-2 text-sm font-semibold transition-colors ${
                form.isPublished === pub ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]" : "border-[#edf1f5] text-stone-400"
              }`}>
              {pub ? "Published" : "Draft"}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {/* Bottom Actions */}
      <div className="flex gap-3">
        <button onClick={handleDelete} disabled={deleting}
          className="flex h-[56px] flex-1 items-center justify-center rounded-[16px] bg-[#fff2f2] text-sm font-bold text-red-500 disabled:opacity-60">
          {deleting ? "Deleting..." : "Delete"}
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex h-[56px] flex-1 items-center justify-center rounded-[16px] bg-[#2563eb] text-sm font-bold text-white disabled:opacity-60">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

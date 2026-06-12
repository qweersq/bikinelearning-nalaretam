"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";

interface Course { id: string; title: string; }

export default function EditModulPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({
    title: "", slug: "", description: "", youtubeId: "",
    duration: "", order: "", courseId: "", isFree: false, isPublished: false,
  });
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/courses").then((r) => r.json()),
      fetch(`/api/admin/modul/${id}`).then((r) => r.json()),
    ]).then(([crs, modul]) => {
      if (Array.isArray(crs)) setCourses(crs);
      if (modul?.id) {
        setForm({
          title: modul.title,
          slug: modul.slug,
          description: modul.description ?? "",
          youtubeId: modul.youtubeId,
          duration: String(modul.duration),
          order: String(modul.order),
          courseId: modul.courseId,
          isFree: modul.isFree,
          isPublished: modul.isPublished,
        });
      }
      setFetching(false);
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    const res = await fetch(`/api/admin/modul/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        duration: parseInt(form.duration) || 0,
        order: parseInt(form.order) || 0,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/admin/modul");
    } else {
      setMsg({ type: "error", text: data.message ?? "Gagal menyimpan modul." });
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Hapus modul ini? Tindakan ini tidak bisa dibatalkan.")) return;
    const res = await fetch(`/api/admin/modul/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/modul");
    } else {
      setMsg({ type: "error", text: "Gagal menghapus modul." });
    }
  }

  if (fetching) return (
    <div className="flex h-64 items-center justify-center text-stone-400">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-blue-600" />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/admin/modul" className="text-stone-400 hover:text-stone-700 transition-colors">←</Link>
        <div>
          <h1 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-stone-900">Edit Modul</h1>
          <p className="mt-0.5 text-stone-500">{form.title}</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Judul Modul"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Input
            label="Slug (URL)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700">Deskripsi</label>
            <textarea
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-[15px] text-stone-900 resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none hover:border-stone-300 transition-colors"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <Input
            label="YouTube Video ID"
            value={form.youtubeId}
            onChange={(e) => setForm({ ...form, youtubeId: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Durasi (menit)"
              type="number"
              min="0"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
            <Input
              label="Urutan"
              type="number"
              min="1"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700">Course</label>
            <select
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-[15px] text-stone-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none hover:border-stone-300 transition-colors h-12"
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              required
            >
              <option value="">Pilih course...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-stone-700">Modul Gratis</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-stone-700">Publish</span>
            </label>
          </div>

          {msg && <Alert type={msg.type} message={msg.text} />}

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex gap-3">
              <Button type="submit" loading={loading}>Simpan Perubahan</Button>
              <Link href="/admin/modul">
                <Button type="button" variant="secondary">Batal</Button>
              </Link>
            </div>
            <Button type="button" variant="danger" onClick={handleDelete}>Hapus</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

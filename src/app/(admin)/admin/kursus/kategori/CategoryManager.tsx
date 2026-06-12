"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3, FolderOpen, Plus, Save, Trash2, X } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  _count: { courses: number };
};

type FormState = {
  name: string;
  slug: string;
  description: string;
  order: string;
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

const emptyForm: FormState = { name: "", slug: "", description: "", order: "0" };

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const editingCategory = useMemo(
    () => categories.find((category) => category.id === editingId) ?? null,
    [categories, editingId]
  );

  function handleNameChange(name: string) {
    setForm((current) => ({
      ...current,
      name,
      slug: editingId && current.slug !== toSlug(editingCategory?.name ?? "") ? current.slug : toSlug(name),
    }));
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setError("");
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      order: String(category.order),
    });
  }

  function resetForm() {
    setEditingId(null);
    setError("");
    setForm(emptyForm);
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.slug.trim()) {
      setError("Nama dan slug kategori wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");

    const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal menyimpan kategori.");
        return;
      }
      resetForm();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(category: Category) {
    if (category._count.courses > 0) {
      setError(`Kategori "${category.name}" masih digunakan oleh ${category._count.courses} materi.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal menghapus kategori.");
        return;
      }
      if (editingId === category.id) resetForm();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/kursus">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <ArrowLeft size={18} className="text-stone-600" />
          </div>
        </Link>
        <div>
          <h1 className="text-[26px] font-extrabold text-stone-900">Kategori Materi</h1>
          <p className="text-xs text-stone-400">Kelompokkan materi agar mudah difilter siswa.</p>
        </div>
      </div>

      <div className="mb-5 rounded-[26px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-stone-900">
            {editingId ? "Edit Kategori" : "Tambah Kategori"}
          </h2>
          {editingId && (
            <button
              onClick={resetForm}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-50 text-stone-400"
              type="button"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700">Nama Kategori</label>
            <input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Matematika"
              className="h-[52px] w-full rounded-[16px] border-2 border-[#edf1f5] px-4 text-sm outline-none focus:border-[#2563eb]"
            />
          </div>

          <div className="grid grid-cols-[1fr_92px] gap-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-700">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((current) => ({ ...current, slug: toSlug(e.target.value) }))}
                placeholder="matematika"
                className="h-[52px] w-full rounded-[16px] border-2 border-[#edf1f5] px-4 text-sm outline-none focus:border-[#2563eb]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-700">Urutan</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((current) => ({ ...current, order: e.target.value }))}
                className="h-[52px] w-full rounded-[16px] border-2 border-[#edf1f5] px-4 text-sm outline-none focus:border-[#2563eb]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
              placeholder="Deskripsi singkat kategori..."
              className="h-[96px] w-full resize-none rounded-[16px] border-2 border-[#edf1f5] p-4 text-sm outline-none focus:border-[#2563eb]"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 flex h-[54px] w-full items-center justify-center gap-2 rounded-[17px] bg-[#2563eb] text-sm font-bold text-white disabled:opacity-60"
          type="button"
        >
          {editingId ? <Save size={17} /> : <Plus size={17} />}
          {loading ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Kategori"}
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[22px] font-extrabold text-stone-900">Daftar Kategori</h2>
        <span className="text-sm font-semibold text-stone-400">{categories.length} kategori</span>
      </div>

      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <FolderOpen size={40} className="mx-auto mb-3 text-stone-200" />
            <p className="text-sm text-stone-400">Belum ada kategori materi</p>
          </div>
        ) : categories.map((category) => (
          <div key={category.id} className="rounded-[22px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-extrabold text-stone-900">{category.name}</h3>
                  <span className="rounded-full bg-[#eff6ff] px-2.5 py-1 text-[10px] font-bold text-[#2563eb]">
                    {category._count.courses} materi
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-stone-400">/{category.slug}</p>
                {category.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-500">{category.description}</p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => startEdit(category)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb]"
                  type="button"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  disabled={loading || category._count.courses > 0}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Tag, Trash2, ToggleLeft, ToggleRight, X, Pencil, Check } from "lucide-react";

interface PromoCode {
  id: string; code: string; discount: number;
  maxUses: number | null; usedCount: number;
  isActive: boolean; expiresAt: string | null; createdAt: string;
}

type EditState = { discount: string; maxUses: string; expiresAt: string };

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", discount: "", maxUses: "", expiresAt: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditState>({ discount: "", maxUses: "", expiresAt: "" });
  const [editSaving, setEditSaving] = useState(false);

  const fetchPromos = useCallback(async () => {
    const res = await fetch("/api/admin/promo");
    if (res.ok) setPromos(await res.json());
  }, []);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    const res = await fetch("/api/admin/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: form.code, discount: Number(form.discount), maxUses: form.maxUses || undefined, expiresAt: form.expiresAt || undefined }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message); setSaving(false); return; }
    setForm({ code: "", discount: "", maxUses: "", expiresAt: "" });
    setShowForm(false);
    fetchPromos();
    setSaving(false);
  }

  function startEdit(p: PromoCode) {
    setEditingId(p.id);
    setEditForm({
      discount: String(p.discount),
      maxUses: p.maxUses !== null ? String(p.maxUses) : "",
      expiresAt: p.expiresAt ? p.expiresAt.slice(0, 16) : "",
    });
  }

  async function saveEdit(p: PromoCode) {
    setEditSaving(true);
    await fetch(`/api/admin/promo/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        discount: Number(editForm.discount),
        maxUses: editForm.maxUses || null,
        expiresAt: editForm.expiresAt || null,
      }),
    });
    setEditingId(null);
    fetchPromos();
    setEditSaving(false);
  }

  async function toggleActive(p: PromoCode) {
    await fetch(`/api/admin/promo/${p.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    fetchPromos();
  }

  async function handleDelete(p: PromoCode) {
    if (!confirm(`Hapus kode "${p.code}"?`)) return;
    await fetch(`/api/admin/promo/${p.id}`, { method: "DELETE" });
    fetchPromos();
  }

  const activeCount = promos.filter((p) => p.isActive).length;
  const totalUses = promos.reduce((s, p) => s + p.usedCount, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[28px] font-extrabold text-stone-900">Promo Codes</h1>
        <button onClick={() => { setShowForm((v) => !v); setError(""); }}
          className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[#2563eb] text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
          {showForm ? <X size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: "Total Kode", value: promos.length },
          { label: "Aktif", value: activeCount },
          { label: "Total Pakai", value: totalUses },
        ].map((s) => (
          <div key={s.label} className="rounded-[20px] bg-white p-4 shadow-[0_5px_20px_rgba(0,0,0,0.04)] text-center">
            <p className="text-xl font-extrabold text-[#2563eb]">{s.value}</p>
            <p className="mt-1 text-[10px] text-stone-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mb-5 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Buat Kode Promo</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Kode Promo *</label>
              <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                required placeholder="Contoh: HEMAT50"
                className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 font-mono text-sm uppercase tracking-widest outline-none focus:border-[#2563eb]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-stone-500">Diskon (%) *</label>
                <input type="number" min={1} max={100} value={form.discount}
                  onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))} required placeholder="20"
                  className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-stone-500">Maks. Pakai</label>
                <input type="number" min={1} value={form.maxUses}
                  onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} placeholder="∞ unlimited"
                  className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Berlaku Sampai</label>
              <input type="datetime-local" value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]" />
            </div>
            {error && <p className="rounded-[12px] bg-red-50 p-3 text-center text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={saving}
              className="h-[48px] w-full rounded-[14px] bg-[#2563eb] text-sm font-bold text-white disabled:opacity-60">
              {saving ? "Menyimpan..." : "Buat Promo"}
            </button>
          </form>
        </div>
      )}

      {/* Promo list */}
      {promos.length === 0 ? (
        <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <Tag size={32} className="mx-auto mb-3 text-stone-200" />
          <p className="text-sm text-stone-400">Belum ada kode promo. Klik + untuk membuat.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promos.map((p) => {
            const expired = p.expiresAt ? new Date(p.expiresAt) < new Date() : false;
            const habis = p.maxUses !== null && p.usedCount >= p.maxUses;
            const statusLabel = expired ? "Expired" : habis ? "Habis" : p.isActive ? "Aktif" : "Nonaktif";
            const statusStyle = (!expired && !habis && p.isActive)
              ? "bg-[#eff6ff] text-[#2563eb]"
              : "bg-stone-100 text-stone-400";

            return (
              <div key={p.id} className="rounded-[22px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] bg-[#f8fafc]">
                      <Tag size={20} className="text-stone-400" />
                    </div>
                    <div>
                      <p className="font-mono text-base font-extrabold tracking-widest text-stone-900">{p.code}</p>
                      <p className="mt-0.5 text-xs text-stone-400">Diskon {p.discount}%</p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle}`}>
                    {statusLabel}
                  </span>
                </div>

                {editingId === p.id ? (
                  /* Edit form inline */
                  <div className="mt-3 space-y-2.5 rounded-[14px] bg-[#f8fafc] p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold text-stone-500">Diskon (%)</label>
                        <input type="number" min={1} max={100}
                          value={editForm.discount}
                          onChange={(e) => setEditForm((f) => ({ ...f, discount: e.target.value }))}
                          className="w-full rounded-[10px] border border-[#e8eaed] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563eb]" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold text-stone-500">Maks. Pakai</label>
                        <input type="number" min={1} placeholder="∞"
                          value={editForm.maxUses}
                          onChange={(e) => setEditForm((f) => ({ ...f, maxUses: e.target.value }))}
                          className="w-full rounded-[10px] border border-[#e8eaed] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563eb]" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold text-stone-500">Berlaku Sampai</label>
                      <input type="datetime-local"
                        value={editForm.expiresAt}
                        onChange={(e) => setEditForm((f) => ({ ...f, expiresAt: e.target.value }))}
                        className="w-full rounded-[10px] border border-[#e8eaed] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563eb]" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingId(null)}
                        className="flex-1 rounded-[10px] bg-stone-100 py-2 text-xs font-bold text-stone-600">
                        Batal
                      </button>
                      <button onClick={() => saveEdit(p)} disabled={editSaving}
                        className="flex flex-1 items-center justify-center gap-1 rounded-[10px] bg-[#2563eb] py-2 text-xs font-bold text-white disabled:opacity-60">
                        <Check size={12} /> {editSaving ? "Menyimpan..." : "Simpan"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-[12px] bg-[#f8fafc] p-2.5">
                      <p className="text-[10px] text-stone-400">Penggunaan</p>
                      <p className="mt-0.5 text-sm font-semibold text-stone-700">
                        {p.usedCount}{p.maxUses !== null ? `/${p.maxUses}` : ""}×
                      </p>
                    </div>
                    <div className="rounded-[12px] bg-[#f8fafc] p-2.5">
                      <p className="text-[10px] text-stone-400">Berlaku Sampai</p>
                      <p className="mt-0.5 text-sm font-semibold text-stone-700">
                        {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "Tidak terbatas"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <button onClick={() => toggleActive(p)} disabled={expired || habis}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-[12px] bg-[#f8fafc] py-2.5 text-xs font-bold text-stone-600 disabled:opacity-40">
                    {p.isActive ? <ToggleRight size={14} className="text-[#2563eb]" /> : <ToggleLeft size={14} />}
                    {p.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  {editingId !== p.id && (
                    <button onClick={() => startEdit(p)}
                      className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[12px] bg-[#eff6ff] text-[#2563eb]">
                      <Pencil size={14} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(p)}
                    className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[12px] bg-red-50 text-red-400">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

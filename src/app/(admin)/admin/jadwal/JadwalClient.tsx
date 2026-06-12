"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, CalendarDays, Clock, Link as LinkIcon, X, MapPin, Search, Users, Video } from "lucide-react";

type Schedule = {
  id: string; title: string; description: string | null;
  scheduledAt: string; durationMin: number; meetingUrl: string | null;
  isPublished: boolean;
  groupId?: string | null;
  group?: { name: string } | null;
  classType: string;
  location: string | null;
};

type FormState = {
  title: string; description: string; scheduledAt: string;
  durationMin: string; meetingUrl: string; isPublished: boolean;
  groupId: string;
  classType: string;
  location: string;
};

const EMPTY_FORM: FormState = { title: "", description: "", scheduledAt: "", durationMin: "60", meetingUrl: "", isPublished: false, groupId: "", classType: "ONLINE", location: "" };

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isPast(iso: string) { return new Date(iso).getTime() < Date.now(); }

export default function JadwalClient({ initialSchedules, groups }: { initialSchedules: Schedule[]; groups: { id: string; name: string }[] }) {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm]           = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);

  // Filter States
  const [search, setSearch]                   = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter]       = useState<"ALL" | "UPCOMING" | "PAST" | "DRAFT">("ALL");

  function openNew() { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); window.dispatchEvent(new Event("admin-modal-open")); }
  function openEdit(s: Schedule) {
    setForm({
      title: s.title,
      description: s.description ?? "",
      scheduledAt: toLocalInput(s.scheduledAt),
      durationMin: String(s.durationMin),
      meetingUrl: s.meetingUrl ?? "",
      isPublished: s.isPublished,
      groupId: s.groupId ?? "",
      classType: s.classType || "ONLINE",
      location: s.location ?? "",
    });
    setEditingId(s.id); setShowForm(true); window.dispatchEvent(new Event("admin-modal-open"));
  }
  function closeForm() { setShowForm(false); setEditingId(null); window.dispatchEvent(new Event("admin-modal-close")); }

  async function handleSave() {
    if (!form.title.trim() || !form.scheduledAt) return;
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      durationMin: Number(form.durationMin) || 60,
      meetingUrl: form.classType === "ONLINE" ? form.meetingUrl : null,
      isPublished: form.isPublished,
      groupId: form.groupId || null,
      classType: form.classType,
      location: form.classType === "OFFLINE" ? form.location : null,
    };
    if (editingId) {
      const res = await fetch(`/api/admin/jadwal/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const updated = await res.json();
      setSchedules((prev) => prev.map((s) => s.id === editingId ? { ...updated, scheduledAt: updated.scheduledAt, createdAt: updated.createdAt, updatedAt: updated.updatedAt } : s));
    } else {
      const res = await fetch("/api/admin/jadwal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const created = await res.json();
      setSchedules((prev) => [...prev, created].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()));
    }
    setSaving(false); closeForm();
  }

  async function togglePublish(s: Schedule) {
    const res = await fetch(`/api/admin/jadwal/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublished: !s.isPublished }) });
    const updated = await res.json();
    setSchedules((prev) => prev.map((x) => x.id === s.id ? { ...x, isPublished: updated.isPublished } : x));
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus jadwal ini?")) return;
    setDeleting(id);
    await fetch(`/api/admin/jadwal/${id}`, { method: "DELETE" });
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    setDeleting(null);
  }

  // Filtering Logic
  const filteredSchedules = schedules.filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchGroup = !selectedGroupId || s.groupId === selectedGroupId;
    
    const past = isPast(s.scheduledAt);
    let matchStatus = true;
    if (statusFilter === "UPCOMING") {
      matchStatus = !past && s.isPublished;
    } else if (statusFilter === "PAST") {
      matchStatus = past;
    } else if (statusFilter === "DRAFT") {
      matchStatus = !s.isPublished && !past;
    }
    
    return matchSearch && matchGroup && matchStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[30px] font-extrabold text-stone-900 leading-tight">Jadwal Kelas</h1>
          <p className="mt-1 text-sm text-stone-400 font-medium">Kelola sesi live online & pertemuan offline siswa.</p>
        </div>
        <button onClick={openNew} className="flex h-12 items-center gap-2 rounded-xl bg-[#2563eb] px-5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all hover:bg-blue-600 active:scale-98">
          <Plus size={16} /> Tambah Jadwal
        </button>
      </div>

      {/* Stats Summary */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-[22px] bg-white p-4 shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-stone-100/60 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb]">
            <CalendarDays size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-base font-extrabold text-stone-900 leading-tight truncate">{schedules.length}</p>
            <p className="text-[10px] font-semibold text-stone-400 mt-0.5 uppercase tracking-wider truncate">Total Sesi</p>
          </div>
        </div>
        <div className="rounded-[22px] bg-white p-4 shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-stone-100/60 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Video size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-base font-extrabold text-stone-900 leading-tight truncate">{schedules.filter(s => s.classType === "ONLINE").length}</p>
            <p className="text-[10px] font-semibold text-stone-400 mt-0.5 uppercase tracking-wider truncate">Kelas Online</p>
          </div>
        </div>
        <div className="rounded-[22px] bg-white p-4 shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-stone-100/60 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <MapPin size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-base font-extrabold text-stone-900 leading-tight truncate">{schedules.filter(s => s.classType === "OFFLINE").length}</p>
            <p className="text-[10px] font-semibold text-stone-400 mt-0.5 uppercase tracking-wider truncate">Kelas Offline</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="flex-1 flex h-12 items-center gap-2.5 rounded-xl bg-white px-3.5 shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-stone-100/60">
            <Search size={16} className="text-stone-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul atau deskripsi..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
          </div>
          {/* Group Filter */}
          <div className="w-full sm:w-[220px] flex h-12 items-center gap-2.5 rounded-xl bg-white px-3.5 shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-stone-100/60">
            <Users size={16} className="text-stone-400 shrink-0" />
            <select
              value={selectedGroupId || ""}
              onChange={(e) => setSelectedGroupId(e.target.value || null)}
              className="flex-1 bg-transparent text-sm outline-none text-stone-700 bg-white"
            >
              <option value="">Semua Grup Belajar</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Status Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {([
            { id: "ALL", label: "Semua" },
            { id: "UPCOMING", label: "Mendatang" },
            { id: "PAST", label: "Selesai" },
            { id: "DRAFT", label: "Draft" },
          ] as const).map((t) => {
            const active = statusFilter === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setStatusFilter(t.id)}
                className={`whitespace-nowrap rounded-full px-4.5 py-2 text-xs font-bold transition-all ${
                  active
                    ? "bg-[#2563eb] text-white shadow-sm"
                    : "bg-white text-stone-500 hover:text-stone-700 border border-stone-100/60"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule List */}
      <div className="space-y-4">
        {filteredSchedules.length === 0 ? (
          <div className="rounded-[28px] bg-white py-12 px-6 text-center shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-stone-100/60">
            <CalendarDays size={40} className="mx-auto mb-3 text-stone-200" />
            <p className="text-sm font-semibold text-stone-400">Tidak ada jadwal ditemukan</p>
            <p className="mt-1 text-xs text-stone-300">Coba ubah kriteria pencarian atau filter Anda.</p>
          </div>
        ) : (
          filteredSchedules.map((s) => (
            <ScheduleCard key={s.id} s={s} onEdit={openEdit} onDelete={handleDelete} onToggle={togglePublish} deleting={deleting} />
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6 pt-10">
          <div className="w-full max-w-[768px] rounded-[30px] bg-white p-7 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-stone-100 overflow-y-auto max-h-[90vh]">
            <div className="mb-6 flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-stone-900">{editingId ? "Edit Jadwal Kelas" : "Tambah Jadwal Kelas"}</h2>
                <p className="text-xs text-stone-400 mt-0.5">Lengkapi informasi jadwal kelas online atau offline di bawah.</p>
              </div>
              <button onClick={closeForm} className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-all"><X size={18} /></button>
            </div>
            
            <div className="space-y-4">
              <FormField label="Judul Kelas *">
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Live: Kupas Tuntas Penalaran Matematika"
                  className="input-premium"
                />
              </FormField>
              
              <FormField label="Deskripsi">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  placeholder="Tuliskan topik pembahasan atau info penting lainnya..."
                  className="input-premium resize-none"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Tanggal & Jam Pertemuan *">
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                    className="input-premium"
                  />
                </FormField>
                <FormField label="Durasi Sesi (menit)">
                  <input
                    type="number"
                    min={15}
                    value={form.durationMin}
                    onChange={(e) => setForm((f) => ({ ...f, durationMin: e.target.value }))}
                    className="input-premium"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Tipe Pertemuan *">
                  <select
                    value={form.classType}
                    onChange={(e) => setForm((f) => ({ ...f, classType: e.target.value }))}
                    className="input-premium"
                  >
                    <option value="ONLINE">Online (Virtual)</option>
                    <option value="OFFLINE">Offline (Tatap Muka)</option>
                  </select>
                </FormField>
                <FormField label="Grup Belajar (Opsional)">
                  <select
                    value={form.groupId}
                    onChange={(e) => setForm((f) => ({ ...f, groupId: e.target.value }))}
                    className="input-premium"
                  >
                    <option value="">Publik / Sesi Privat</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Status Publikasi">
                  <select
                    value={form.isPublished ? "1" : "0"}
                    onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.value === "1" }))}
                    className="input-premium"
                  >
                    <option value="0">Draft</option>
                    <option value="1">Published</option>
                  </select>
                </FormField>
              </div>

              {form.classType === "ONLINE" ? (
                <FormField label="Link Video Meeting (Zoom / Google Meet) *">
                  <input
                    value={form.meetingUrl}
                    onChange={(e) => setForm((f) => ({ ...f, meetingUrl: e.target.value }))}
                    placeholder="https://zoom.us/j/... atau meet.google.com/..."
                    className="input-premium"
                  />
                </FormField>
              ) : (
                <FormField label="Lokasi Fisik / Tempat Pertemuan *">
                  <input
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Ruang Kelas A, Gedung Hub 3"
                    className="input-premium"
                  />
                </FormField>
              )}
            </div>

            <div className="mt-6 flex gap-3 border-t border-stone-100 pt-5">
              <button
                onClick={closeForm}
                className="flex-1 h-12 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.scheduledAt || (form.classType === "ONLINE" && !form.meetingUrl) || (form.classType === "OFFLINE" && !form.location)}
                className="flex-1 flex h-12 items-center justify-center rounded-xl bg-[#2563eb] text-sm font-bold text-white shadow-[0_6px_20px_rgba(37,99,235,0.25)] hover:bg-blue-600 disabled:opacity-60 transition-all"
              >
                {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Buat Jadwal"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .input-premium {
          width: 100%;
          border-radius: 12px;
          border: 2px solid #edf1f5;
          background: #fdfdfd;
          padding: 11px 14px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }
        .input-premium:focus {
          border-color: #2563eb;
          background: #ffffff;
        }
      `}</style>
    </div>
  );
}

function ScheduleCard({ s, onEdit, onDelete, onToggle, deleting }: { s: Schedule; onEdit: (s: Schedule) => void; onDelete: (id: string) => void; onToggle: (s: Schedule) => void; deleting: string | null }) {
  const past = isPast(s.scheduledAt);
  const start = new Date(s.scheduledAt);
  const end = new Date(start.getTime() + s.durationMin * 60000);

  return (
    <div className={`rounded-[24px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-stone-100/60 transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:-translate-y-0.5`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {/* Class Type Badge */}
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
              s.classType === "OFFLINE" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-blue-50 text-[#2563eb] border border-blue-100"
            }`}>
              {s.classType === "OFFLINE" ? <MapPin size={10} /> : <Video size={10} />}
              {s.classType === "OFFLINE" ? "Offline" : "Online"}
            </span>

            {/* Group Badge */}
            {s.group && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                Grup: {s.group.name}
              </span>
            )}

            {/* Status Publish Badge */}
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${
              past
                ? "bg-stone-50 text-stone-400 border border-stone-100"
                : s.isPublished
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-red-50 text-red-600 border border-red-100"
            }`}>
              {past ? "Selesai" : s.isPublished ? "Published" : "Draft"}
            </span>
          </div>

          <h3 className="text-[17px] font-bold text-stone-900 leading-snug">{s.title}</h3>
          {s.description && (
            <p className="mt-1 text-sm text-stone-500 leading-relaxed line-clamp-2">{s.description}</p>
          )}

          {/* Time & Place Details */}
          <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} className="text-stone-300" />
              {start.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-stone-300" />
              {start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - {end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} ({s.durationMin} mnt)
            </span>
            {s.classType === "OFFLINE" && s.location && (
              <span className="flex items-center gap-1.5 text-stone-500">
                <MapPin size={13} className="text-stone-300" />
                {s.location}
              </span>
            )}
            {s.classType === "ONLINE" && s.meetingUrl && (
              <span className="flex items-center gap-1.5 text-[#2563eb]">
                <LinkIcon size={13} className="text-blue-300" />
                <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Link Meeting</a>
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex sm:flex-col items-center gap-1.5 shrink-0 justify-end">
          {!past && (
            <button
              onClick={() => onToggle(s)}
              title={s.isPublished ? "Sembunyikan (Ubah ke Draft)" : "Terbitkan (Publish)"}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                s.isPublished ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              }`}
            >
              {s.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          )}
          <button
            onClick={() => onEdit(s)}
            title="Edit Jadwal"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(s.id)}
            disabled={deleting === s.id}
            title="Hapus Jadwal"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-stone-500">{label}</label>
      {children}
    </div>
  );
}

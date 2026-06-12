"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Users, Trash2, X, Pencil, Check, UserPlus, UserMinus, Search, Network } from "lucide-react";

interface UserCompact {
  id: string;
  name: string;
  email: string;
}

interface Group {
  id: string;
  name: string;
  type: "GROUP" | "SEMIPRIVAT";
  maxStudents: number;
  tutorId: string | null;
  tutor: UserCompact | null;
  students: UserCompact[];
  createdAt: string;
}

export default function AdminGrupPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [tutors, setTutors] = useState<UserCompact[]>([]);
  const [allStudents, setAllStudents] = useState<UserCompact[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "GROUP" as "GROUP" | "SEMIPRIVAT",
    maxStudents: "5",
    tutorId: "",
    studentIds: [] as string[],
  });
  const [studentSearch, setStudentSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "GROUP" as "GROUP" | "SEMIPRIVAT",
    maxStudents: "5",
    tutorId: "",
    studentIds: [] as string[],
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editStudentSearch, setEditStudentSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/grup");
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
        setTutors(data.tutors || []);
        setAllStudents(data.students || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTypeChange = (type: "GROUP" | "SEMIPRIVAT", isEdit = false) => {
    if (isEdit) {
      setEditForm((f) => ({
        ...f,
        type,
        maxStudents: type === "SEMIPRIVAT" ? "2" : "5",
      }));
    } else {
      setForm((f) => ({
        ...f,
        type,
        maxStudents: type === "SEMIPRIVAT" ? "2" : "5",
      }));
    }
  };

  const handleToggleStudent = (studentId: string, isEdit = false) => {
    if (isEdit) {
      setEditForm((f) => {
        const exists = f.studentIds.includes(studentId);
        const updated = exists
          ? f.studentIds.filter((id) => id !== studentId)
          : [...f.studentIds, studentId];
        return { ...f, studentIds: updated };
      });
    } else {
      setForm((f) => {
        const exists = f.studentIds.includes(studentId);
        const updated = exists
          ? f.studentIds.filter((id) => id !== studentId)
          : [...f.studentIds, studentId];
        return { ...f, studentIds: updated };
      });
    }
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/grup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          maxStudents: Number(form.maxStudents),
          tutorId: form.tutorId || undefined,
          studentIds: form.studentIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal membuat grup.");
        setSaving(false);
        return;
      }

      setForm({
        name: "",
        type: "GROUP",
        maxStudents: "5",
        tutorId: "",
        studentIds: [],
      });
      setStudentSearch("");
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(g: Group) {
    setEditingId(g.id);
    setEditForm({
      name: g.name,
      type: g.type,
      maxStudents: String(g.maxStudents),
      tutorId: g.tutorId || "",
      studentIds: g.students.map((s) => s.id),
    });
    setEditStudentSearch("");
  }

  async function saveEdit(id: string) {
    setEditSaving(true);
    try {
      await fetch(`/api/admin/grup/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          type: editForm.type,
          maxStudents: Number(editForm.maxStudents),
          tutorId: editForm.tutorId || null,
          studentIds: editForm.studentIds,
        }),
      });
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(g: Group) {
    if (!confirm(`Hapus grup "${g.name}"? Siswa di dalamnya tidak akan terhapus dari sistem.`)) return;
    try {
      await fetch(`/api/admin/grup/${g.id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  // Filtered lists of students for dropdowns
  const filteredStudents = allStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredEditStudents = allStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(editStudentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(editStudentSearch.toLowerCase())
  );

  const totalGroups = groups.length;
  const semiprivatCount = groups.filter((g) => g.type === "SEMIPRIVAT").length;
  const groupCount = groups.filter((g) => g.type === "GROUP").length;
  const totalStudentsInGroups = groups.reduce((acc, g) => acc + g.students.length, 0);

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[28px] font-extrabold text-stone-900 tracking-tight">Grup Belajar</h1>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setError("");
          }}
          className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[#2563eb] text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:bg-[#1d4ed8] transition-colors"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-4 gap-2.5">
        {[
          { label: "Total Grup", value: totalGroups },
          { label: "Kelas Group", value: groupCount },
          { label: "Semiprivat", value: semiprivatCount },
          { label: "Siswa Aktif", value: totalStudentsInGroups },
        ].map((s) => (
          <div key={s.label} className="rounded-[18px] bg-white p-3 text-center shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-stone-100">
            <p className="text-lg font-extrabold text-[#2563eb]">{s.value}</p>
            <p className="mt-0.5 text-[9px] font-medium text-stone-400 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="mb-5 rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-stone-100">
          <h3 className="mb-4 text-base font-bold text-stone-900">Buat Grup Belajar Baru</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Nama Grup Belajar *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                placeholder="Contoh: Grup A UTBK Matematika"
                className="w-full rounded-[12px] border border-stone-100 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-stone-500">Tipe Kelas *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["GROUP", "SEMIPRIVAT"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeChange(t)}
                      className={`rounded-[12px] py-2.5 text-xs font-bold transition-all ${
                        form.type === t
                          ? "bg-[#2563eb] text-white shadow-sm"
                          : "bg-[#f8fafc] text-stone-500 border border-stone-50 hover:bg-stone-100"
                      }`}
                    >
                      {t === "GROUP" ? "Group" : "Semiprivat"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-stone-500">Kapasitas Maksimal *</label>
                <input
                  type="number"
                  min={1}
                  value={form.maxStudents}
                  onChange={(e) => setForm((f) => ({ ...f, maxStudents: e.target.value }))}
                  required
                  className="w-full rounded-[12px] border border-stone-100 bg-[#f8fafc] px-4 py-2.5 text-sm outline-none focus:border-[#2563eb]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Tutor / Pengajar</label>
              <select
                value={form.tutorId}
                onChange={(e) => setForm((f) => ({ ...f, tutorId: e.target.value }))}
                className="w-full rounded-[12px] border border-stone-100 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]"
              >
                <option value="">-- Tanpa Tutor (Bisa diisi nanti) --</option>
                {tutors.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Students roster selection */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">
                Pilih Anggota Siswa ({form.studentIds.length} terpilih)
              </label>
              <div className="relative mb-2 flex h-10 items-center gap-2 rounded-[10px] bg-[#f8fafc] px-3 border border-stone-50">
                <Search size={14} className="text-stone-300" />
                <input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Cari siswa..."
                  className="flex-1 bg-transparent text-xs outline-none"
                />
              </div>
              <div className="max-h-[160px] overflow-y-auto rounded-[12px] border border-stone-100 bg-white p-2 space-y-1">
                {filteredStudents.length === 0 ? (
                  <p className="p-2 text-center text-xs text-stone-400">Tidak ada siswa ditemukan</p>
                ) : (
                  filteredStudents.map((s) => {
                    const isSelected = form.studentIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleToggleStudent(s.id)}
                        className={`flex w-full items-center justify-between rounded-[8px] p-2 text-left transition-colors ${
                          isSelected ? "bg-[#eff6ff] text-[#2563eb]" : "hover:bg-[#f8fafc] text-stone-600"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">{s.name}</p>
                          <p className="text-[10px] opacity-75">{s.email}</p>
                        </div>
                        {isSelected ? <UserMinus size={14} /> : <UserPlus size={14} className="text-stone-400" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {error && <p className="rounded-[12px] bg-red-50 p-3 text-center text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="h-[46px] w-full rounded-[14px] bg-[#2563eb] text-sm font-bold text-white shadow-md disabled:opacity-60 hover:bg-[#1d4ed8]"
            >
              {saving ? "Menyimpan..." : "Buat Grup"}
            </button>
          </form>
        </div>
      )}

      {/* Group List */}
      {groups.length === 0 ? (
        <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-stone-100">
          <Network size={32} className="mx-auto mb-3 text-stone-200" />
          <p className="text-sm text-stone-400">Belum ada grup belajar bimbingan. Klik + untuk membuat.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => {
            const isFull = g.students.length >= g.maxStudents;
            const badgeStyle =
              g.type === "SEMIPRIVAT" ? "bg-purple-50 text-purple-600 border border-purple-100" : "bg-[#eff6ff] text-[#2563eb] border border-blue-50";

            return (
              <div
                key={g.id}
                className="rounded-[22px] bg-white p-5 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-stone-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] bg-[#f8fafc] border border-stone-50">
                      <Users size={20} className="text-stone-400" />
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-stone-900 tracking-tight">{g.name}</p>
                      <p className="mt-0.5 text-xs text-stone-400">
                        Tutor: <span className="font-semibold text-stone-700">{g.tutor ? g.tutor.name : "Belum ditentukan"}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${badgeStyle}`}>
                    {g.type === "SEMIPRIVAT" ? "Semiprivat" : "Group"}
                  </span>
                </div>

                {editingId === g.id ? (
                  /* Edit Form Inline */
                  <div className="mt-4 space-y-3.5 rounded-[16px] bg-[#f8fafc] p-4 border border-stone-100">
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold text-stone-500">Nama Grup</label>
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full rounded-[10px] border border-stone-100 bg-white px-3 py-2 text-xs outline-none focus:border-[#2563eb]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold text-stone-500">Tipe</label>
                        <select
                          value={editForm.type}
                          onChange={(e) => handleTypeChange(e.target.value as any, true)}
                          className="w-full rounded-[10px] border border-stone-100 bg-white px-2.5 py-2 text-xs outline-none focus:border-[#2563eb]"
                        >
                          <option value="GROUP">Group</option>
                          <option value="SEMIPRIVAT">Semiprivat</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold text-stone-500">Kapasitas</label>
                        <input
                          type="number"
                          value={editForm.maxStudents}
                          onChange={(e) => setEditForm((f) => ({ ...f, maxStudents: e.target.value }))}
                          className="w-full rounded-[10px] border border-stone-100 bg-white px-3 py-2 text-xs outline-none focus:border-[#2563eb]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold text-stone-500">Tutor</label>
                      <select
                        value={editForm.tutorId}
                        onChange={(e) => setEditForm((f) => ({ ...f, tutorId: e.target.value }))}
                        className="w-full rounded-[10px] border border-stone-100 bg-white px-2.5 py-2 text-xs outline-none focus:border-[#2563eb]"
                      >
                        <option value="">-- Tanpa Tutor --</option>
                        {tutors.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Edit student roster list */}
                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold text-stone-500">
                        Daftar Anggota ({editForm.studentIds.length} Terpilih)
                      </label>
                      <div className="relative mb-2 flex h-8 items-center gap-1.5 rounded-[8px] bg-white px-2.5 border border-stone-100">
                        <Search size={12} className="text-stone-300" />
                        <input
                          value={editStudentSearch}
                          onChange={(e) => setEditStudentSearch(e.target.value)}
                          placeholder="Cari siswa..."
                          className="flex-1 bg-transparent text-[10px] outline-none"
                        />
                      </div>
                      <div className="max-h-[120px] overflow-y-auto rounded-[10px] border border-stone-100 bg-white p-2 space-y-1">
                        {filteredEditStudents.map((s) => {
                          const isSelected = editForm.studentIds.includes(s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleToggleStudent(s.id, true)}
                              className={`flex w-full items-center justify-between rounded-[6px] p-1.5 text-left transition-colors ${
                                isSelected ? "bg-[#eff6ff] text-[#2563eb]" : "hover:bg-[#f8fafc] text-stone-600"
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold truncate">{s.name}</p>
                              </div>
                              {isSelected ? <UserMinus size={12} /> : <UserPlus size={12} className="text-stone-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 rounded-[10px] bg-stone-100 py-2 text-xs font-bold text-stone-600 hover:bg-stone-200 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => saveEdit(g.id)}
                        disabled={editSaving}
                        className="flex flex-1 items-center justify-center gap-1 rounded-[10px] bg-[#2563eb] py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1d4ed8] disabled:opacity-60"
                      >
                        <Check size={12} /> {editSaving ? "Menyimpan..." : "Simpan"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <div className="rounded-[14px] bg-[#f8fafc] p-3 border border-stone-50">
                        <p className="text-[10px] font-semibold text-stone-400">Anggota Siswa</p>
                        <p className="mt-0.5 text-sm font-extrabold text-stone-700">
                          {g.students.length} / {g.maxStudents} Siswa
                        </p>
                      </div>
                      <div className="rounded-[14px] bg-[#f8fafc] p-3 border border-stone-50 flex flex-col justify-center">
                        <p className="text-[10px] font-semibold text-stone-400">Status Kapasitas</p>
                        <span
                          className={`mt-0.5 inline-block text-xs font-bold ${
                            isFull ? "text-red-500" : "text-[#2563eb]"
                          }`}
                        >
                          {isFull ? "Penuh" : "Tersedia Slot"}
                        </span>
                      </div>
                    </div>

                    {/* Enrolled Students Roster (Avatar initials pill) */}
                    {g.students.length > 0 && (
                      <div className="mt-4">
                        <p className="text-[10px] font-semibold text-stone-400 mb-2">Siswa Terdaftar:</p>
                        <div className="flex flex-wrap gap-2">
                          {g.students.map((s) => (
                            <div
                              key={s.id}
                              title={`${s.name} (${s.email})`}
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#f8fafc] border border-stone-50 px-2.5 py-1 text-[10px] font-semibold text-stone-600 shadow-sm"
                            >
                              <div className="h-4 w-4 rounded-full bg-[#eff6ff] text-[#2563eb] flex items-center justify-center text-[8px] font-extrabold">
                                {s.name.charAt(0).toUpperCase()}
                              </div>
                              <span>{s.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2 pt-2 border-t border-stone-50">
                      <button
                        onClick={() => startEdit(g)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-[12px] bg-[#f8fafc] hover:bg-stone-50 py-2.5 text-xs font-bold text-stone-600 border border-stone-100"
                      >
                        <Pencil size={12} className="text-[#2563eb]" />
                        Edit Roster & Detail
                      </button>
                      <button
                        onClick={() => handleDelete(g)}
                        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[12px] bg-red-50 hover:bg-red-100 text-red-400 border border-red-100 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

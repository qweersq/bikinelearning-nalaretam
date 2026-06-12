"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

type Setting = {
  autoGenerateCert: boolean; minCourseCompletion: number; minQuizScore: number;
  certPrefix: string; certFormat: string; verificationUrl: string;
  publicVerification: boolean; certDateFormat: string;
};

export default function SertifikatClient({ setting }: { setting: Setting }) {
  const [form, setForm] = useState({ ...setting });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key: string, value: unknown) { setForm((f) => ({ ...f, [key]: value })); setSaved(false); }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Link href="/admin/settings">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <ArrowLeft size={18} className="text-stone-600" />
          </div>
        </Link>
        <h1 className="text-[22px] font-extrabold text-stone-900">Pengaturan Sertifikat</h1>
      </div>

      <div className="space-y-4">
        {/* Auto Generate */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-stone-900">Auto Generate Certificate</p>
              <p className="mt-0.5 text-xs text-stone-400">Otomatis terbitkan sertifikat saat siswa lulus</p>
            </div>
            <Toggle value={form.autoGenerateCert} onChange={(v) => set("autoGenerateCert", v)} />
          </div>
        </div>

        {/* Requirements */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Persyaratan Kelulusan</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Min. Penyelesaian Kursus (%)</label>
              <input type="number" min={0} max={100} value={form.minCourseCompletion}
                onChange={(e) => set("minCourseCompletion", Number(e.target.value))}
                className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Min. Skor Quiz (%)</label>
              <input type="number" min={0} max={100} value={form.minQuizScore}
                onChange={(e) => set("minQuizScore", Number(e.target.value))}
                className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]" />
            </div>
          </div>
        </div>

        {/* Certificate Format */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Format Sertifikat</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Prefix Nomor Sertifikat</label>
              <input value={form.certPrefix} onChange={(e) => set("certPrefix", e.target.value)}
                className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Format Nomor</label>
              <input value={form.certFormat} onChange={(e) => set("certFormat", e.target.value)}
                placeholder="CERT-YYYY-0001"
                className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]" />
              <p className="mt-1 text-[11px] text-stone-400">Gunakan YYYY untuk tahun, 0001 untuk nomor urut</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Format Tanggal</label>
              <input value={form.certDateFormat} onChange={(e) => set("certDateFormat", e.target.value)}
                placeholder="DD MMMM YYYY"
                className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]" />
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Verifikasi Sertifikat</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">URL Verifikasi</label>
              <input value={form.verificationUrl} onChange={(e) => set("verificationUrl", e.target.value)}
                placeholder="https://nalaretam.com/verify"
                className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-800">Verifikasi Publik</p>
                <p className="mt-0.5 text-xs text-stone-400">Siapapun bisa verifikasi sertifikat</p>
              </div>
              <Toggle value={form.publicVerification} onChange={(v) => set("publicVerification", v)} />
            </div>
          </div>
        </div>

        {saved && <p className="rounded-[12px] bg-[#eff6ff] p-3 text-center text-sm font-semibold text-[#2563eb]">Perubahan berhasil disimpan!</p>}

        <button onClick={handleSave} disabled={saving}
          className="flex h-[56px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#2563eb] text-sm font-bold text-white disabled:opacity-60">
          <Save size={16} />
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`relative h-7 w-12 rounded-full transition-colors ${value ? "bg-[#2563eb]" : "bg-stone-200"}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

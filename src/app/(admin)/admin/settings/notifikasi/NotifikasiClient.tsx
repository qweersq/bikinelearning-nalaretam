"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

type Setting = {
  notifEnrollment: boolean; notifCompletion: boolean; notifQuizResult: boolean;
  notifCertIssued: boolean; notifCertDownload: boolean;
  notifPaymentSuccess: boolean; notifPaymentFailed: boolean; notifPaymentReminder: boolean;
  notifAdminNewStudent: boolean; notifAdminNewPayment: boolean; notifAdminCertGen: boolean;
  notifChannel: string;
};

export default function NotifikasiClient({ setting }: { setting: Setting }) {
  const [form, setForm] = useState({ ...setting });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(key: string) { setForm((f) => ({ ...f, [key]: !f[key as keyof typeof f] })); setSaved(false); }

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

  const studentNotifs = [
    { key: "notifEnrollment",   label: "Pendaftaran Kursus",  sub: "Notifikasi saat siswa mendaftar kursus" },
    { key: "notifCompletion",   label: "Kursus Selesai",      sub: "Notifikasi saat siswa menyelesaikan kursus" },
    { key: "notifQuizResult",   label: "Hasil Quiz",          sub: "Notifikasi saat siswa menyelesaikan quiz" },
    { key: "notifCertIssued",   label: "Sertifikat Diterbitkan", sub: "Notifikasi saat sertifikat diterbitkan" },
    { key: "notifCertDownload", label: "Download Sertifikat", sub: "Notifikasi saat siswa download sertifikat" },
  ];

  const paymentNotifs = [
    { key: "notifPaymentSuccess",  label: "Pembayaran Berhasil",  sub: "Notifikasi saat pembayaran sukses" },
    { key: "notifPaymentFailed",   label: "Pembayaran Gagal",     sub: "Notifikasi saat pembayaran gagal" },
    { key: "notifPaymentReminder", label: "Pengingat Pembayaran", sub: "Pengingat untuk pembayaran pending" },
  ];

  const adminNotifs = [
    { key: "notifAdminNewStudent", label: "Siswa Baru",         sub: "Notifikasi ke admin saat ada siswa baru" },
    { key: "notifAdminNewPayment", label: "Pembayaran Masuk",   sub: "Notifikasi ke admin saat ada pembayaran" },
    { key: "notifAdminCertGen",    label: "Sertifikat Terbit",  sub: "Notifikasi ke admin saat sertifikat terbit" },
  ];

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Link href="/admin/settings">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <ArrowLeft size={18} className="text-stone-600" />
          </div>
        </Link>
        <h1 className="text-[22px] font-extrabold text-stone-900">Notification Settings</h1>
      </div>

      <div className="space-y-4">
        {/* Channel */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Saluran Notifikasi</h3>
          <div className="flex flex-wrap gap-2">
            {["Email", "In-App", "Email + In-App"].map((c) => (
              <button key={c} type="button" onClick={() => { setForm((f) => ({ ...f, notifChannel: c })); setSaved(false); }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${form.notifChannel === c ? "bg-[#2563eb] text-white" : "bg-[#f8fafc] text-stone-500"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Student Notifications */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Notifikasi Siswa</h3>
          <div className="space-y-4">
            {studentNotifs.map((n) => (
              <NotifRow key={n.key} label={n.label} sub={n.sub} value={form[n.key as keyof typeof form] as boolean} onChange={() => toggle(n.key)} />
            ))}
          </div>
        </div>

        {/* Payment Notifications */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Notifikasi Pembayaran</h3>
          <div className="space-y-4">
            {paymentNotifs.map((n) => (
              <NotifRow key={n.key} label={n.label} sub={n.sub} value={form[n.key as keyof typeof form] as boolean} onChange={() => toggle(n.key)} />
            ))}
          </div>
        </div>

        {/* Admin Notifications */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Notifikasi Admin</h3>
          <div className="space-y-4">
            {adminNotifs.map((n) => (
              <NotifRow key={n.key} label={n.label} sub={n.sub} value={form[n.key as keyof typeof form] as boolean} onChange={() => toggle(n.key)} />
            ))}
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

function NotifRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1">
        <p className="text-sm font-semibold text-stone-800">{label}</p>
        <p className="mt-0.5 text-xs text-stone-400">{sub}</p>
      </div>
      <button type="button" onClick={onChange}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${value ? "bg-[#2563eb]" : "bg-stone-200"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

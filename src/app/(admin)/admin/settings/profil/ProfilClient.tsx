"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, AtSign, PlayCircle, Globe, Phone, Mail, Save, Tag } from "lucide-react";

const COUNTRY_CODES = [
  { code: "62", flag: "🇮🇩", label: "ID +62" },
  { code: "1",  flag: "🇺🇸", label: "US +1" },
  { code: "44", flag: "🇬🇧", label: "GB +44" },
  { code: "60", flag: "🇲🇾", label: "MY +60" },
  { code: "65", flag: "🇸🇬", label: "SG +65" },
  { code: "61", flag: "🇦🇺", label: "AU +61" },
];

const PRESET_CODES = COUNTRY_CODES.map((c) => c.code);

function parsePhone(full: string): { code: string; number: string; custom: boolean } {
  const digits = full.replace(/\D/g, "");
  for (const c of COUNTRY_CODES) {
    if (digits.startsWith(c.code)) return { code: c.code, number: digits.slice(c.code.length), custom: false };
  }
  return { code: "62", number: digits.replace(/^0/, ""), custom: false };
}

type Setting = {
  academyName: string; tagline: string; about: string | null;
  email: string; phone: string | null; website: string | null;
  instagram: string | null; tiktok: string | null; youtube: string | null;
  coursePrice: number; originalPrice: number;
};

export default function ProfilClient({ setting }: { setting: Setting }) {
  const parsedPhone = parsePhone(setting.phone ?? "");
  const isCustomCode = !PRESET_CODES.includes(parsedPhone.code);
  const [form, setForm] = useState({
    academyName: setting.academyName,
    tagline: setting.tagline,
    about: setting.about ?? "",
    email: setting.email,
    phoneCode: isCustomCode ? "custom" : parsedPhone.code,
    phoneCustomCode: isCustomCode ? parsedPhone.code : "",
    phoneNumber: parsedPhone.number,
    website: setting.website ?? "",
    instagram: setting.instagram ?? "",
    tiktok: setting.tiktok ?? "",
    youtube: setting.youtube ?? "",
    coursePrice: String(setting.coursePrice),
    originalPrice: String(setting.originalPrice),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key: string, value: string) { setForm((f) => ({ ...f, [key]: value })); setSaved(false); }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        academyName: form.academyName,
        tagline: form.tagline,
        about: form.about || null,
        email: form.email,
        phone: form.phoneNumber ? `${form.phoneCode === "custom" ? form.phoneCustomCode : form.phoneCode}${form.phoneNumber}` : null,
        website: form.website || null,
        instagram: form.instagram || null,
        tiktok: form.tiktok || null,
        youtube: form.youtube || null,
        coursePrice: Number(form.coursePrice) || 0,
        originalPrice: Number(form.originalPrice) || 0,
      }),
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
        <h1 className="text-[22px] font-extrabold text-stone-900">Academy Profile</h1>
      </div>

      <div className="space-y-4">
        {/* Identity */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Identitas Akademi</h3>
          <div className="space-y-3">
            <Field label="Nama Akademi" value={form.academyName} onChange={(v) => set("academyName", v)} />
            <Field label="Tagline" value={form.tagline} onChange={(v) => set("tagline", v)} />
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Tentang Akademi</label>
              <textarea value={form.about} onChange={(e) => set("about", e.target.value)} rows={4}
                placeholder="Deskripsi singkat tentang akademi..."
                className="w-full resize-none rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Kontak</h3>
          <div className="space-y-3">
            <IconField icon={<Mail size={16} className="text-stone-400" />} label="Email" value={form.email} onChange={(v) => set("email", v)} type="email" />
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Nomor Telepon / WhatsApp</label>
              <div className="flex items-center gap-2 rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-3 py-3">
                <Phone size={16} className="shrink-0 text-stone-400" />
                <select
                  value={form.phoneCode}
                  onChange={(e) => { setForm((f) => ({ ...f, phoneCode: e.target.value, phoneCustomCode: "" })); setSaved(false); }}
                  className="bg-transparent text-sm font-semibold text-stone-700 outline-none"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.label}</option>
                  ))}
                  <option value="custom">Kustom</option>
                </select>
                {form.phoneCode === "custom" && (
                  <input
                    type="text"
                    value={form.phoneCustomCode}
                    onChange={(e) => { setForm((f) => ({ ...f, phoneCustomCode: e.target.value.replace(/\D/g, "") })); setSaved(false); }}
                    placeholder="kode"
                    className="w-14 bg-transparent text-sm font-semibold text-stone-700 outline-none"
                  />
                )}
                <div className="h-4 w-px bg-stone-200" />
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => { setForm((f) => ({ ...f, phoneNumber: e.target.value.replace(/\D/g, "") })); setSaved(false); }}
                  placeholder="812345678"
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-stone-400">Nomor ini digunakan untuk tombol WhatsApp di halaman checkout.</p>
            </div>
            <IconField icon={<Globe size={16} className="text-stone-400" />} label="Website" value={form.website} onChange={(v) => set("website", v)} placeholder="https://..." />
          </div>
        </div>

        {/* Social */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Social Media</h3>
          <div className="space-y-3">
            <IconField icon={<AtSign size={16} className="text-stone-400" />} label="Instagram" value={form.instagram} onChange={(v) => set("instagram", v)} placeholder="@username" />
            <IconField icon={<AtSign size={16} className="text-stone-400" />} label="TikTok" value={form.tiktok} onChange={(v) => set("tiktok", v)} placeholder="@username" />
            <IconField icon={<PlayCircle size={16} className="text-stone-400" />} label="YouTube" value={form.youtube} onChange={(v) => set("youtube", v)} placeholder="Channel URL" />
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <div className="mb-4 flex items-center gap-2">
            <Tag size={16} className="text-[#2563eb]" />
            <h3 className="font-bold text-stone-900">Harga & Akses</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Harga Jual (Rp)</label>
              <input
                type="number"
                min={0}
                value={form.coursePrice}
                onChange={(e) => set("coursePrice", e.target.value)}
                className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]"
              />
              <p className="mt-1 text-[11px] text-stone-400">Harga aktual yang dibayar siswa. Masukkan 0 untuk akses gratis.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Harga Coret / Original (Rp)</label>
              <input
                type="number"
                min={0}
                value={form.originalPrice}
                onChange={(e) => set("originalPrice", e.target.value)}
                className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]"
              />
              <p className="mt-1 text-[11px] text-stone-400">Harga yang dicoret di halaman checkout (menunjukkan diskon).</p>
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

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-stone-500">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]" />
    </div>
  );
}

function IconField({ icon, label, value, onChange, placeholder, type = "text" }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-stone-500">{label}</label>
      <div className="flex items-center gap-3 rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">{icon}</span>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="flex-1 bg-transparent text-sm outline-none" />
      </div>
    </div>
  );
}

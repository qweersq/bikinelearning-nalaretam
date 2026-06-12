"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Eye, EyeOff, User, Mail, Lock } from "lucide-react";

type User = { id: string; name: string; email: string };

export default function AkunClient({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleSaveProfile() {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/akun", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setMessage({ text: data.message, ok: res.ok });
    setSaving(false);
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) { setMessage({ text: "Konfirmasi password tidak sesuai.", ok: false }); return; }
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/akun", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setMessage({ text: data.message, ok: res.ok });
    if (res.ok) { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
    setSaving(false);
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Link href="/admin/settings">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <ArrowLeft size={18} className="text-stone-600" />
          </div>
        </Link>
        <h1 className="text-[22px] font-extrabold text-stone-900">Account Settings</h1>
      </div>

      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center rounded-[24px] bg-white p-6 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-[#eff6ff] text-2xl font-extrabold text-[#2563eb]">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <p className="mt-3 font-bold text-stone-900">{user.name}</p>
          <p className="text-sm text-stone-400">{user.email}</p>
        </div>

        {/* Profile */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Profil Admin</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Nama</label>
              <div className="flex items-center gap-3 rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3">
                <User size={16} className="shrink-0 text-stone-400" />
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Email</label>
              <div className="flex items-center gap-3 rounded-[12px] border border-[#f1f3f5] bg-[#f4f6f8] px-4 py-3 opacity-60">
                <Mail size={16} className="shrink-0 text-stone-400" />
                <span className="flex-1 text-sm text-stone-500">{user.email}</span>
              </div>
              <p className="mt-1 text-[11px] text-stone-400">Email tidak bisa diubah</p>
            </div>
            <button onClick={handleSaveProfile} disabled={saving}
              className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#2563eb] text-sm font-bold text-white disabled:opacity-60">
              <Save size={15} />
              Simpan Profil
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Ganti Password</h3>
          <div className="space-y-3">
            <PasswordField label="Password Lama" value={currentPassword} onChange={setCurrentPassword} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />
            <PasswordField label="Password Baru" value={newPassword} onChange={setNewPassword} show={showNew} onToggle={() => setShowNew(!showNew)} />
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Konfirmasi Password Baru</label>
              <div className="flex items-center gap-3 rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3">
                <Lock size={16} className="shrink-0 text-stone-400" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru" className="flex-1 bg-transparent text-sm outline-none" />
              </div>
            </div>
            <button onClick={handleChangePassword} disabled={saving || !currentPassword || !newPassword}
              className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[12px] bg-stone-800 text-sm font-bold text-white disabled:opacity-40">
              <Lock size={15} />
              Ganti Password
            </button>
          </div>
        </div>

        {message && (
          <p className={`rounded-[12px] p-3 text-center text-sm font-semibold ${message.ok ? "bg-[#eff6ff] text-[#2563eb]" : "bg-red-50 text-red-500"}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle }: { label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-stone-500">{label}</label>
      <div className="flex items-center gap-3 rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3">
        <Lock size={16} className="shrink-0 text-stone-400" />
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••" className="flex-1 bg-transparent text-sm outline-none" />
        <button type="button" onClick={onToggle}>
          {show ? <EyeOff size={16} className="text-stone-400" /> : <Eye size={16} className="text-stone-400" />}
        </button>
      </div>
    </div>
  );
}

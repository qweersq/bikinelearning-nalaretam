"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, LogOut, Save } from "lucide-react";

interface ProfileData { id: string; name: string; email: string; createdAt: string; }

export default function ProfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.data) { setProfile(d.data); setName(d.data.name); }
    });
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const res = await fetch("/api/auth/update-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setMsg({ type: res.ok ? "success" : "error", text: data.message });
    setLoading(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setMsg({ type: "error", text: "Konfirmasi password tidak sesuai." }); return; }
    setLoading(true); setMsg(null);
    const res = await fetch("/api/auth/update-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setMsg({ type: res.ok ? "success" : "error", text: data.message });
    if (res.ok) { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
    setLoading(false);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const initials = name.slice(0, 2).toUpperCase() || "??";

  return (
    <div>
      <h1 className="mb-6 text-[28px] font-extrabold text-stone-900">Profil</h1>

      {/* Avatar card */}
      <div className="mb-4 flex items-center gap-4 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[18px] bg-[#eff6ff] text-xl font-extrabold text-[#2563eb]">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold text-stone-900">{name || "—"}</p>
          <p className="truncate text-sm text-stone-400">{profile?.email ?? "—"}</p>
        </div>
      </div>

      {/* Edit name */}
      <div className="mb-4 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <h3 className="mb-4 font-bold text-stone-900">Edit Profil</h3>
        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-500">Nama Lengkap</label>
            <div className="flex items-center gap-3 rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3">
              <User size={16} className="shrink-0 text-stone-400" />
              <input value={name} onChange={(e) => setName(e.target.value)} required
                className="flex-1 bg-transparent text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-500">Email</label>
            <div className="flex items-center gap-3 rounded-[12px] border border-[#f1f3f5] bg-[#f4f6f8] px-4 py-3 opacity-60">
              <Mail size={16} className="shrink-0 text-stone-400" />
              <span className="flex-1 text-sm text-stone-500">{profile?.email ?? "—"}</span>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#2563eb] text-sm font-bold text-white disabled:opacity-60">
            <Save size={15} /> Simpan Nama
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="mb-4 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <h3 className="mb-4 font-bold text-stone-900">Ganti Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <PasswordField label="Password Sekarang" value={currentPassword} onChange={setCurrentPassword} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />
          <PasswordField label="Password Baru" value={newPassword} onChange={setNewPassword} show={showNew} onToggle={() => setShowNew(!showNew)} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-500">Konfirmasi Password Baru</label>
            <div className="flex items-center gap-3 rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3">
              <Lock size={16} className="shrink-0 text-stone-400" />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru" className="flex-1 bg-transparent text-sm outline-none" />
            </div>
          </div>
          <button type="submit" disabled={loading || !currentPassword || !newPassword}
            className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[12px] bg-stone-800 text-sm font-bold text-white disabled:opacity-40">
            <Lock size={15} /> Ganti Password
          </button>
        </form>
      </div>

      {msg && (
        <div className={`mb-4 rounded-[12px] p-3 text-center text-sm font-semibold ${msg.type === "success" ? "bg-[#eff6ff] text-[#2563eb]" : "bg-red-50 text-red-500"}`}>
          {msg.text}
        </div>
      )}

      {/* Logout */}
      <button onClick={handleLogout}
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#f4f6f8] text-sm font-bold text-red-500">
        <LogOut size={16} /> Keluar
      </button>
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

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Logo from "@/components/ui/Logo";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "google_failed") setError("Login Google gagal, coba lagi.");
    if (err === "cancelled") setError("");
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      router.push(data.data.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch {
      setError("Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <div className="mx-auto min-h-screen max-w-[768px] px-5 py-5">

        <Link
          href="/"
          className="mb-6 flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white text-stone-400 shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-colors hover:text-stone-800"
        >
          <ArrowLeft size={18} />
        </Link>

        <div className="mb-2.5">
          <Logo size="lg" />
        </div>
        <p className="mb-7 leading-relaxed text-[#666]">
          Masuk ke akun kamu untuk melanjutkan perjalanan belajar.
        </p>

        <div className="rounded-[28px] bg-white p-6 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">

          {/* Google Login */}
          <a
            href="/api/auth/google"
            className="flex h-[54px] w-full items-center justify-center gap-3 rounded-[16px] border-2 border-[#edf1f5] bg-white text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-[#fafafa]"
          >
            <GoogleIcon />
            Lanjutkan dengan Google
          </a>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#edf1f5]" />
            <span className="text-xs text-stone-400">atau masuk dengan email</span>
            <div className="h-px flex-1 bg-[#edf1f5]" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-[18px]">
              <label className="mb-2 block text-sm font-semibold text-stone-800">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="kamu@email.com"
                className="h-14 w-full rounded-2xl border-2 border-[#edf1f5] px-4 text-sm outline-none transition-colors focus:border-[#2563eb]"
              />
            </div>

            <div className="mb-[18px]">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-stone-800">Password</label>
                <Link href="/lupa-password" className="text-xs font-semibold text-[#2563eb] hover:underline">
                  Lupa password?
                </Link>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Password kamu"
                className="h-14 w-full rounded-2xl border-2 border-[#edf1f5] px-4 text-sm outline-none transition-colors focus:border-[#2563eb]"
              />
            </div>

            {error && <div className="mb-4"><Alert message={error} /></div>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-[58px] w-full rounded-[18px] bg-[#2563eb] text-[15px] font-bold text-white transition-opacity disabled:opacity-60"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Memproses...</span>
                : "Masuk ke Akun"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#666]">
            Belum punya akun?{" "}
            <Link href="/register" className="font-bold text-[#2563eb]">Daftar sekarang</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

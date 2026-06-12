"use client";

import Link from "next/link";
import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/lupa-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message);
      setSent(true);
    } catch {
      setError("Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard tagline="Reset password kamu">
      {sent ? (
        <div className="py-4 text-center">
          <div className="mb-4 text-5xl">📬</div>
          <h2 className="mb-2 font-semibold text-zinc-900">Cek email kamu!</h2>
          <p className="text-sm leading-relaxed text-zinc-500">
            Link reset password sudah dikirim ke{" "}
            <span className="font-medium text-zinc-700">{email}</span>.
            Link berlaku selama 1 jam.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-sky-600 hover:underline"
          >
            ← Kembali ke halaman masuk
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-zinc-500">
            Masukkan email yang terdaftar. Kami akan kirimkan link untuk reset password kamu.
          </p>
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kamu@email.com"
          />

          {error && <Alert message={error} />}

          <Button type="submit" loading={loading} fullWidth>
            Kirim Link Reset
          </Button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-600">
              ← Kembali ke halaman masuk
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}

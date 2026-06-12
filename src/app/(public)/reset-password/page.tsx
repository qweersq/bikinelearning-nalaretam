"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) return setError("Password tidak cocok.");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message);
      router.push("/login?reset=success");
    } catch {
      setError("Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="py-4 text-center">
        <Alert type="error" message="Link tidak valid atau sudah kadaluarsa." />
        <Link href="/lupa-password" className="mt-4 inline-block text-sm font-medium text-sky-600 hover:underline">
          Minta link baru
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Password Baru"
        type="password"
        required
        minLength={8}
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        placeholder="Minimal 8 karakter"
      />
      <Input
        label="Konfirmasi Password"
        type="password"
        required
        value={form.confirm}
        onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        placeholder="Ulangi password baru"
      />

      {error && <Alert message={error} />}

      <Button type="submit" loading={loading} fullWidth>
        Simpan Password Baru
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCard tagline="Buat password baru">
      <Suspense fallback={<p className="text-center text-sm text-zinc-400">Memuat...</p>}>
        <ResetForm />
      </Suspense>
    </AuthCard>
  );
}

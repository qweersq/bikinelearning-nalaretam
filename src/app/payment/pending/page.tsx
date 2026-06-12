"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";

export default function PaymentPendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const [status, setStatus] = useState<"POLLING" | "SUCCESS" | "FAILED" | "EXPIRED">("POLLING");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);
  const MAX_ATTEMPTS = 20; // ~60 detik

  useEffect(() => {
    if (!reference) {
      router.replace("/dashboard");
      return;
    }

    async function checkStatus() {
      attemptsRef.current += 1;

      try {
        const res = await fetch(`/api/payment/status?reference=${reference}`);
        const data = await res.json();

        if (data.status === "SUCCESS") {
          setStatus("SUCCESS");
          clearInterval(intervalRef.current!);
          setTimeout(() => router.replace("/dashboard"), 2000);
          return;
        }

        if (data.status === "FAILED") {
          setStatus("FAILED");
          clearInterval(intervalRef.current!);
          return;
        }

        if (data.status === "EXPIRED") {
          setStatus("EXPIRED");
          clearInterval(intervalRef.current!);
          return;
        }
      } catch {
        // network error, keep polling
      }

      if (attemptsRef.current >= MAX_ATTEMPTS) {
        clearInterval(intervalRef.current!);
        // Timeout — redirect ke dashboard, bisa jadi sudah success lewat callback
        router.replace("/dashboard");
      }
    }

    // Cek langsung sekali, lalu setiap 3 detik
    checkStatus();
    intervalRef.current = setInterval(checkStatus, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reference, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc] px-5">
      <div className="w-full max-w-[360px] rounded-[28px] bg-white p-8 text-center shadow-[0_5px_30px_rgba(0,0,0,0.06)]">

        {status === "POLLING" && (
          <>
            <div className="mb-5 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eff6ff]">
                <Loader2 size={36} className="animate-spin text-[#2563eb]" />
              </div>
            </div>
            <h1 className="mb-2 text-xl font-extrabold text-stone-900">Menunggu Pembayaran</h1>
            <p className="text-sm leading-relaxed text-stone-400">
              Sedang memverifikasi pembayaranmu.<br />Harap tunggu sebentar...
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 rounded-[14px] bg-[#f6f8fc] px-4 py-3">
              <Clock size={14} className="text-stone-400" />
              <p className="text-xs text-stone-400">Proses ini biasanya kurang dari 1 menit</p>
            </div>
          </>
        )}

        {status === "SUCCESS" && (
          <>
            <div className="mb-5 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eff6ff]">
                <CheckCircle2 size={36} className="text-[#2563eb]" />
              </div>
            </div>
            <h1 className="mb-2 text-xl font-extrabold text-stone-900">Pembayaran Berhasil!</h1>
            <p className="text-sm text-stone-400">
              Selamat! Akses kamu sudah aktif.<br />Mengarahkan ke dashboard...
            </p>
          </>
        )}

        {status === "FAILED" && (
          <>
            <div className="mb-5 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <XCircle size={36} className="text-red-500" />
              </div>
            </div>
            <h1 className="mb-2 text-xl font-extrabold text-stone-900">Pembayaran Gagal</h1>
            <p className="mb-5 text-sm text-stone-400">
              Transaksi tidak berhasil diproses.
            </p>
            <button
              onClick={() => router.replace("/checkout")}
              className="h-[48px] w-full rounded-[14px] bg-[#2563eb] text-sm font-bold text-white"
            >
              Coba Lagi
            </button>
          </>
        )}

        {status === "EXPIRED" && (
          <>
            <div className="mb-5 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
                <Clock size={36} className="text-amber-500" />
              </div>
            </div>
            <h1 className="mb-2 text-xl font-extrabold text-stone-900">Transaksi Kadaluarsa</h1>
            <p className="mb-5 text-sm text-stone-400">
              Waktu pembayaran habis. Silakan buat transaksi baru.
            </p>
            <button
              onClick={() => router.replace("/checkout")}
              className="h-[48px] w-full rounded-[14px] bg-[#2563eb] text-sm font-bold text-white"
            >
              Checkout Ulang
            </button>
          </>
        )}

      </div>
    </div>
  );
}

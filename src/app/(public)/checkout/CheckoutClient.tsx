"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Smartphone, Shield, Infinity, GraduationCap,
  Brain, Compass, Calculator, BookOpen, CheckCircle2, Rocket,
  ExternalLink, Loader2, Clock,
} from "lucide-react";
import Alert from "@/components/ui/Alert";

interface PromoResult {
  code: string;
  discount: number;
  discountAmount: number;
  finalPrice: number;
}

const included = [
  { icon: GraduationCap, text: "Certificate Completion" },
  { icon: Brain,         text: "Penalaran Matematika" },
  { icon: Calculator,    text: "Aljabar & Fungsi" },
  { icon: Compass,       text: "Geometri & Trigonometri" },
  { icon: BookOpen,      text: "Statistika & Peluang" },
  { icon: Infinity,      text: "Lifetime Access" },
];

const trust = [
  { icon: Shield,        text: "Pembayaran 100% Aman" },
  { icon: Infinity,      text: "Akses Selamanya" },
  { icon: GraduationCap, text: "Sertifikat Disertakan" },
];

export default function CheckoutClient({
  basePrice,
  displayOriginal,
  adminPhone,
  programId,
  programName,
  programDescription,
  programBadge,
}: {
  basePrice: number;
  displayOriginal: number;
  adminPhone: string;
  programId: string;
  programName: string;
  programDescription: string;
  programBadge: string;
}) {
  const [promoInput, setPromoInput]     = useState("");
  const [promo, setPromo]               = useState<PromoResult | null>(null);
  const [promoError, setPromoError]     = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  // Payment modal state
  const [tripayUrl, setTripayUrl]       = useState("");
  const [reference, setReference]       = useState("");
  const [showModal, setShowModal]       = useState(false);
  const [verifying, setVerifying]       = useState(false);
  const [verifyError, setVerifyError]   = useState("");
  const [verifyAttempts, setVerifyAttempts] = useState(0);

  const finalPrice = promo ? promo.finalPrice : basePrice;

  async function applyPromo() {
    if (!promoInput.trim()) return;
    setPromoError("");
    setPromo(null);
    setPromoLoading(true);
    const res = await fetch("/api/promo/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoInput, originalPrice: basePrice }),
    });
    const data = await res.json();
    if (res.ok) setPromo(data);
    else setPromoError(data.message);
    setPromoLoading(false);
  }

  async function handleCheckout() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode: promo?.code ?? null, programId }),
      });
      if (res.status === 401) { window.location.href = "/login"; return; }
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }

      const { checkout_url, reference: ref } = data.data;

      // Free / 0 price → langsung ke dashboard
      if (checkout_url === "/dashboard") {
        window.location.href = "/dashboard";
        return;
      }

      // Simpan reference, buka Tripay di tab baru, tampilkan modal
      setReference(ref ?? "");
      setTripayUrl(checkout_url);
      window.open(checkout_url, "_blank");
      setShowModal(true);
    } catch {
      setError("Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setVerifyError("");
    setVerifying(true);
    const attempt = verifyAttempts + 1;
    setVerifyAttempts(attempt);
    try {
      const res = await fetch(`/api/payment/status?reference=${reference}`);
      const data = await res.json();

      if (data.status === "SUCCESS") {
        window.location.href = "/dashboard";
        return;
      }

      if (data.status === "FAILED") {
        setVerifyError("Pembayaran gagal. Silakan coba lagi.");
        setShowModal(false);
        return;
      }

      if (data.status === "EXPIRED") {
        setVerifyError("Transaksi sudah kadaluarsa. Silakan checkout ulang.");
        setShowModal(false);
        return;
      }

      // Masih PENDING
      setVerifyError("Pembayaran belum terkonfirmasi. Pastikan kamu sudah menyelesaikan pembayaran, lalu coba lagi.");
    } catch {
      setVerifyError("Gagal mengecek status. Coba lagi.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <>
      <div className="min-h-screen bg-[#f6f8fc]">
        <div className="mx-auto max-w-[768px] px-5 pb-[120px] pt-5">

          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <Link
              href="/"
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] bg-white text-stone-400 shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-colors hover:text-stone-800"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-[28px] font-extrabold text-stone-900">Checkout</h1>
          </div>

          {/* Course Card */}
          <div className="rounded-[28px] bg-white p-6 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <span className="inline-block rounded-full bg-[#eff6ff] px-3.5 py-2 text-xs font-bold text-[#2563eb]">
              {programBadge}
            </span>
            <h2 className="mt-4 text-[28px] font-extrabold text-stone-900">{programName}</h2>
            <p className="mt-2.5 leading-relaxed text-[#666]">
              {programDescription}
            </p>
            {basePrice > 0 ? (
              <>
                <p className="mt-5 text-lg text-[#999] line-through">
                  Rp {displayOriginal.toLocaleString("id-ID")}
                </p>
                <p className="text-[42px] font-extrabold leading-tight text-[#2563eb]">
                  Rp {basePrice.toLocaleString("id-ID")}
                </p>
              </>
            ) : (
              <p className="mt-5 text-[42px] font-extrabold leading-tight text-[#2563eb]">Gratis</p>
            )}
          </div>

          {/* Promo Code */}
          <div className="mt-[18px] rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <p className="mb-4 text-lg font-bold text-stone-900">Kode Promo</p>
            {promo ? (
              <div className="flex items-center justify-between rounded-[14px] border-2 border-[#2563eb] bg-[#eff6ff] px-4 py-3">
                <div>
                  <p className="font-bold text-[#2563eb]">{promo.code}</p>
                  <p className="text-xs text-[#2563eb]">Hemat {promo.discount}% — Rp {promo.discountAmount.toLocaleString("id-ID")}</p>
                </div>
                <button
                  onClick={() => { setPromo(null); setPromoInput(""); setPromoError(""); }}
                  className="text-xs font-semibold text-stone-400 hover:text-red-500 transition-colors"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                  placeholder="Masukkan kode promo"
                  className="h-[52px] flex-1 rounded-[14px] border-2 border-[#edf1f5] px-4 text-sm uppercase tracking-widest outline-none transition-colors focus:border-[#2563eb] placeholder:normal-case placeholder:tracking-normal"
                />
                <button
                  onClick={applyPromo}
                  disabled={promoLoading}
                  className="h-[52px] w-[90px] shrink-0 rounded-[14px] bg-[#2563eb] text-sm font-bold text-white transition-opacity disabled:opacity-60"
                >
                  {promoLoading ? "..." : "Terapkan"}
                </button>
              </div>
            )}
            {promoError && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500">
                <CheckCircle2 size={12} className="shrink-0" /> {promoError}
              </p>
            )}
          </div>

          {/* What's Included */}
          <div className="mt-[18px] rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <p className="mb-4 text-lg font-bold text-stone-900">Yang Termasuk</p>
            {included.map(({ icon: Icon, text }, i) => (
              <div
                key={text}
                className={`flex items-center gap-3 py-3.5 ${i < included.length - 1 ? "border-b border-[#edf1f5]" : ""}`}
              >
                <Icon size={18} className="shrink-0 text-[#2563eb]" />
                <span className="text-sm font-medium text-stone-700">{text}</span>
              </div>
            ))}
          </div>

          {/* Payment Method */}
          <div className="mt-[18px] rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <p className="mb-4 text-lg font-bold text-stone-900">Metode Pembayaran</p>
            <div className="flex items-center gap-4 rounded-[18px] border-2 border-[#2563eb] p-4">
              <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[14px] bg-[#f5f7fa]">
                <Smartphone size={24} className="text-stone-500" />
              </div>
              <div>
                <p className="font-bold text-stone-900">QRIS & E-Wallet</p>
                <p className="mt-1 text-xs text-[#777]">GoPay, OVO, Dana, Transfer Bank & semua e-wallet</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-[18px] rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <p className="mb-4 text-lg font-bold text-stone-900">Ringkasan Pesanan</p>
            <div className="mb-3 flex justify-between text-sm text-stone-600">
              <span>Harga Kursus</span>
              <span className={promo ? "line-through text-stone-400" : ""}>
                Rp {basePrice.toLocaleString("id-ID")}
              </span>
            </div>
            {promo && (
              <div className="mb-3 flex justify-between text-sm">
                <span className="text-[#2563eb]">Diskon ({promo.code})</span>
                <span className="font-semibold text-[#2563eb]">- Rp {promo.discountAmount.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[#edf1f5] pt-3 text-lg font-extrabold text-stone-900">
              <span>Total</span>
              <span>Rp {finalPrice.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* Why Join */}
          <div className="mt-[18px] rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <p className="mb-4 text-lg font-bold text-stone-900">Kenapa Bergabung?</p>
            <div className="flex flex-col gap-3">
              {trust.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm font-medium text-stone-700">
                  <Icon size={18} className="shrink-0 text-[#2563eb]" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {error && <div className="mt-4"><Alert message={error} /></div>}
          {verifyError && <div className="mt-4"><Alert message={verifyError} /></div>}
        </div>

        {/* Fixed Bottom CTA */}
        <div className="fixed bottom-5 left-1/2 w-[728px] max-w-[calc(100%-40px)] -translate-x-1/2">
          <div className="rounded-[24px] bg-white p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <button
              onClick={handleCheckout}
              disabled={loading || showModal}
              className="flex h-[58px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#2563eb] text-[15px] font-bold text-white transition-opacity disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Memproses...
                </span>
              ) : (
                <>
                  <Rocket size={17} />
                  {finalPrice === 0 ? "Aktifkan Akses Gratis" : `Bayar Rp ${finalPrice.toLocaleString("id-ID")}`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6">
          <div className="w-full max-w-[768px] rounded-[28px] bg-white p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.12)]">

            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eff6ff]">
                <Clock size={28} className="text-[#2563eb]" />
              </div>
            </div>

            <h2 className="mb-2 text-center text-lg font-extrabold text-stone-900">
              Selesaikan Pembayaran
            </h2>
            <p className="mb-5 text-center text-sm leading-relaxed text-stone-400">
              Halaman pembayaran sudah dibuka di tab baru. Selesaikan pembayaran di sana, lalu kembali ke sini dan klik tombol di bawah.
            </p>

            {/* Buka ulang link */}
            <a
              href={tripayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold text-[#2563eb]"
            >
              <ExternalLink size={13} />
              Buka halaman pembayaran lagi
            </a>

            {/* Verify error */}
            {verifyError && (
              <div className="mb-3 rounded-[14px] bg-amber-50 px-4 py-3">
                <p className="text-xs font-medium text-amber-700">{verifyError}</p>
                {adminPhone && (
                  <>
                    <p className="mt-2 text-xs text-stone-400">Ada kendala? Hubungi admin kami:</p>
                    <a
                      href={`https://wa.me/${adminPhone.replace(/[^0-9]/g, "").replace(/^0/, "62")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#25d366]"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Hubungi Admin via WhatsApp
                    </a>
                  </>
                )}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#2563eb] text-sm font-bold text-white disabled:opacity-60"
            >
              {verifying ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Mengecek pembayaran...
                </>
              ) : (
                "Saya Sudah Bayar ✓"
              )}
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="mt-3 w-full text-center text-xs text-stone-400"
            >
              Batalkan transaksi ini
            </button>
          </div>
        </div>
      )}
    </>
  );
}

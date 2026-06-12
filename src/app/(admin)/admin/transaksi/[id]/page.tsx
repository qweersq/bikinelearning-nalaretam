import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  SUCCESS: "from-[#2563eb] to-[#3b82f6]",
  PENDING: "from-orange-400 to-orange-500",
  FAILED:  "from-red-400 to-red-500",
  EXPIRED: "from-stone-400 to-stone-500",
};
const STATUS_LABELS: Record<string, string> = {
  SUCCESS: "PAID", PENDING: "PENDING", FAILED: "FAILED", EXPIRED: "EXPIRED",
};

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const t = await prisma.transaction.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, hasAccess: true } },
      course: { select: { title: true } },
    },
  });

  if (!t) notFound();

  const initials = t.user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  function formatDate(d: Date | null) {
    if (!d) return "—";
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link href="/admin/transaksi">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <ArrowLeft size={18} className="text-stone-600" />
          </div>
        </Link>
        <h1 className="text-[28px] font-extrabold text-stone-900">Transaksi</h1>
      </div>

      {/* Status Card */}
      <div className={`mb-5 rounded-[28px] bg-gradient-to-br ${STATUS_STYLES[t.status]} p-6 text-white`}>
        <span className="inline-block rounded-full bg-white/20 px-4 py-2 text-xs font-bold">
          {STATUS_LABELS[t.status]}
        </span>
        <p className="mt-4 text-[38px] font-extrabold leading-none">
          Rp {t.amount.toLocaleString("id-ID")}
        </p>
        <p className="mt-2 text-sm opacity-85">{t.orderId}</p>
      </div>

      {/* Student */}
      <div className="mb-4 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <h3 className="mb-4 text-lg font-bold text-stone-900">Siswa</h3>
        <div className="flex items-center gap-4">
          <div className="flex h-[55px] w-[55px] shrink-0 items-center justify-center rounded-[16px] bg-[#eff6ff] text-lg font-extrabold text-[#2563eb]">
            {initials}
          </div>
          <div>
            <p className="font-bold text-stone-900">{t.user.name}</p>
            <p className="mt-0.5 text-sm text-stone-400">{t.user.email}</p>
          </div>
        </div>
      </div>

      {/* Course Info */}
      <div className="mb-4 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <h3 className="mb-4 text-lg font-bold text-stone-900">Informasi Kelas / Program</h3>
        {[
          { label: "Program", value: t.course?.title ?? "Nalar Etam" },
          { label: "Status Akses", value: t.user.hasAccess ? "Aktif" : "Tidak Aktif" },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between border-b border-[#f1f3f5] py-3 last:border-0 last:pb-0">
            <span className="text-sm text-stone-400">{row.label}</span>
            <span className="text-sm font-semibold text-stone-700">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Payment Detail */}
      <div className="mb-4 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <h3 className="mb-4 text-lg font-bold text-stone-900">Detail Pembayaran</h3>
        {[
          { label: "Nominal", value: `Rp ${t.amount.toLocaleString("id-ID")}` },
          { label: "Tanggal Pembayaran", value: formatDate(t.paidAt) },
          { label: "Referensi Gateway", value: t.tripayReference ?? "—" },
          { label: "Kode Promo", value: t.promoCode ?? "—" },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between border-b border-[#f1f3f5] py-3 last:border-0 last:pb-0">
            <span className="text-sm text-stone-400">{row.label}</span>
            <span className="text-sm font-semibold text-stone-700">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Payment Method */}
      <div className="mb-6 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <h3 className="mb-4 text-lg font-bold text-stone-900">Metode Pembayaran</h3>
        <div className="flex items-center gap-3">
          <div className="flex h-[45px] w-[45px] items-center justify-center rounded-[14px] bg-[#f8fafc]">
            <CreditCard size={22} className="text-stone-400" />
          </div>
          <div>
            <p className="font-bold text-stone-900">{t.paymentMethod ?? "—"}</p>
            <p className="mt-0.5 text-sm text-stone-400">Tripay</p>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <Link href={`/admin/member/${t.user.id}`}>
        <button className="h-[56px] w-full rounded-[16px] bg-[#2563eb] text-sm font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]">
          Lihat Profil Siswa
        </button>
      </Link>
    </div>
  );
}

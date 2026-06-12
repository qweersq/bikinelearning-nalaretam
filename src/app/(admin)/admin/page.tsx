import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, Tag, Users, CalendarDays, CreditCard, ArrowRight, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

function formatRupiah(amount: number) {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}JT`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}RB`;
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default async function AdminDashboard() {
  const session = await requireAdmin();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    totalStudents,
    activeStudents,
    totalCourses,
    publishedCourses,
    totalLearningParts,
    completedProgress,
    paymentsToday,
    pendingPayments,
    revenue,
    monthlyRevenue,
    recentPayments,
    recentStudents,
  ] =
    await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "USER", hasAccess: true } }),
      prisma.course.count(),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.module.count({ where: { isPublished: true } }),
      prisma.progress.count({ where: { completed: true, user: { role: "USER" } } }),
      prisma.transaction.count({ where: { status: "SUCCESS", paidAt: { gte: todayStart } } }),
      prisma.transaction.count({ where: { status: "PENDING" } }),
      prisma.transaction.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { status: "SUCCESS", paidAt: { gte: monthStart } }, _sum: { amount: true } }),
      prisma.transaction.findMany({
        where: { status: "SUCCESS" },
        include: { user: { select: { name: true } }, course: { select: { title: true } } },
        orderBy: { paidAt: "desc" },
        take: 5,
      }),
      prisma.user.findMany({
        where: { role: "USER" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, createdAt: true },
      }),
    ]);

  const totalRevenue = revenue._sum.amount ?? 0;
  const thisMonthRevenue = monthlyRevenue._sum.amount ?? 0;
  const adminInitial = session.name?.charAt(0).toUpperCase() ?? "A";
  const avgProgress = totalStudents > 0 && totalLearningParts > 0
    ? Math.round((completedProgress / totalStudents / totalLearningParts) * 100)
    : 0;

  function formatJoinedDate(date: Date) {
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[30px] font-extrabold text-stone-900">Dashboard Admin</h1>
          <p className="mt-1 text-sm text-stone-400">Ringkasan operasional Nalar Etam</p>
        </div>
        <Link
          href="/admin/settings"
          aria-label="Buka pengaturan admin"
          className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#2563eb] text-lg font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-transform hover:scale-105"
        >
          {adminInitial}
        </Link>
      </div>

      {/* Operational Hero */}
      <div className="mb-5 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#2563eb] to-[#1fb86d] p-6 text-white shadow-[0_10px_25px_rgba(37,99,235,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/75">Pendapatan Bulan Ini</p>
            <h2 className="mt-2 text-[38px] font-extrabold leading-none">{formatRupiah(thisMonthRevenue)}</h2>
            <p className="mt-2 text-xs text-white/70">Total pendapatan: {formatRupiah(totalRevenue)}</p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white/15">
            <TrendingUp size={23} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            { label: "Siswa Aktif", value: activeStudents },
            { label: "Pending", value: pendingPayments },
            { label: "Paid Hari Ini", value: paymentsToday },
          ].map((item) => (
            <div key={item.label} className="rounded-[18px] bg-white/14 p-3">
              <p className="text-xl font-extrabold">{item.value}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-white/70">{item.label}</p>
            </div>
          ))}
        </div>

        <Link href="/admin/transaksi" className="mt-5 flex h-[48px] items-center justify-center gap-2 rounded-[16px] bg-white text-sm font-bold text-[#2563eb]">
          Lihat Transaksi
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Core LMS Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3">
        {[
          { label: "Total Siswa", value: totalStudents, sub: `${activeStudents} aktif` },
          { label: "Materi Published", value: publishedCourses, sub: `${totalCourses} total materi` },
          { label: "Bab Belajar", value: totalLearningParts, sub: "siap diakses siswa" },
          { label: "Rata-rata Progress", value: `${avgProgress}%`, sub: "progress siswa" },
        ].map((s) => (
          <div key={s.label} className="rounded-[22px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <h3 className="text-[28px] font-bold text-[#2563eb]">{s.value}</h3>
            <p className="mt-1.5 text-sm text-stone-400">{s.label}</p>
            <p className="mt-1 text-[11px] font-semibold text-stone-300">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Payments */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[22px] font-extrabold text-stone-900">Recent Payments</h3>
          <Link href="/admin/transaksi" className="text-sm font-semibold text-[#2563eb]">View All</Link>
        </div>
        <div className="space-y-3">
          {recentPayments.length === 0 ? (
            <div className="rounded-[22px] bg-white p-5 text-center text-sm text-stone-400 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
              Belum ada pembayaran
            </div>
          ) : recentPayments.map((t) => (
            <div key={t.id} className="rounded-[22px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
              <p className="font-bold text-stone-900">{t.user.name}</p>
              <p className="mt-1 text-sm text-stone-400">{t.course?.title ?? "—"}</p>
              <p className="mt-2 text-sm font-semibold text-[#2563eb]">
                Rp {t.amount.toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Students */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[22px] font-extrabold text-stone-900">Recent Students</h3>
          <Link href="/admin/member" className="text-sm font-semibold text-[#2563eb]">View All</Link>
        </div>
        <div className="space-y-3">
          {recentStudents.length === 0 ? (
            <div className="rounded-[22px] bg-white p-5 text-center text-sm text-stone-400 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
              Belum ada siswa
            </div>
          ) : recentStudents.map((u) => (
            <div key={u.id} className="rounded-[22px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
              <p className="font-bold text-stone-900">{u.name}</p>
              <p className="mt-1 text-sm text-stone-400">Bergabung {formatJoinedDate(u.createdAt)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-4 text-[22px] font-extrabold text-stone-900">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: BookOpen,     label: "Add Course",    href: "/admin/kursus/tambah" },
            { icon: CalendarDays, label: "Jadwal Kelas",  href: "/admin/jadwal" },
            { icon: CreditCard,   label: "Transaksi",     href: "/admin/transaksi" },
            { icon: Tag,          label: "Promo Codes",   href: "/admin/promo" },
            { icon: Users,        label: "Students",      href: "/admin/member" },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.label} href={a.href}>
                <div className="rounded-[22px] bg-white p-5 text-center shadow-[0_5px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
                  <div className="mb-3 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#eff6ff]">
                      <Icon size={22} className="text-[#2563eb]" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-stone-900">{a.label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [user, allCourses, totalModules] = await Promise.all([
    prisma.user.findUnique({
      where: { id, role: "USER" },
      include: {
        progress: {
          where: { completed: true },
          include: {
            module: {
              include: {
                chapter: {
                  include: { course: true }
                }
              }
            }
          }
        },
        certificates: { include: { course: { select: { title: true } } } },
        transactions: { where: { status: "SUCCESS" }, include: { course: { select: { title: true } } } },
      },
    }),
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        chapters: {
          select: {
            modules: { where: { isPublished: true }, select: { id: true } }
          }
        }
      },
    }),
    prisma.module.count({ where: { isPublished: true } }),
  ]);

  if (!user) notFound();

  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const progress = totalModules > 0 ? Math.round((user.progress.length / totalModules) * 100) : 0;

  const modulesPerCourse = new Map(
    allCourses.map((c) => {
      const count = c.chapters.flatMap((ch) => ch.modules).length;
      return [c.id, count];
    })
  );

  const courseMap = new Map<string, { title: string; slug: string; completedCount: number; totalCount: number }>();
  for (const p of user.progress) {
    const course = p.module.chapter.course;
    const existing = courseMap.get(course.id) ?? {
      title: course.title,
      slug: course.slug,
      completedCount: 0,
      totalCount: modulesPerCourse.get(course.id) ?? 0
    };
    courseMap.set(course.id, { ...existing, completedCount: existing.completedCount + 1 });
  }

  const courses = Array.from(courseMap.values());

  function formatDate(d: Date) {
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link href="/admin/member">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <ArrowLeft size={18} className="text-stone-600" />
          </div>
        </Link>
        <h1 className="text-[28px] font-extrabold text-stone-900">Detail Siswa</h1>
      </div>

      {/* Profile Card */}
      <div className="mb-5 rounded-[28px] bg-white p-6 text-center shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex h-[90px] w-[90px] items-center justify-center rounded-[24px] bg-[#eff6ff] text-3xl font-extrabold text-[#2563eb]">
          {initials}
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-stone-900">{user.name}</h2>
        <p className="mt-1.5 text-sm text-stone-400">{user.email}</p>
        <span className={`mt-4 inline-block rounded-full px-4 py-2 text-xs font-bold ${
          user.hasAccess ? "bg-[#eff6ff] text-[#2563eb]" : "bg-stone-100 text-stone-400"
        }`}>
          {user.hasAccess ? "SISWA AKTIF" : "TIDAK AKTIF"}
        </span>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { label: "Materi", value: courses.length },
            { label: "Sertifikat", value: user.certificates.length },
            { label: "Progres", value: `${progress}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-[14px] bg-[#f8fafc] p-3">
              <p className="text-lg font-bold text-[#2563eb]">{s.value}</p>
              <p className="mt-1 text-[11px] text-stone-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Courses */}
      {courses.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-3 text-[22px] font-extrabold text-stone-900">Materi</h2>
          <div className="space-y-3">
            {courses.map((c) => (
              <div key={c.title} className="rounded-[22px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
                <p className="font-bold text-stone-900">{c.title}</p>
                <p className="mt-1 text-sm text-stone-400">Progres {c.completedCount} modul selesai</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf1f5]">
                  <div className="h-full rounded-full bg-[#2563eb]" style={{ width: `${c.totalCount > 0 ? Math.round((c.completedCount / c.totalCount) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {user.certificates.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-3 text-[22px] font-extrabold text-stone-900">Sertifikat</h2>
          <div className="space-y-3">
            {user.certificates.map((cert) => (
              <div key={cert.id} className="rounded-[22px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
                <p className="font-bold text-stone-900">{cert.course.title}</p>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-stone-400">ID Sertifikat</span>
                  <span className="font-semibold text-stone-700">{cert.certificateNumber.slice(0, 16)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments */}
      {user.transactions.length > 0 && (
        <div>
          <h2 className="mb-3 text-[22px] font-extrabold text-stone-900">Pembayaran</h2>
          <div className="space-y-3">
            {user.transactions.map((t) => (
              <div key={t.id} className="rounded-[22px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
                <p className="font-bold text-stone-900">{t.course?.title ?? "Nalar Etam"}</p>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="font-semibold text-stone-700">Rp {t.amount.toLocaleString("id-ID")}</span>
                  <span className="font-bold text-[#2563eb]">LUNAS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, BookOpen, Award } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireSession();
  const { slug } = await params;
  const isAdmin = session.role === "ADMIN";

  const course = await prisma.course.findUnique({
    where: isAdmin ? { slug } : { slug, status: "PUBLISHED" },
    include: {
      category: true,
      modules: { where: isAdmin ? {} : { isPublished: true }, orderBy: { order: "asc" } },
      quiz: { select: { id: true, isPublished: true } },
    },
  });
  if (!course) notFound();

  const moduleIds = course.modules.map((m) => m.id);
  const progresses = await prisma.progress.findMany({
    where: { userId: session.id, completed: true, moduleId: { in: moduleIds } },
    select: { moduleId: true },
  });

  const completedSet = new Set(progresses.map((p) => p.moduleId));
  const totalDuration = course.modules.reduce((sum, m) => sum + m.duration, 0);
  const firstUnfinished = course.modules.find((m) => !completedSet.has(m.id));
  const firstModule = course.modules[0];
  const startSlug = firstUnfinished?.slug ?? firstModule?.slug;
  const allDone = course.modules.length > 0 && completedSet.size >= course.modules.length;
  const hasQuiz = !!course.quiz?.isPublished;

  return (
    <div className="-mx-5 -mt-5 pb-[120px]">
      {/* Hero */}
      <div className="relative h-[260px] rounded-b-[35px] bg-gradient-to-br from-[#2563eb] to-[#3b82f6]">
        {course.thumbnail && (
          <img src={course.thumbnail} alt={course.title} className="absolute inset-0 h-full w-full rounded-b-[35px] object-cover opacity-30" />
        )}
        <Link
          href="/dashboard/modul"
          className="absolute left-5 top-5 flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white/20 text-white"
        >
          <ArrowLeft size={20} />
        </Link>

        {/* Floating preview card */}
        <div className="absolute -bottom-[70px] left-5 right-5 overflow-hidden rounded-[25px] bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] shadow-[0_15px_30px_rgba(0,0,0,.08)]">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="h-[180px] w-full object-cover" />
          ) : (
            <div className="flex h-[180px] items-center justify-center">
              <BookOpen size={64} className="text-[#2563eb]/40" strokeWidth={1} />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-[100px]">
        {/* Badge */}
        <span className="inline-block rounded-full bg-[#eff6ff] px-[14px] py-2 text-xs font-bold text-[#2563eb]">
          {course.category.name.toUpperCase()}
        </span>

        {/* Title & desc */}
        <div className="mt-[15px]">
          <h1 className="text-[30px] font-extrabold leading-snug text-stone-900">{course.title}</h1>
          {course.description && (
            <p className="mt-2.5 leading-relaxed text-[#777]">{course.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="mt-[25px] grid grid-cols-3 gap-3">
          <div className="rounded-[18px] bg-white p-[15px] text-center shadow-[0_5px_20px_rgba(0,0,0,.04)]">
            <h3 className="text-xl font-bold text-[#2563eb]">{course.modules.length}</h3>
            <p className="mt-1 text-xs text-[#888]">Pelajaran</p>
          </div>
          <div className="rounded-[18px] bg-white p-[15px] text-center shadow-[0_5px_20px_rgba(0,0,0,.04)]">
            <h3 className="text-xl font-bold text-[#2563eb]">{totalDuration}</h3>
            <p className="mt-1 text-xs text-[#888]">Menit</p>
          </div>
          <div className="rounded-[18px] bg-white p-[15px] text-center shadow-[0_5px_20px_rgba(0,0,0,.04)]">
            <h3 className="text-xl font-bold text-[#2563eb]">{completedSet.size}/{course.modules.length}</h3>
            <p className="mt-1 text-xs text-[#888]">Selesai</p>
          </div>
        </div>

        {/* What You'll Learn */}
        {course.modules.length > 0 && (
          <div className="mt-[30px]">
            <h2 className="mb-[15px] text-xl font-bold text-stone-900">Yang Akan Kamu Pelajari</h2>
            <div className="flex flex-col gap-3">
              {course.modules.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-[18px] bg-white p-[15px] shadow-[0_5px_20px_rgba(0,0,0,.04)]"
                >
                  <CheckCircle2
                    size={18}
                    className={`shrink-0 ${completedSet.has(m.id) ? "text-[#2563eb]" : "text-stone-300"}`}
                  />
                  <span className="text-sm font-medium text-stone-700">{m.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Modules */}
        <div className="mt-[30px]">
          <h2 className="mb-[15px] text-xl font-bold text-stone-900">Materi Kursus</h2>
          <div className="flex flex-col gap-3">
            {course.modules.map((m, i) => (
              <Link key={m.id} href={`/dashboard/modul/${slug}/${m.slug}`}>
                <div className="flex items-center justify-between rounded-[18px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,.04)] transition-shadow hover:shadow-[0_8px_25px_rgba(0,0,0,.08)]">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      completedSet.has(m.id)
                        ? "bg-[#eff6ff] text-[#2563eb]"
                        : "bg-stone-100 text-stone-500"
                    }`}>
                      {completedSet.has(m.id) ? "✓" : i + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{m.title}</h4>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-[#888]">
                        <Clock size={10} />
                        {m.duration} menit
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-stone-400">{m.duration} mnt</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Instructor */}
        <div className="mt-[30px]">
          <h2 className="mb-[15px] text-xl font-bold text-stone-900">Instruktur</h2>
          <div className="flex gap-[15px] rounded-[22px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,.04)]">
            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-xl font-bold text-[#2563eb]">
              NE
            </div>
            <div>
              <h4 className="font-bold text-stone-900">Tim Tutor Nalar Etam</h4>
              <p className="mt-1 text-xs leading-relaxed text-[#777]">
                Pengajar Matematika berpengalaman dalam mendampingi dan meluluskan siswa masuk PTN impian.
              </p>
            </div>
          </div>
        </div>

        {/* Certificate */}
        <div className="mt-[30px]">
          <h2 className="mb-[15px] text-xl font-bold text-stone-900">Sertifikat</h2>
          <div className="flex items-center gap-[15px] rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,.04)]">
            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-amber-50">
              <Award size={28} className="text-amber-500" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900">Sertifikat Kelulusan</h4>
              <p className="mt-1 text-xs leading-relaxed text-[#777]">
                Selesaikan semua materi untuk mendapatkan sertifikat digital dari Nalar Etam.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-5 left-1/2 w-[728px] max-w-[calc(100%-40px)] -translate-x-1/2">
        {allDone && hasQuiz ? (
          <div className="flex gap-3 rounded-[24px] bg-white p-3.5 shadow-[0_10px_30px_rgba(0,0,0,.08)]">
            {startSlug && (
              <Link href={`/dashboard/modul/${slug}/${startSlug}`} className="flex-1">
                <div className="flex h-[54px] w-full items-center justify-center rounded-[16px] bg-stone-100 text-sm font-bold text-stone-700">
                  Ulangi Kursus
                </div>
              </Link>
            )}
            <Link href={`/dashboard/quiz/${slug}`} className="flex-1">
              <div className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#2563eb] text-sm font-bold text-white shadow-[0_8px_20px_rgba(37,99,235,.3)]">
                <Award size={16} /> Kerjakan Quiz
              </div>
            </Link>
          </div>
        ) : startSlug ? (
          <Link href={`/dashboard/modul/${slug}/${startSlug}`}>
            <div className="flex h-[60px] w-full items-center justify-center gap-2.5 rounded-[18px] bg-[#2563eb] text-base font-bold text-white shadow-[0_10px_30px_rgba(37,99,235,.3)]">
              {completedSet.size === 0 ? "Mulai Belajar" : "Lanjutkan Belajar"} →
            </div>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

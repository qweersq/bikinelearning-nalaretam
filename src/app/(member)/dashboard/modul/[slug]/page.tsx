import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, BookOpen, Award, FileQuestion } from "lucide-react";

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
      chapters: {
        orderBy: { order: "asc" },
        include: {
          modules: { where: isAdmin ? {} : { isPublished: true }, orderBy: { order: "asc" } },
          quizzes: { where: isAdmin ? {} : { isPublished: true }, orderBy: { createdAt: "asc" } },
        },
      },
      quizzes: {
        where: { chapterId: null, ...(isAdmin ? {} : { isPublished: true }) },
        select: { id: true, title: true, isPublished: true },
      },
    },
  });
  if (!course) notFound();

  const allModules = course.chapters.flatMap((ch) => ch.modules);
  const moduleIds = allModules.map((m) => m.id);
  const progresses = await prisma.progress.findMany({
    where: { userId: session.id, completed: true, moduleId: { in: moduleIds } },
    select: { moduleId: true },
  });

  const completedSet = new Set(progresses.map((p) => p.moduleId));

  // Get attempts for all quizzes in this course
  const allQuizzes = course.chapters.flatMap((ch) => ch.quizzes);
  const quizIds = allQuizzes.map((q) => q.id);
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId: session.id, quizId: { in: quizIds } },
    select: { quizId: true, passed: true },
  });
  const quizCompletedSet = new Set(
    quizAttempts.filter((qa) => qa.passed).map((qa) => qa.quizId)
  );

  const totalDuration = allModules.reduce((sum, m) => sum + m.duration, 0);
  const firstUnfinished = allModules.find((m) => !completedSet.has(m.id));
  const firstModule = allModules[0] || null;
  const startSlug = firstUnfinished?.slug ?? firstModule?.slug;
  const allDone = allModules.length > 0 && completedSet.size >= allModules.length;

  const finalQuizzes = course.quizzes;

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
            <h3 className="text-xl font-bold text-[#2563eb]">{allModules.length}</h3>
            <p className="mt-1 text-xs text-[#888]">Pelajaran</p>
          </div>
          <div className="rounded-[18px] bg-white p-[15px] text-center shadow-[0_5px_20px_rgba(0,0,0,.04)]">
            <h3 className="text-xl font-bold text-[#2563eb]">{totalDuration}</h3>
            <p className="mt-1 text-xs text-[#888]">Menit</p>
          </div>
          <div className="rounded-[18px] bg-white p-[15px] text-center shadow-[0_5px_20px_rgba(0,0,0,.04)]">
            <h3 className="text-xl font-bold text-[#2563eb]">{completedSet.size}/{allModules.length}</h3>
            <p className="mt-1 text-xs text-[#888]">Selesai</p>
          </div>
        </div>

        {/* What You'll Learn */}
        {allModules.length > 0 && (
          <div className="mt-[30px]">
            <h2 className="mb-[15px] text-xl font-bold text-stone-900">Yang Akan Kamu Pelajari</h2>
            <div className="flex flex-col gap-3">
              {allModules.map((m) => (
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

        {/* Course Chapters & Modules */}
        <div className="mt-[30px] space-y-6">
          <h2 className="text-xl font-bold text-stone-900">Daftar Bab & Konsep</h2>
          {course.chapters.map((chapter, chapterIdx) => (
            <div key={chapter.id} className="space-y-3">
              <h3 className="text-base font-extrabold text-stone-800 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eff6ff] text-xs font-bold text-[#2563eb]">
                  {chapterIdx + 1}
                </span>
                {chapter.title}
              </h3>
              <div className="flex flex-col gap-3 pl-2">
                {chapter.modules.map((m, i) => (
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

                {chapter.quizzes && chapter.quizzes.map((quiz) => {
                  const isPassed = quizCompletedSet.has(quiz.id);
                  return (
                    <Link key={quiz.id} href={`/dashboard/quiz/${slug}/${quiz.id}`}>
                      <div className="flex items-center justify-between rounded-[18px] bg-indigo-50/20 border border-indigo-100/40 p-[18px] shadow-[0_5px_20px_rgba(99,102,241,0.02)] transition-all hover:shadow-[0_8px_25px_rgba(99,102,241,0.08)]">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            isPassed
                              ? "bg-emerald-100 text-emerald-600 border border-emerald-200"
                              : "bg-indigo-50 text-indigo-500 border border-indigo-200"
                          }`}>
                            {isPassed ? "✓" : "?"}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                              {quiz.title}
                              <span className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-bold text-indigo-600 border border-indigo-200">
                                Latihan Soal
                              </span>
                            </h4>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-400">
                              <FileQuestion size={12} className="text-indigo-400 inline-block mr-0.5 shrink-0" />
                              Evaluasi dan asah pemahaman materi bab
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-indigo-600 font-bold hover:underline">Mulai →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Evaluasi Akhir (Course-Wide Quiz) */}
        {finalQuizzes.length > 0 && (
          <div className="mt-8 space-y-3">
            <h2 className="text-xl font-bold text-stone-900">Evaluasi Akhir Kelas</h2>
            <div className="flex flex-col gap-3">
              {finalQuizzes.map((quiz) => (
                <Link key={quiz.id} href={`/dashboard/quiz/${slug}/${quiz.id}`}>
                  <div className="flex items-center justify-between rounded-[22px] bg-gradient-to-br from-[#2563eb]/5 to-[#2563eb]/10 border border-[#2563eb]/20 p-5 shadow-[0_8px_25px_rgba(37,99,235,0.03)] transition-all hover:shadow-[0_12px_30px_rgba(37,99,235,0.08)]">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#2563eb] text-white">
                        <Award size={24} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-stone-950 text-base leading-tight truncate">
                          {quiz.title}
                        </h4>
                        <p className="mt-1 text-xs text-stone-500">
                          Selesaikan ujian akhir ini untuk mendapatkan sertifikat kelulusan
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#2563eb] text-white px-4 py-2 text-xs font-bold shadow-[0_4px_12px_rgba(37,99,235,0.2)]">
                      Mulai Ujian
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Instructor */}
        <div className="mt-[30px]">
          <h2 className="mb-[15px] text-xl font-bold text-stone-900">Instruktur</h2>
          <div className="flex gap-[15px] rounded-[22px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,.04)]">
            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-xl font-bold text-[#2563eb]">
              NE
            </div>
            <div>
              <h4 className="font-bold text-stone-950">Tim Tutor Nalar Etam</h4>
              <p className="mt-1 text-xs leading-relaxed text-[#777]">
                Pengajar Matematika berpengalaman dalam mendampingi dan meluluskan siswa masuk PTN impian.
              </p>
            </div>
          </div>
        </div>

        {/* Certificate (Hidden)
        <div className="mt-[30px]">
          <h2 className="mb-[15px] text-xl font-bold text-stone-900">Sertifikat</h2>
          <div className="flex items-center gap-[15px] rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,.04)]">
            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-amber-50">
              <Award size={28} className="text-amber-500" />
            </div>
            <div>
              <h4 className="font-bold text-stone-950">Sertifikat Kelulusan</h4>
              <p className="mt-1 text-xs leading-relaxed text-[#777]">
                Selesaikan semua materi untuk mendapatkan sertifikat digital dari Nalar Etam.
              </p>
            </div>
          </div>
        </div>
        */}
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-5 left-1/2 w-[728px] max-w-[calc(100%-40px)] -translate-x-1/2">
        {startSlug ? (
          <Link href={`/dashboard/modul/${slug}/${startSlug}`}>
            <div className="flex h-[60px] w-full items-center justify-center gap-2.5 rounded-[18px] bg-[#2563eb] text-base font-bold text-white shadow-[0_10px_30px_rgba(37,99,235,.3)]">
              {completedSet.size === 0 ? "Mulai Belajar" : allDone ? "Ulangi Kursus" : "Lanjutkan Belajar"} →
            </div>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

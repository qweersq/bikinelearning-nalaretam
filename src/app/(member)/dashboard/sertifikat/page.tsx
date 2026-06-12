import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Award, CheckCircle, Lock, ExternalLink, BookOpen, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SertifikatPage() {
  const session = await requireSession();

  const [user, courses, template] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.id }, select: { id: true, name: true } }),
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      include: {
        modules: { where: { isPublished: true }, select: { id: true } },
        quiz: { select: { id: true, isPublished: true, passingScore: true } },
        certificates: { where: { userId: session.id }, select: { id: true, certificateNumber: true, issuedAt: true } },
      },
      orderBy: { order: "asc" },
    }),
    prisma.certificateTemplate.findFirst({ orderBy: { createdAt: "asc" } }),
  ]);

  const allModuleIds = courses.flatMap((c) => c.modules.map((m) => m.id));
  const progresses = await prisma.progress.findMany({
    where: { userId: session.id, completed: true, moduleId: { in: allModuleIds } },
    select: { moduleId: true },
  });
  const completedIds = new Set(progresses.map((p) => p.moduleId));

  const lastAttempts = await prisma.quizAttempt.findMany({
    where: { userId: session.id },
    orderBy: { completedAt: "desc" },
    select: { quizId: true, score: true, passed: true },
  });
  const bestAttempts = new Map<string, { score: number; passed: boolean }>();
  for (const a of lastAttempts) {
    const prev = bestAttempts.get(a.quizId);
    if (!prev || a.score > prev.score) bestAttempts.set(a.quizId, a);
  }

  const totalCerts = courses.reduce((sum, c) => sum + c.certificates.length, 0);
  const firstName = user?.name?.split(" ")[0] ?? "Kamu";

  return (
    <div>
      {/* Header */}
      <h1 className="mb-6 text-[28px] font-extrabold text-stone-900">Sertifikat</h1>

      {/* Summary */}
      <div className="mb-5 rounded-[28px] bg-gradient-to-br from-[#2563eb] to-[#3b82f6] p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] bg-white/20">
            <Award size={30} className="text-white" />
          </div>
          <div>
            <p className="text-sm opacity-80">Halo, {firstName}!</p>
            <p className="text-xl font-extrabold">
              {totalCerts > 0 ? `${totalCerts} Sertifikat Diraih` : "Belum ada sertifikat"}
            </p>
            <p className="mt-0.5 text-xs opacity-70">
              {totalCerts > 0 ? "Luar biasa, terus semangat!" : "Selesaikan kursus untuk mendapatkan sertifikat"}
            </p>
          </div>
        </div>
      </div>

      {/* Per-course certificate cards */}
      <div className="space-y-4">
        {courses.map((course) => {
          const courseModuleIds = course.modules.map((m) => m.id);
          const completedCount = courseModuleIds.filter((id) => completedIds.has(id)).length;
          const totalModules = courseModuleIds.length;
          const modulesPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
          const allModulesDone = totalModules > 0 && completedCount >= totalModules;

          const hasQuiz = !!course.quiz?.isPublished;
          const quizAttempt = course.quiz ? bestAttempts.get(course.quiz.id) : null;
          const quizPassed = quizAttempt?.passed ?? false;

          const cert = course.certificates[0] ?? null;
          const isEligible = allModulesDone && (!hasQuiz || quizPassed);

          return (
            <div key={course.id} className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
              {/* Course title */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#eff6ff]">
                  <BookOpen size={20} className="text-[#2563eb]" />
                </div>
                <div>
                  <p className="font-bold text-stone-900">{course.title}</p>
                  <p className="text-xs text-stone-400">{totalModules} materi</p>
                </div>
              </div>

              {/* Checklist */}
              <div className="mb-4 space-y-2">
                <ChecklistItem
                  done={allModulesDone}
                  label={`Materi selesai (${completedCount}/${totalModules})`}
                  sub={!allModulesDone ? `${modulesPercent}% — selesaikan semua materi` : undefined}
                />
                {hasQuiz && (
                  <ChecklistItem
                    done={quizPassed}
                    label={`Quiz lulus${quizAttempt ? ` (${quizAttempt.score}%)` : ""}`}
                    sub={!quizPassed ? `Passing score: ${course.quiz!.passingScore}%` : undefined}
                  />
                )}
              </div>

              {/* Progress bar for modules */}
              {!allModulesDone && (
                <div className="mb-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#f1f3f5]">
                    <div className="h-full rounded-full bg-[#2563eb] transition-all" style={{ width: `${modulesPercent}%` }} />
                  </div>
                </div>
              )}

              {/* CTA */}
              {cert ? (
                /* Certificate issued — visual preview */
                <div>
                  {/* Mini certificate card */}
                  <div
                    className="mb-3 overflow-hidden rounded-[16px] border border-[#d1f0e0] bg-white"
                    style={
                      template?.backgroundUrl
                        ? { backgroundImage: `url(${template.backgroundUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                        : undefined
                    }
                  >
                    <div className={template?.backgroundUrl ? "bg-white/90" : ""}>
                      <div className="p-4">
                        <div className="mb-3 flex items-center gap-2">
                          {template?.logoUrl ? (
                            <Image src={template.logoUrl} alt="Logo" width={32} height={32} className="h-8 w-8 rounded-[8px] object-cover" />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#eff6ff]">
                              <Award size={16} className="text-[#2563eb]" />
                            </div>
                          )}
                          <div>
                            <p className="text-[9px] font-semibold uppercase tracking-widest text-[#2563eb]">Nalar Etam</p>
                            <p className="text-xs font-extrabold text-stone-800">{template?.title ?? "Certificate of Completion"}</p>
                          </div>
                        </div>
                        <p className="mb-2 text-[11px] leading-relaxed text-stone-600">
                          {(template?.text ?? "This certificate is awarded to {{student_name}} for successfully completing {{course_name}} at Nalar Etam.")
                            .replace("{{student_name}}", user?.name ?? "")
                            .replace("{{course_name}}", course.title)}
                        </p>
                        <div className="flex items-end justify-between border-t border-[#f1f3f5] pt-2.5">
                          <div>
                            <p className="font-mono text-[9px] text-stone-400">{cert.certificateNumber}</p>
                            <p className="text-[9px] text-stone-400">
                              {new Date(cert.issuedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                            </p>
                          </div>
                          {template?.signatureUrl && (
                            <Image src={template.signatureUrl} alt="TTD" width={60} height={24} className="h-6 w-auto object-contain" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/sertifikat/${cert.certificateNumber}`} target="_blank" className="flex-1">
                      <button className="flex h-[40px] w-full items-center justify-center gap-1.5 rounded-[12px] bg-[#2563eb] text-xs font-bold text-white">
                        <Download size={13} /> Download
                      </button>
                    </Link>
                    <Link href={`/verify/${cert.certificateNumber}`} target="_blank" className="flex-1">
                      <button className="flex h-[40px] w-full items-center justify-center gap-1.5 rounded-[12px] bg-[#f4f6f8] text-xs font-bold text-stone-600">
                        <ExternalLink size={13} /> Verifikasi
                      </button>
                    </Link>
                  </div>
                </div>
              ) : isEligible ? (
                /* Eligible but cert not yet issued (edge case) */
                <div className="rounded-[16px] bg-amber-50 p-4 text-center">
                  <p className="text-sm font-bold text-amber-700">Kamu sudah memenuhi syarat!</p>
                  <p className="mt-0.5 text-xs text-amber-500">Sertifikat sedang diproses...</p>
                </div>
              ) : !allModulesDone ? (
                <Link href={`/dashboard/modul/${course.slug}`}>
                  <button className="h-[44px] w-full rounded-[14px] bg-[#2563eb] text-sm font-bold text-white">
                    Lanjutkan Belajar
                  </button>
                </Link>
              ) : hasQuiz && !quizPassed ? (
                <Link href={`/dashboard/quiz/${course.slug}`}>
                  <button className="h-[44px] w-full rounded-[14px] bg-[#2563eb] text-sm font-bold text-white">
                    Kerjakan Quiz
                  </button>
                </Link>
              ) : null}
            </div>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <Lock size={32} className="mx-auto mb-3 text-stone-200" />
          <p className="text-sm text-stone-400">Belum ada kursus yang tersedia</p>
        </div>
      )}
    </div>
  );
}

function ChecklistItem({ done, label, sub }: { done: boolean; label: string; sub?: string }) {
  return (
    <div className="flex items-start gap-2.5">
      {done
        ? <CheckCircle size={16} className="mt-0.5 shrink-0 text-[#2563eb]" />
        : <Lock size={16} className="mt-0.5 shrink-0 text-stone-300" />}
      <div>
        <p className={`text-sm font-semibold ${done ? "text-stone-700" : "text-stone-400"}`}>{label}</p>
        {sub && <p className="text-xs text-stone-400">{sub}</p>}
      </div>
    </div>
  );
}

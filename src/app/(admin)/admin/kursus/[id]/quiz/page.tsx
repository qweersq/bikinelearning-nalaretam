import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Plus, FileQuestion, Users, CheckCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CourseQuizPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id: courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, quiz: { include: { questions: { include: { options: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } }, attempts: { select: { id: true, score: true, passed: true } } } } },
  });

  const quiz = course?.quiz ?? null;
  const attempts = quiz?.attempts ?? [];
  const passedCount = attempts.filter((a) => a.passed).length;
  const avgScore = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.score ?? 0), 0) / attempts.length) : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link href={`/admin/kursus/${courseId}`}>
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <ArrowLeft size={18} className="text-stone-600" />
          </div>
        </Link>
        <div>
          <h1 className="text-[22px] font-extrabold text-stone-900">Quiz</h1>
          <p className="text-xs text-stone-400 truncate max-w-[260px]">{course?.title}</p>
        </div>
      </div>

      {!quiz ? (
        /* No quiz yet */
        <div className="rounded-[24px] bg-white p-8 shadow-[0_5px_20px_rgba(0,0,0,0.04)] text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#eff6ff]">
            <FileQuestion size={28} className="text-[#2563eb]" />
          </div>
          <p className="mb-1 font-bold text-stone-800">Belum ada quiz</p>
          <p className="mb-6 text-sm text-stone-400">Buat quiz untuk kursus ini agar siswa bisa diuji</p>
          <Link href={`/admin/kursus/${courseId}/quiz/tambah`}>
            <button className="h-[48px] w-full rounded-[14px] bg-[#2563eb] text-sm font-bold text-white">
              Buat Quiz
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Quiz Card */}
          <div className="mb-4 rounded-[24px] bg-gradient-to-br from-[#2563eb] to-[#3b82f6] p-5 text-white">
            <div className="mb-3 flex items-center justify-between">
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${quiz.isPublished ? "bg-white/20" : "bg-black/20"}`}>
                {quiz.isPublished ? "Published" : "Draft"}
              </span>
              <Link href={`/admin/kursus/${courseId}/quiz/${quiz.id}`}>
                <button className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold">Edit</button>
              </Link>
            </div>
            <h2 className="text-lg font-extrabold">{quiz.title}</h2>
            {quiz.description && <p className="mt-1 text-sm opacity-80">{quiz.description}</p>}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "Passing", value: `${quiz.passingScore}%` },
                { label: "Time", value: quiz.timeLimit ? `${quiz.timeLimit}m` : "∞" },
                { label: "Questions", value: quiz.questions.length },
              ].map((s) => (
                <div key={s.label} className="rounded-[12px] bg-white/15 p-2.5 text-center">
                  <p className="text-base font-extrabold">{s.value}</p>
                  <p className="text-[10px] opacity-70">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { icon: Users, label: "Attempts", value: attempts.length },
              { icon: CheckCircle, label: "Passed", value: passedCount },
              { icon: Clock, label: "Avg Score", value: `${avgScore}%` },
            ].map((s) => (
              <div key={s.label} className="rounded-[20px] bg-white p-4 shadow-[0_5px_20px_rgba(0,0,0,0.04)] text-center">
                <s.icon size={18} className="mx-auto mb-2 text-[#2563eb]" />
                <p className="text-lg font-extrabold text-stone-800">{s.value}</p>
                <p className="text-[10px] text-stone-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Questions */}
          <div className="mb-4 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-stone-900">Questions ({quiz.questions.length})</h3>
              <Link href={`/admin/kursus/${courseId}/quiz/${quiz.id}`}>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563eb]">
                  <Plus size={16} className="text-white" />
                </button>
              </Link>
            </div>
            {quiz.questions.length === 0 ? (
              <p className="py-4 text-center text-sm text-stone-400">Belum ada pertanyaan</p>
            ) : (
              <div className="space-y-3">
                {quiz.questions.map((q, i) => (
                  <div key={q.id} className="rounded-[14px] bg-[#f8fafc] p-3.5">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[11px] font-bold text-[#2563eb]">{i + 1}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${q.type === "MULTIPLE_CHOICE" ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500"}`}>
                        {q.type === "MULTIPLE_CHOICE" ? "MCQ" : "Essay"}
                      </span>
                    </div>
                    <p className="text-sm text-stone-700 line-clamp-2">{q.question}</p>
                    {q.type === "MULTIPLE_CHOICE" && (
                      <p className="mt-1.5 text-[11px] text-stone-400">{q.options.length} options · {q.options.filter((o) => o.isCorrect).length} correct</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link href={`/admin/kursus/${courseId}/quiz/${quiz.id}`}>
            <button className="h-[52px] w-full rounded-[16px] bg-[#2563eb] text-sm font-bold text-white">
              Kelola Quiz & Pertanyaan
            </button>
          </Link>
        </>
      )}
    </div>
  );
}

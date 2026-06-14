import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ClipboardList, BookOpen, FileQuestion, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminQuizMainPage() {
  await requireAdmin();

  const courses = await prisma.course.findMany({
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          quizzes: {
            orderBy: { createdAt: "asc" },
            include: {
              questions: { select: { id: true } }
            }
          }
        }
      },
      quizzes: {
        where: { chapterId: null },
        orderBy: { createdAt: "asc" },
        include: {
          questions: { select: { id: true } }
        }
      }
    },
    orderBy: { order: "asc" }
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold text-stone-900">Pengelolaan Soal & Kuis</h1>
          <p className="text-sm text-stone-400">Kelola kuis bab, latihan soal, dan ujian akhir kelas</p>
        </div>
      </div>

      {/* Course List with Quizzes */}
      <div className="space-y-6">
        {courses.map((course) => {
          // Gather all chapter quizzes
          const chapterQuizzes = course.chapters.flatMap((ch) => 
            ch.quizzes.map((q) => ({ ...q, chapterTitle: ch.title }))
          );
          
          // Final Exam/Course quizzes
          const finalExamQuizzes = course.quizzes;

          const totalQuizzes = chapterQuizzes.length + finalExamQuizzes.length;

          return (
            <div key={course.id} className="rounded-[28px] bg-white p-6 shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-stone-100">
              {/* Course Title Bar */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#eff6ff] text-[#2563eb]">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-extrabold text-stone-850 leading-tight">{course.title}</h2>
                    <p className="text-xs text-stone-400 mt-0.5">{totalQuizzes} Kuis aktif</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/kursus/${course.id}/quiz/tambah`}>
                    <button className="h-[36px] px-3.5 rounded-[10px] bg-[#2563eb] text-xs font-bold text-white hover:bg-[#1d4ed8] cursor-pointer flex items-center gap-1.5 border-0">
                      <Plus size={13} /> Tambah Kuis
                    </button>
                  </Link>
                  <Link href={`/admin/kursus/${course.id}/modul`}>
                    <button className="h-[36px] px-4 rounded-[10px] bg-[#f8fafc] border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer">
                      Kurikulum Kelas
                    </button>
                  </Link>
                </div>
              </div>

              {/* Quizzes List */}
              {totalQuizzes === 0 ? (
                <div className="py-6 text-center text-xs text-stone-400 bg-stone-50/50 border border-dashed border-stone-200 rounded-xl">
                  Belum ada soal latihan atau kuis kelulusan di kelas ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Final Exam Section */}
                  {finalExamQuizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between rounded-[18px] bg-indigo-50/10 border border-indigo-100/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white font-extrabold text-[#2563eb] text-xs border border-indigo-200">
                          <ClipboardList size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 text-sm leading-tight">
                            {quiz.title}
                          </p>
                          <p className="mt-0.5 text-xs text-stone-400 leading-none">
                            Kuis Kelulusan (Evaluasi Akhir) · {quiz.questions.length} Soal
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${quiz.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-[#fff4e8] text-orange-600"}`}>
                          {quiz.isPublished ? "PUBLISHED" : "DRAFT"}
                        </span>
                        <Link href={`/admin/kursus/${course.id}/quiz/${quiz.id}?from=/admin/quiz`}>
                          <button className="h-[32px] px-3.5 rounded-[8px] bg-[#2563eb] border-0 text-[11px] font-bold text-white cursor-pointer hover:bg-[#1d4ed8]">
                            Kelola Soal
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}

                  {/* Chapter Quizzes Section */}
                  {chapterQuizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between rounded-[18px] bg-stone-50/70 border border-stone-100 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white font-extrabold text-stone-500 text-xs border border-stone-200">
                          <FileQuestion size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 text-sm leading-tight">
                            {quiz.title}
                          </p>
                          <p className="mt-0.5 text-xs text-stone-400 leading-none">
                            {quiz.chapterTitle} · {quiz.questions.length} Soal
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${quiz.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-[#fff4e8] text-orange-600"}`}>
                          {quiz.isPublished ? "PUBLISHED" : "DRAFT"}
                        </span>
                        <Link href={`/admin/kursus/${course.id}/quiz/${quiz.id}?from=/admin/quiz`}>
                          <button className="h-[32px] px-3.5 rounded-[8px] bg-[#2563eb] border-0 text-[11px] font-bold text-white cursor-pointer hover:bg-[#1d4ed8]">
                            Kelola Soal
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

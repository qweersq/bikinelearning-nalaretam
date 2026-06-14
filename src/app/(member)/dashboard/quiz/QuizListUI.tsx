"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ClipboardList, Clock, Award, FileQuestion, ChevronRight, GraduationCap } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  timeLimit: number | null;
  courseSlug: string;
  courseTitle: string;
  categoryId: string;
  categoryName: string;
  thumbnail: string | null;
  questionCount: number;
  chapterTitle: string | null;
  moduleTitle: string | null;
  attemptCount: number;
  passed: boolean;
  bestScore: number | null;
  lastScore: number | null;
}

interface Props {
  quizzes: Quiz[];
  categories: Category[];
}

export default function QuizListUI({ quizzes, categories }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"ALL" | "FINAL_EXAM" | "CHAPTER_QUIZ">("ALL");

  const filtered = useMemo(() => {
    return quizzes.filter((q) => {
      const matchCat = activeCategory === null || q.categoryId === activeCategory;

      const isFinalExam = !q.chapterTitle;
      const matchType =
        activeType === "ALL" ||
        (activeType === "FINAL_EXAM" && isFinalExam) ||
        (activeType === "CHAPTER_QUIZ" && !isFinalExam);

      const matchSearch =
        search.trim() === "" ||
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
        (q.chapterTitle && q.chapterTitle.toLowerCase().includes(search.toLowerCase()));

      return matchCat && matchType && matchSearch;
    });
  }, [quizzes, activeCategory, activeType, search]);

  const handleStartFirstQuiz = () => {
    const targetList = filtered.length > 0 ? filtered : quizzes;
    const nextQuiz = targetList.find((q) => !q.passed) || targetList[0];
    if (nextQuiz) {
      if (nextQuiz.chapterTitle) {
        router.push(`/dashboard/quiz/${nextQuiz.courseSlug}/${nextQuiz.id}`);
      } else {
        router.push(`/dashboard/quiz/${nextQuiz.courseSlug}`);
      }
    }
  };

  const finalExamCount = quizzes.filter((q) => !q.chapterTitle).length;
  const chapterQuizCount = quizzes.filter((q) => q.chapterTitle).length;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[30px] font-extrabold text-stone-900">Latihan Soal & Kuis</h1>
        <p className="mt-1 text-[#8c8c8c]">Uji pemahaman belajarmu dengan latihan soal bab dan kuis kelulusan!</p>

        {/* Search */}
        <div className="mt-5 flex h-[56px] items-center gap-3 rounded-[18px] bg-white px-[18px] shadow-[0_5px_20px_rgba(0,0,0,.05)] border border-stone-50">
          <Search size={18} className="shrink-0 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kuis, bab, atau kelas..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400 text-stone-850"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-[10px] overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setActiveCategory(null)}
          className={`shrink-0 whitespace-nowrap rounded-full px-[18px] py-3 text-sm font-semibold transition-colors ${
            activeCategory === null ? "bg-[#2563eb] text-white" : "bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50"
          }`}
        >
          Semua Kategori
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`shrink-0 whitespace-nowrap rounded-full px-[18px] py-3 text-sm font-semibold transition-colors ${
              activeCategory === cat.id ? "bg-[#2563eb] text-white" : "bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Quiz Highlight Banner */}
      <div className="mt-[25px] rounded-[28px] bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] p-6 text-white shadow-[0_8px_30px_rgba(99,102,241,0.2)]">
        <p className="text-xs font-bold tracking-wider uppercase opacity-85">Evaluasi & Asah Pemahaman</p>
        <h2 className="mt-2 text-lg font-bold leading-snug">
          Uji pemahaman logismu untuk persiapan Penalaran Matematika UTBK!
        </h2>
        <button
          onClick={handleStartFirstQuiz}
          disabled={quizzes.length === 0}
          className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#4f46e5] transition-all hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mulai Kuis Pertama →
        </button>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="mt-7 flex border-b border-stone-200">
        <button
          onClick={() => setActiveType("ALL")}
          className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all ${
            activeType === "ALL"
              ? "border-[#2563eb] text-[#2563eb]"
              : "border-transparent text-stone-500 hover:text-stone-700"
          }`}
        >
          Semua ({quizzes.length})
        </button>
        <button
          onClick={() => setActiveType("FINAL_EXAM")}
          className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all flex items-center gap-1.5 ${
            activeType === "FINAL_EXAM"
              ? "border-indigo-600 text-indigo-650"
              : "border-transparent text-stone-500 hover:text-stone-700"
          }`}
        >
          <Award size={15} /> Try Out & Evaluasi ({finalExamCount})
        </button>
        <button
          onClick={() => setActiveType("CHAPTER_QUIZ")}
          className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all flex items-center gap-1.5 ${
            activeType === "CHAPTER_QUIZ"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-stone-500 hover:text-stone-700"
          }`}
        >
          <ClipboardList size={15} /> Latihan Soal Bab ({chapterQuizCount})
        </button>
      </div>

      {/* Quiz Card List */}
      <div className="mt-[20px] pb-12">
        <div className="mb-[15px] flex items-center justify-between">
          <h3 className="text-[20px] font-bold text-stone-900">
            {activeCategory || search ? "Hasil Filter" : activeType === "FINAL_EXAM" ? "Try Out & Evaluasi" : activeType === "CHAPTER_QUIZ" ? "Latihan Soal Bab" : "Daftar Soal & Kuis"}
          </h3>
          <span className="text-sm text-stone-400">{filtered.length} kuis ditemukan</span>
        </div>

        <div className="flex flex-col gap-[15px]">
          {filtered.map((quiz) => {
            const href = quiz.chapterTitle
              ? `/dashboard/quiz/${quiz.courseSlug}/${quiz.id}`
              : `/dashboard/quiz/${quiz.courseSlug}`;

            const isFinalExam = !quiz.chapterTitle;

            // Compute status badge
            let statusBadge = null;
            if (quiz.attemptCount > 0) {
              if (quiz.passed) {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-100">
                    Lulus ({quiz.bestScore}/100)
                  </span>
                );
              } else {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-extrabold text-orange-600 border border-orange-100">
                    Gagal ({quiz.bestScore}/100)
                  </span>
                );
              }
            } else {
              statusBadge = (
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-50 px-2 py-0.5 text-[10px] font-extrabold text-stone-500 border border-stone-100">
                  Belum Ada
                </span>
              );
            }

            return (
              <Link key={quiz.id} href={href} className="group">
                <div className={`flex gap-[15px] rounded-[22px] bg-white p-[14px] shadow-[0_5px_20px_rgba(0,0,0,.03)] transition-all duration-300 border hover:-translate-y-[1.5px] ${
                  isFinalExam 
                    ? "border-indigo-100/70 hover:border-indigo-200 hover:shadow-[0_8px_25px_rgba(99,102,241,0.06)]" 
                    : "border-amber-100/70 hover:border-amber-200 hover:shadow-[0_8px_25px_rgba(245,158,11,0.06)]"
                }`}>
                  {/* Thumbnail / Visual Icon */}
                  <div className="relative flex h-[90px] w-[90px] shrink-0 items-center justify-center overflow-hidden rounded-[18px]">
                    {quiz.thumbnail ? (
                      <img src={quiz.thumbnail} alt={quiz.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className={`flex h-full w-full items-center justify-center transition-colors duration-300 ${
                        isFinalExam ? "bg-gradient-to-br from-indigo-50 to-indigo-100/70 text-indigo-500" : "bg-gradient-to-br from-amber-50 to-amber-100/70 text-amber-500"
                      }`}>
                        {isFinalExam ? (
                          <Award size={32} strokeWidth={1.8} className="transition-transform duration-300 group-hover:scale-110" />
                        ) : (
                          <ClipboardList size={32} strokeWidth={1.8} className="transition-transform duration-300 group-hover:scale-110" />
                        )}
                      </div>
                    )}
                    {/* Small badge representing type icon overlay */}
                    <div className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm border ${
                      isFinalExam ? "border-indigo-50" : "border-amber-50"
                    }`}>
                      {isFinalExam ? (
                        <Award size={10} className="text-indigo-650" />
                      ) : (
                        <ClipboardList size={10} className="text-amber-500" />
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md border ${
                          isFinalExam 
                            ? "text-indigo-650 bg-indigo-50/50 border-indigo-100/30" 
                            : "text-amber-600 bg-amber-50/50 border-amber-100/30"
                        }`}>
                          {quiz.categoryName} · {isFinalExam ? "TO / EVALUASI" : "KUIS BAB"}
                        </span>
                        {statusBadge}
                      </div>
                      <h4 className={`mt-2 mb-0.5 text-[14px] font-extrabold leading-snug text-stone-900 transition-colors line-clamp-1 ${
                        isFinalExam ? "group-hover:text-indigo-650" : "group-hover:text-amber-600"
                      }`}>
                        {quiz.title}
                      </h4>
                      <p className="text-[11px] text-stone-400 line-clamp-1">
                        {isFinalExam ? `Kelas: ${quiz.courseTitle}` : `${quiz.chapterTitle} · ${quiz.courseTitle}`}
                      </p>
                    </div>

                    {/* Stats & CTA */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex gap-2.5 text-[10px] font-bold text-stone-400">
                        <span className="flex items-center gap-0.5">
                          <ClipboardList size={11} className="text-stone-300" />
                          {quiz.questionCount} Soal
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Award size={11} className="text-stone-300" />
                          KKM: {quiz.passingScore}%
                        </span>
                        {quiz.timeLimit ? (
                          <span className="flex items-center gap-0.5">
                            <Clock size={11} className="text-stone-300" />
                            {quiz.timeLimit} Mnt
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5">
                            <Clock size={11} className="text-stone-300" />
                            Santai
                          </span>
                        )}
                      </div>

                      <span className={`text-xs font-extrabold flex items-center gap-0.5 transition-all duration-300 group-hover:translate-x-0.5 ${
                        isFinalExam ? "text-indigo-600" : "text-amber-600"
                      }`}>
                        {quiz.attemptCount > 0 ? "Ulangi" : "Mulai"} <ChevronRight size={14} className="stroke-[2.5]" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-stone-250">
              <GraduationCap size={40} className="mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-semibold text-stone-500">Tidak ada kuis yang ditemukan.</p>
              <p className="text-xs text-stone-400 mt-1">Coba gunakan kata kunci pencarian atau kategori lain.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

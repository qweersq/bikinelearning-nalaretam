"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock, Trophy } from "lucide-react";

type Option = { id: string; text: string };
type Question = { id: string; question: string; type: "MULTIPLE_CHOICE" | "ESSAY"; options: Option[] };
type Quiz = { id: string; title: string; description: string | null; passingScore: number; timeLimit: number | null; questions: Question[] };
type Course = { id: string; title: string; slug: string };
type LastAttempt = { score: number; passed: boolean; completedAt: string };
type Result = { score: number; passed: boolean; passingScore: number; questionScores?: Record<string, { score: number; feedback?: string }> };

type Answers = Record<string, { selectedOptionId?: string; essayAnswer?: string }>;

type Phase = "intro" | "taking" | "result";

export default function QuizClient({ course, quiz, lastAttempt }: { course: Course; quiz: Quiz; lastAttempt: LastAttempt | null }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(quiz.timeLimit ? quiz.timeLimit * 60 : null);

  const submitQuiz = useCallback(async (answersToSubmit: Answers) => {
    setSubmitting(true);
    const payload = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: answersToSubmit[q.id]?.selectedOptionId,
      essayAnswer: answersToSubmit[q.id]?.essayAnswer,
    }));
    const res = await fetch(`/api/quiz/${course.slug}/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: payload }),
    });
    const data = await res.json();
    setResult(data);
    setPhase("result");
    setSubmitting(false);
  }, [quiz.questions, course.slug]);

  useEffect(() => {
    if (phase !== "taking" || timeLeft === null) return;
    if (timeLeft <= 0) { submitQuiz(answers); return; }
    const t = setTimeout(() => setTimeLeft((p) => (p ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, answers, submitQuiz]);

  function setAnswer(qId: string, field: "selectedOptionId" | "essayAnswer", value: string) {
    setAnswers((prev) => ({ ...prev, [qId]: { ...prev[qId], [field]: value } }));
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  const q = quiz.questions[current];
  const answered = Object.keys(answers).length;
  const total = quiz.questions.length;
  const progress = total > 0 ? Math.round((current / total) * 100) : 0;

  /* ── INTRO ── */
  if (phase === "intro") {
    return (
      <div>
        <div className="mb-5 flex items-center gap-3">
          <Link href={`/dashboard/modul/${course.slug}`}>
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <ArrowLeft size={18} className="text-stone-600" />
            </div>
          </Link>
          <div>
            <p className="text-xs text-stone-400">{course.title}</p>
            <h1 className="text-[20px] font-extrabold text-stone-900">{quiz.title}</h1>
          </div>
        </div>

        {/* Last attempt */}
        {lastAttempt && (
          <div className={`mb-4 rounded-[20px] p-4 ${lastAttempt.passed ? "bg-[#eff6ff]" : "bg-red-50"}`}>
            <div className="flex items-center gap-2">
              {lastAttempt.passed ? <CheckCircle size={18} className="text-[#2563eb]" /> : <XCircle size={18} className="text-red-500" />}
              <p className="text-sm font-bold text-stone-800">
                Percobaan terakhir: <span className={lastAttempt.passed ? "text-[#2563eb]" : "text-red-500"}>{lastAttempt.score}%</span>
                {lastAttempt.passed ? " — Lulus ✓" : " — Belum Lulus"}
              </p>
            </div>
          </div>
        )}

        {/* Quiz info */}
        <div className="mb-4 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          {quiz.description && <p className="mb-4 text-sm text-stone-500">{quiz.description}</p>}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Soal", value: total },
              { label: "Passing", value: `${quiz.passingScore}%` },
              { label: "Waktu", value: quiz.timeLimit ? `${quiz.timeLimit} mnt` : "∞" },
            ].map((s) => (
              <div key={s.label} className="rounded-[14px] bg-[#f8fafc] p-3 text-center">
                <p className="text-lg font-extrabold text-stone-800">{s.value}</p>
                <p className="mt-0.5 text-[11px] text-stone-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4 rounded-[16px] bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-700">Perhatian</p>
          <ul className="mt-1 list-disc pl-4 text-xs text-amber-600 space-y-1">
            <li>Jawab semua pertanyaan sebelum submit</li>
            <li>Essay dinilai otomatis oleh AI (skor 0–100)</li>
            {quiz.timeLimit && <li>Timer akan berjalan saat kamu mulai</li>}
          </ul>
        </div>

        {total === 0 ? (
          <p className="rounded-[16px] bg-stone-100 p-4 text-center text-sm text-stone-500">Quiz belum punya pertanyaan.</p>
        ) : (
          <button onClick={() => { setPhase("taking"); setCurrent(0); setAnswers({}); if (quiz.timeLimit) setTimeLeft(quiz.timeLimit * 60); }}
            className="h-[56px] w-full rounded-[16px] bg-[#2563eb] text-sm font-bold text-white">
            {lastAttempt ? "Coba Lagi" : "Mulai Quiz"}
          </button>
        )}
      </div>
    );
  }

  /* ── TAKING ── */
  if (phase === "taking" && q) {
    const isLast = current === total - 1;
    return (
      <div>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => setPhase("intro")} className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <ArrowLeft size={18} className="text-stone-600" />
          </button>
          <div className="flex items-center gap-3">
            {timeLeft !== null && (
              <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${timeLeft < 60 ? "bg-red-50 text-red-500" : "bg-[#f8fafc] text-stone-600"}`}>
                <Clock size={14} />
                {formatTime(timeLeft)}
              </div>
            )}
            <span className="text-sm font-semibold text-stone-400">{current + 1}/{total}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-[#f1f3f5]">
          <div className="h-full rounded-full bg-[#2563eb] transition-all" style={{ width: `${progress}%` }} />
        </div>

        {/* Question card */}
        <div className="mb-4 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-[#eff6ff] px-2.5 py-0.5 text-[11px] font-bold text-[#2563eb]">
              Soal {current + 1}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${q.type === "MULTIPLE_CHOICE" ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500"}`}>
              {q.type === "MULTIPLE_CHOICE" ? "Pilihan Ganda" : "Essay"}
            </span>
          </div>
          <p className="mt-3 text-base font-semibold text-stone-800 leading-snug">{q.question}</p>
        </div>

        {/* Options / Essay */}
        {q.type === "MULTIPLE_CHOICE" ? (
          <div className="space-y-3 mb-6">
            {q.options.map((opt, i) => {
              const selected = answers[q.id]?.selectedOptionId === opt.id;
              return (
                <button key={opt.id} onClick={() => setAnswer(q.id, "selectedOptionId", opt.id)}
                  className={`flex w-full items-center gap-3 rounded-[18px] p-4 text-left transition-colors ${
                    selected ? "bg-[#2563eb] text-white shadow-[0_4px_16px_rgba(15,157,88,0.25)]" : "bg-white text-stone-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                  }`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${selected ? "bg-white/20 text-white" : "bg-[#f1f3f5] text-stone-500"}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm font-medium">{opt.text}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mb-6">
            <textarea value={answers[q.id]?.essayAnswer ?? ""} onChange={(e) => setAnswer(q.id, "essayAnswer", e.target.value)}
              rows={5} placeholder="Tulis jawabanmu di sini..."
              className="w-full resize-none rounded-[18px] border border-[#f1f3f5] bg-white p-4 text-sm text-stone-700 outline-none focus:border-[#2563eb] shadow-[0_2px_8px_rgba(0,0,0,0.04)]" />
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex gap-3">
          {current > 0 && (
            <button onClick={() => setCurrent((c) => c - 1)}
              className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[16px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] text-stone-600">
              <ArrowLeft size={18} />
            </button>
          )}
          {!isLast ? (
            <button onClick={() => setCurrent((c) => c + 1)}
              className="flex h-[54px] flex-1 items-center justify-center gap-2 rounded-[16px] bg-[#2563eb] text-sm font-bold text-white">
              Berikutnya <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={() => submitQuiz(answers)} disabled={submitting}
              className="flex h-[54px] flex-1 items-center justify-center gap-2 rounded-[16px] bg-[#2563eb] text-sm font-bold text-white disabled:opacity-60">
              {submitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <><Trophy size={16} /> Submit Quiz</>
              )}
            </button>
          )}
        </div>

        {/* Answered count */}
        <p className="mt-4 text-center text-xs text-stone-400">{answered} dari {total} soal dijawab</p>
      </div>
    );
  }

  /* ── RESULT ── */
  if (phase === "result" && result) {
    return (
      <div>
        {/* Result card */}
        <div className={`mb-5 rounded-[28px] bg-gradient-to-br p-6 text-white ${result.passed ? "from-[#2563eb] to-[#3b82f6]" : "from-red-400 to-rose-500"}`}>
          <div className="mb-3 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
              {result.passed ? <CheckCircle size={40} className="text-white" /> : <XCircle size={40} className="text-white" />}
            </div>
          </div>
          <p className="text-center text-sm opacity-80">{result.passed ? "Selamat! Kamu lulus" : "Belum lulus, coba lagi"}</p>
          <p className="mt-1 text-center text-[48px] font-extrabold leading-none">{result.score}%</p>
          <p className="mt-2 text-center text-sm opacity-70">Passing score: {result.passingScore}%</p>
        </div>

        {result.passed && (
          <div className="mb-4 rounded-[20px] bg-amber-50 p-4 text-center">
            <Trophy size={24} className="mx-auto mb-2 text-amber-500" />
            <p className="font-bold text-stone-800">Sertifikat kamu sudah siap!</p>
            <p className="mt-0.5 text-xs text-stone-400">Jika semua modul selesai, sertifikat otomatis diterbitkan</p>
          </div>
        )}

        {/* Per-question review */}
        {result.questionScores && quiz.questions.length > 0 && (
          <div className="mb-4 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
            <h3 className="mb-3 font-bold text-stone-800">Rincian Jawaban</h3>
            <div className="space-y-3">
              {quiz.questions.map((q, i) => {
                const qs = result.questionScores?.[q.id];
                const score = qs?.score ?? null;
                return (
                  <div key={q.id} className="rounded-[14px] bg-[#f8fafc] p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[11px] font-bold text-[#2563eb]">{i + 1}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${q.type === "MULTIPLE_CHOICE" ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500"}`}>
                          {q.type === "MULTIPLE_CHOICE" ? "MCQ" : "Essay"}
                        </span>
                      </div>
                      {score !== null && (
                        <span className={`text-sm font-extrabold ${score >= 70 ? "text-[#2563eb]" : score >= 40 ? "text-amber-500" : "text-red-500"}`}>
                          {score}/100
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 leading-snug">{q.question}</p>
                    {q.type === "MULTIPLE_CHOICE" && score !== null && (
                      <p className="mt-1.5 text-[11px] font-semibold">{score === 100 ? <span className="text-[#2563eb]">✓ Benar</span> : <span className="text-red-500">✗ Salah</span>}</p>
                    )}
                    {q.type === "ESSAY" && qs?.feedback && (
                      <p className="mt-2 rounded-[8px] bg-white px-3 py-2 text-[11px] text-stone-500 border border-stone-100">{qs.feedback}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button onClick={() => setPhase("intro")}
            className="h-[52px] w-full rounded-[16px] bg-[#f4f6f8] text-sm font-bold text-stone-700">
            {result.passed ? "Kerjakan Lagi" : "Coba Lagi"}
          </button>
          {result.passed && (
            <Link href="/dashboard/sertifikat">
              <button className="h-[52px] w-full rounded-[16px] bg-[#2563eb] text-sm font-bold text-white">
                Lihat Sertifikat
              </button>
            </Link>
          )}
          <Link href={`/dashboard/modul/${course.slug}`}>
            <button className="h-[52px] w-full rounded-[16px] bg-white text-sm font-semibold text-stone-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              Kembali ke Modul
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

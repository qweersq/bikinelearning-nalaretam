"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";

type Option = { id?: string; text: string; isCorrect: boolean };
type Question = { id: string; question: string; type: "MULTIPLE_CHOICE" | "ESSAY"; order: number; options: (Option & { id: string })[] };
export type AttemptAnswer = { questionId: string; selectedOptionId?: string; essayAnswer?: string; aiScore?: number; aiFeedback?: string };
type Attempt = {
  id: string; score: number | null; passed: boolean; completedAt: string;
  answers: AttemptAnswer[];
  user: { id: string; name: string; email: string };
};
type Quiz = {
  id: string; courseId: string; title: string; description: string | null;
  passingScore: number; timeLimit: number | null; isPublished: boolean;
  questions: Question[];
  attempts: Attempt[];
};

export default function QuizEditClient({ courseId, quiz: initialQuiz }: { courseId: string; quiz: Quiz }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState(initialQuiz);
  const [editForm, setEditForm] = useState({
    title: initialQuiz.title,
    description: initialQuiz.description ?? "",
    passingScore: initialQuiz.passingScore,
    timeLimit: initialQuiz.timeLimit ? String(initialQuiz.timeLimit) : "",
    isPublished: initialQuiz.isPublished,
  });
  const [savingInfo, setSavingInfo] = useState(false);
  const [showAddQ, setShowAddQ] = useState(false);
  const [newQ, setNewQ] = useState<{ question: string; type: "MULTIPLE_CHOICE" | "ESSAY"; options: Option[]; expectedAnswer: string }>({
    question: "", type: "MULTIPLE_CHOICE", expectedAnswer: "",
    options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }],
  });
  const [addingQ, setAddingQ] = useState(false);
  const [deletingQ, setDeletingQ] = useState<string | null>(null);
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);

  async function saveQuizInfo() {
    setSavingInfo(true);
    await fetch(`/api/admin/quiz/${quiz.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editForm.title,
        description: editForm.description || undefined,
        passingScore: editForm.passingScore,
        timeLimit: editForm.timeLimit ? Number(editForm.timeLimit) : undefined,
        isPublished: editForm.isPublished,
      }),
    });
    setSavingInfo(false);
    router.refresh();
  }

  async function addQuestion() {
    if (!newQ.question.trim()) return;
    setAddingQ(true);
    const res = await fetch(`/api/admin/quiz/${quiz.id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: newQ.question,
        type: newQ.type,
        order: quiz.questions.length,
        options: newQ.type === "MULTIPLE_CHOICE" ? newQ.options.filter((o) => o.text.trim()) : undefined,
        expectedAnswer: newQ.type === "ESSAY" ? newQ.expectedAnswer : undefined,
      }),
    });
    const q = await res.json();
    setQuiz((prev) => ({ ...prev, questions: [...prev.questions, q] }));
    setNewQ({ question: "", type: "MULTIPLE_CHOICE", expectedAnswer: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }] });
    setShowAddQ(false);
    setAddingQ(false);
  }

  async function deleteQuestion(qId: string) {
    setDeletingQ(qId);
    await fetch(`/api/admin/quiz/${quiz.id}/questions/${qId}`, { method: "DELETE" });
    setQuiz((prev) => ({ ...prev, questions: prev.questions.filter((q) => q.id !== qId) }));
    setDeletingQ(null);
  }

  function setNewQOption(i: number, field: keyof Option, value: unknown) {
    setNewQ((prev) => {
      const opts = [...prev.options];
      if (field === "isCorrect") {
        // only one correct at a time for MCQ
        opts.forEach((o, idx) => { opts[idx] = { ...o, isCorrect: idx === i }; });
      } else {
        opts[i] = { ...opts[i], [field]: value };
      }
      return { ...prev, options: opts };
    });
  }

  const attempts = quiz.attempts;
  const passedCount = attempts.filter((a) => a.passed).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link href={`/admin/kursus/${courseId}/quiz`}>
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <ArrowLeft size={18} className="text-stone-600" />
          </div>
        </Link>
        <h1 className="text-[22px] font-extrabold text-stone-900">Edit Quiz</h1>
      </div>

      {/* Quiz Info Edit */}
      <div className="mb-4 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <h3 className="mb-4 font-bold text-stone-900">Informasi Quiz</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-500">Judul Quiz</label>
            <input
              value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-500">Deskripsi</label>
            <textarea
              value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              rows={2} className="w-full resize-none rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Passing Score (%)</label>
              <input type="number" min={0} max={100}
                value={editForm.passingScore} onChange={(e) => setEditForm((f) => ({ ...f, passingScore: Number(e.target.value) }))}
                className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Time (menit)</label>
              <input type="number" min={1} placeholder="∞"
                value={editForm.timeLimit} onChange={(e) => setEditForm((f) => ({ ...f, timeLimit: e.target.value }))}
                className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]"
              />
            </div>
          </div>
          <div className="flex gap-3">
            {[{ label: "Draft", value: false }, { label: "Published", value: true }].map((opt) => (
              <button key={String(opt.value)} type="button"
                onClick={() => setEditForm((f) => ({ ...f, isPublished: opt.value }))}
                className={`flex-1 rounded-[12px] py-2.5 text-sm font-bold transition-colors ${editForm.isPublished === opt.value ? "bg-[#2563eb] text-white" : "bg-[#f8fafc] text-stone-500"}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={saveQuizInfo} disabled={savingInfo}
            className="h-[44px] w-full rounded-[12px] bg-[#2563eb] text-sm font-bold text-white disabled:opacity-60">
            {savingInfo ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: "Attempts", value: attempts.length },
          { label: "Passed", value: passedCount },
          { label: "Questions", value: quiz.questions.length },
        ].map((s) => (
          <div key={s.label} className="rounded-[20px] bg-white p-4 shadow-[0_5px_20px_rgba(0,0,0,0.04)] text-center">
            <p className="text-xl font-extrabold text-[#2563eb]">{s.value}</p>
            <p className="mt-1 text-[10px] text-stone-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Questions */}
      <div className="mb-4 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-stone-900">Pertanyaan ({quiz.questions.length})</h3>
          <button onClick={() => setShowAddQ((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563eb]">
            <Plus size={18} className="text-white" />
          </button>
        </div>

        {/* Add Question Form */}
        {showAddQ && (
          <div className="mb-4 rounded-[16px] border border-[#eff6ff] bg-[#eff6ff] p-4">
            <p className="mb-3 text-sm font-bold text-stone-800">Tambah Pertanyaan</p>
            <textarea
              value={newQ.question} onChange={(e) => setNewQ((p) => ({ ...p, question: e.target.value }))}
              rows={3} placeholder="Tulis pertanyaan di sini..."
              className="mb-3 w-full resize-none rounded-[12px] border border-[#d1f0e0] bg-white px-4 py-3 text-sm outline-none"
            />
            <div className="mb-3 flex gap-2">
              {(["MULTIPLE_CHOICE", "ESSAY"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setNewQ((p) => ({ ...p, type: t }))}
                  className={`flex-1 rounded-[10px] py-2 text-xs font-bold transition-colors ${newQ.type === t ? "bg-[#2563eb] text-white" : "bg-white text-stone-500 border border-stone-200"}`}>
                  {t === "MULTIPLE_CHOICE" ? "Multiple Choice" : "Essay"}
                </button>
              ))}
            </div>

            {newQ.type === "ESSAY" && (
              <div className="mb-3">
                <p className="mb-1.5 text-[11px] font-semibold text-stone-500">Rubrik / Jawaban yang Diharapkan (untuk AI grading)</p>
                <textarea
                  value={newQ.expectedAnswer}
                  onChange={(e) => setNewQ((p) => ({ ...p, expectedAnswer: e.target.value }))}
                  rows={3} placeholder="Tulis poin-poin jawaban yang diharapkan. AI akan menilai berdasarkan ini..."
                  className="w-full resize-none rounded-[12px] border border-[#d1f0e0] bg-white px-4 py-3 text-sm outline-none focus:border-[#2563eb]"
                />
                <p className="mt-1 text-[10px] text-stone-400">Semakin detail rubrik, semakin akurat penilaian AI.</p>
              </div>
            )}

            {newQ.type === "MULTIPLE_CHOICE" && (
              <div className="mb-3 space-y-2">
                <p className="text-[11px] font-semibold text-stone-500">Pilihan Jawaban (klik icon untuk tandai benar)</p>
                {newQ.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button type="button" onClick={() => setNewQOption(i, "isCorrect", true)}>
                      {opt.isCorrect
                        ? <CheckCircle size={18} className="shrink-0 text-[#2563eb]" />
                        : <XCircle size={18} className="shrink-0 text-stone-300" />}
                    </button>
                    <input
                      value={opt.text} onChange={(e) => setNewQOption(i, "text", e.target.value)}
                      placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                      className="flex-1 rounded-[10px] border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2563eb]"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setShowAddQ(false)}
                className="flex-1 rounded-[12px] bg-stone-100 py-2.5 text-sm font-bold text-stone-600">
                Batal
              </button>
              <button onClick={addQuestion} disabled={addingQ}
                className="flex-1 rounded-[12px] bg-[#2563eb] py-2.5 text-sm font-bold text-white disabled:opacity-60">
                {addingQ ? "Menyimpan..." : "Tambah"}
              </button>
            </div>
          </div>
        )}

        {/* Question List */}
        {quiz.questions.length === 0 && !showAddQ ? (
          <p className="py-4 text-center text-sm text-stone-400">Belum ada pertanyaan. Klik + untuk menambah.</p>
        ) : (
          <div className="space-y-3">
            {quiz.questions.map((q, i) => (
              <div key={q.id} className="rounded-[14px] bg-[#f8fafc] p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[11px] font-bold text-[#2563eb]">{i + 1}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${q.type === "MULTIPLE_CHOICE" ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500"}`}>
                      {q.type === "MULTIPLE_CHOICE" ? "MCQ" : "Essay"}
                    </span>
                  </div>
                  <button onClick={() => deleteQuestion(q.id)} disabled={deletingQ === q.id}
                    className="shrink-0 rounded-full p-1.5 text-red-400 hover:bg-red-50 disabled:opacity-40">
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-sm text-stone-700">{q.question}</p>
                {q.type === "MULTIPLE_CHOICE" && (
                  <div className="mt-2.5 space-y-1.5">
                    {q.options.map((opt) => (
                      <div key={opt.id} className={`flex items-center gap-2 rounded-[8px] px-3 py-2 text-xs ${opt.isCorrect ? "bg-[#eff6ff] text-[#2563eb] font-semibold" : "bg-white text-stone-500"}`}>
                        {opt.isCorrect ? <CheckCircle size={12} /> : <XCircle size={12} className="text-stone-300" />}
                        {opt.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attempt Review */}
      {quiz.attempts.length > 0 && (
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Hasil Pengerjaan ({quiz.attempts.length})</h3>
          <div className="space-y-3">
            {quiz.attempts.map((attempt) => {
              const isOpen = expandedAttempt === attempt.id;
              const answers = Array.isArray(attempt.answers) ? (attempt.answers as AttemptAnswer[]) : [];
              return (
                <div key={attempt.id} className="rounded-[14px] border border-[#f1f3f5] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedAttempt(isOpen ? null : attempt.id)}
                    className="flex w-full items-center justify-between gap-3 bg-[#f8fafc] px-4 py-3 text-left"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-800">{attempt.user.name || attempt.user.email}</p>
                      <p className="text-[11px] text-stone-400">{new Date(attempt.completedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${attempt.passed ? "bg-[#eff6ff] text-[#2563eb]" : "bg-red-50 text-red-500"}`}>
                        {attempt.score}% {attempt.passed ? "Lulus" : "Gagal"}
                      </span>
                      {isOpen ? <ChevronUp size={14} className="text-stone-400" /> : <ChevronDown size={14} className="text-stone-400" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="divide-y divide-[#f1f3f5] bg-white">
                      {quiz.questions.map((q, qi) => {
                        const ans = answers.find((a) => a.questionId === q.id);
                        const correctOpt = q.options.find((o) => o.isCorrect);
                        return (
                          <div key={q.id} className="px-4 py-3">
                            <div className="mb-1.5 flex items-center gap-2">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[10px] font-bold text-[#2563eb]">{qi + 1}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${q.type === "MULTIPLE_CHOICE" ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500"}`}>
                                {q.type === "MULTIPLE_CHOICE" ? "MCQ" : "Essay"}
                              </span>
                              {ans?.aiScore !== undefined && (
                                <span className={`ml-auto text-xs font-extrabold ${(ans.aiScore ?? 0) >= 70 ? "text-[#2563eb]" : (ans.aiScore ?? 0) >= 40 ? "text-amber-500" : "text-red-500"}`}>
                                  {ans.aiScore}/100
                                </span>
                              )}
                            </div>
                            <p className="mb-2 text-xs font-medium text-stone-700">{q.question}</p>
                            {q.type === "MULTIPLE_CHOICE" ? (
                              <div className="space-y-1">
                                {q.options.map((opt) => {
                                  const selected = ans?.selectedOptionId === opt.id;
                                  const correct = opt.isCorrect;
                                  let cls = "bg-[#f8fafc] text-stone-500";
                                  if (selected && correct) cls = "bg-[#eff6ff] text-[#2563eb] font-semibold";
                                  else if (selected && !correct) cls = "bg-red-50 text-red-500 font-semibold";
                                  else if (!selected && correct) cls = "bg-[#eff6ff] text-[#2563eb]";
                                  return (
                                    <div key={opt.id} className={`flex items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-[11px] ${cls}`}>
                                      {correct ? <CheckCircle size={11} /> : selected ? <XCircle size={11} /> : <span className="h-[11px] w-[11px]" />}
                                      {opt.text}
                                      {selected && !correct && <span className="ml-auto text-[10px]">Jawaban siswa</span>}
                                      {!selected && correct && <span className="ml-auto text-[10px]">Jawaban benar</span>}
                                    </div>
                                  );
                                })}
                                {!ans?.selectedOptionId && <p className="text-[11px] text-stone-400 italic">Tidak dijawab</p>}
                              </div>
                            ) : (
                              <div>
                                <p className="rounded-[8px] bg-[#f8fafc] px-3 py-2 text-[11px] text-stone-600 italic">
                                  {ans?.essayAnswer?.trim() ? `"${ans.essayAnswer}"` : "Tidak dijawab"}
                                </p>
                                {ans?.aiFeedback && (
                                  <p className="mt-1.5 rounded-[8px] bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                                    <span className="font-semibold">Feedback AI: </span>{ans.aiFeedback}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

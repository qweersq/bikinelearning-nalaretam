"use client";

import { useState } from "react";
import { CheckCircle2, ArrowRight, BookOpen, Trophy } from "lucide-react";

interface Props {
  moduleId: string;
  isCompleted: boolean;
  nextSlug: string | null;
  courseSlug: string;
}

export default function MarkCompleteButton({ moduleId, isCompleted, nextSlug, courseSlug }: Props) {
  const [done, setDone] = useState(isCompleted);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function markComplete() {
    if (done || loading) return;
    setLoading(true);
    await fetch(`/api/progress/${moduleId}`, { method: "POST" });
    setDone(true);
    setLoading(false);
  }

  async function handleConfirm() {
    setShowModal(false);
    await markComplete();
    const dest = nextSlug
      ? `/dashboard/modul/${courseSlug}/${nextSlug}`
      : `/dashboard/modul/${courseSlug}`;
    window.location.href = dest;
  }

  function handleSkip() {
    setShowModal(false);
    const dest = nextSlug
      ? `/dashboard/modul/${courseSlug}/${nextSlug}`
      : `/dashboard/modul/${courseSlug}`;
    window.location.href = dest;
  }

  const isLast = !nextSlug;
  const destLabel = isLast ? "Selesaikan Kursus" : "Pelajaran Berikutnya";

  return (
    <>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />

          {/* Sheet */}
          <div className="relative mx-auto w-full max-w-[768px] rounded-t-[28px] bg-white p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.12)]">
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full ${isLast ? "bg-amber-50" : "bg-[#eff6ff]"}`}>
                {isLast
                  ? <Trophy size={28} className="text-amber-500" />
                  : <BookOpen size={28} className="text-[#2563eb]" />}
              </div>
            </div>

            {isLast ? (
              <>
                <h2 className="mb-1.5 text-center text-lg font-extrabold text-stone-900">
                  Ini pelajaran terakhir! 🎉
                </h2>
                <p className="mb-6 text-center text-sm leading-relaxed text-stone-400">
                  Tandai materi ini selesai untuk menyelesaikan kursus dan membuka peluang mendapatkan sertifikat.
                </p>
              </>
            ) : (
              <>
                <h2 className="mb-1.5 text-center text-lg font-extrabold text-stone-900">
                  Sudah selesai belajar?
                </h2>
                <p className="mb-6 text-center text-sm leading-relaxed text-stone-400">
                  Tandai materi ini sebagai selesai sebelum lanjut ke pelajaran berikutnya.
                </p>
              </>
            )}

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`flex h-[54px] w-full items-center justify-center gap-2 rounded-[16px] text-sm font-bold text-white shadow-[0_6px_16px_rgba(37,99,235,0.3)] disabled:opacity-60 ${isLast ? "bg-gradient-to-r from-[#2563eb] to-[#3b82f6]" : "bg-[#2563eb]"}`}
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : isLast ? (
                  <><Trophy size={16} /> Tandai Selesai & Selesaikan Kursus</>
                ) : (
                  <><CheckCircle2 size={16} /> Tandai Selesai & Lanjut</>
                )}
              </button>

              {!done && (
                <button
                  onClick={handleSkip}
                  className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[16px] bg-stone-100 text-sm font-semibold text-stone-600"
                >
                  {isLast ? "Selesaikan Tanpa Tandai" : "Lanjut Tanpa Tandai"}
                </button>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="h-[44px] w-full rounded-[16px] text-sm font-semibold text-stone-400"
              >
                Belum, Kembali Belajar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed bottom bar */}
      <div className="fixed bottom-5 left-1/2 w-[728px] max-w-[calc(100%-40px)] -translate-x-1/2">
        <div className="flex gap-3 rounded-[24px] bg-white p-3.5 shadow-[0_10px_30px_rgba(0,0,0,.08)]">
          {/* Mark complete */}
          <button
            onClick={markComplete}
            disabled={done || loading}
            className={`flex h-[54px] flex-1 items-center justify-center gap-2 rounded-[16px] text-sm font-bold transition-colors ${
              done ? "bg-[#eff6ff] text-[#2563eb]" : "bg-stone-100 text-stone-700"
            } disabled:opacity-70`}
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
            ) : (
              <>
                <CheckCircle2 size={17} />
                {done ? "Selesai ✓" : "Tandai Selesai"}
              </>
            )}
          </button>

          {/* Next / Finish */}
          <button
            onClick={() => setShowModal(true)}
            className="flex h-[54px] flex-1 items-center justify-center gap-2 rounded-[16px] bg-[#2563eb] text-sm font-bold text-white"
          >
            {destLabel} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

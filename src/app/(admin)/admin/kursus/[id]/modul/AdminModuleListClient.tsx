"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Play, Edit, Trash2, X, AlertCircle, FileQuestion } from "lucide-react";

type Module = {
  id: string;
  title: string;
  slug: string;
  duration: number;
  isPublished: boolean;
  order: number;
};

type Quiz = {
  id: string;
  title: string;
  isPublished: boolean;
};

type Chapter = {
  id: string;
  title: string;
  order: number;
  modules: Module[];
  quizzes: Quiz[];
};

type Props = {
  courseId: string;
  courseTitle: string;
  courseDescription: string | null;
  courseSlug: string;
  studentCount: number;
  initialChapters: Chapter[];
  finalQuizzes: Quiz[];
};

export default function AdminModuleListClient({
  courseId,
  courseTitle,
  courseDescription,
  courseSlug,
  studentCount,
  initialChapters,
  finalQuizzes,
}: Props) {
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalModules = chapters.reduce((sum, ch) => sum + ch.modules.length, 0);

  function openCreateModal() {
    setModalMode("CREATE");
    setChapterTitle("");
    setError("");
    setShowModal(true);
  }

  function openEditModal(chapter: Chapter) {
    setModalMode("EDIT");
    setActiveChapterId(chapter.id);
    setChapterTitle(chapter.title);
    setError("");
    setShowModal(true);
  }

  async function handleSaveChapter() {
    if (!chapterTitle.trim()) {
      setError("Judul Bab tidak boleh kosong.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      if (modalMode === "CREATE") {
        const res = await fetch("/api/admin/chapters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: chapterTitle,
            courseId,
            order: chapters.length + 1,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Gagal membuat Bab.");
        } else {
          setChapters([...chapters, { ...data, modules: [] }]);
          setShowModal(false);
          router.refresh();
        }
      } else {
        const res = await fetch(`/api/admin/chapters/${activeChapterId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: chapterTitle,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Gagal mengubah Bab.");
        } else {
          setChapters(
            chapters.map((ch) =>
              ch.id === activeChapterId ? { ...ch, title: data.title } : ch
            )
          );
          setShowModal(false);
          router.refresh();
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteChapter(chapterId: string, title: string) {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus Bab "${title}"? Semua sub-bab, kuis, dan konten di dalamnya juga akan terhapus permanen.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/chapters/${chapterId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setChapters(chapters.filter((ch) => ch.id !== chapterId));
        router.refresh();
      } else {
        alert("Gagal menghapus Bab.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/admin/kursus/${courseId}`}>
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-stone-50 transition-colors">
              <ArrowLeft size={18} className="text-stone-600" />
            </div>
          </Link>
          <h1 className="text-[26px] font-extrabold text-stone-900">Kurikulum Belajar</h1>
        </div>
        <button
          onClick={openCreateModal}
          className="flex h-[48px] items-center gap-2 rounded-full px-5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-colors border-0 cursor-pointer"
        >
          <Plus size={16} />
          Bab Utama Baru
        </button>
      </div>

      {/* Course Info */}
      <div className="mb-6 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <span className="text-xs font-bold text-[#2563eb] uppercase tracking-wider">Materi Kelas</span>
        <h2 className="mt-1 text-[22px] font-extrabold text-stone-900 leading-snug">{courseTitle}</h2>
        {courseDescription && (
          <p className="mt-2 text-sm leading-relaxed text-stone-400">{courseDescription}</p>
        )}
        <div className="mt-4 flex gap-3">
          {[
            { label: "Total Bab Utama", value: chapters.length },
            { label: "Total Sub-bab", value: totalModules },
            { label: "Total Siswa", value: studentCount },
          ].map((s) => (
            <div key={s.label} className="flex-1 rounded-[14px] bg-[#f8fafc] p-3 text-center border border-stone-50">
              <p className="font-extrabold text-[#2563eb] text-lg leading-tight">{s.value}</p>
              <p className="mt-1 text-[11px] text-stone-400 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chapter & Module List */}
      <h2 className="mb-4 text-xl font-bold text-stone-800">Daftar Bab & Konten</h2>

      {chapters.length === 0 ? (
        <div className="rounded-[24px] bg-white p-12 text-center shadow-[0_5px_20px_rgba(0,0,0,0.04)] text-stone-400">
          <Play size={40} className="mx-auto mb-3 text-stone-200" />
          <h3 className="font-bold text-stone-700 mb-1">Belum ada Bab Utama</h3>
          <p className="text-sm max-w-xs mx-auto mb-4">Mulai dengan membuat Bab Utama baru, kemudian tambahkan sub-bab/konsep di dalamnya.</p>
          <button
            onClick={openCreateModal}
            className="h-[42px] px-5 rounded-[12px] bg-[#2563eb] text-white text-xs font-bold border-0 cursor-pointer"
          >
            + Buat Bab Utama
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {chapters.map((chapter, chapterIdx) => (
            <div key={chapter.id} className="rounded-[24px] border-2 border-[#edf1f5] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.02)]">
              {/* Chapter Header */}
              <div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eff6ff] text-xs font-extrabold text-[#2563eb]">
                    {chapterIdx + 1}
                  </span>
                  <h3 className="text-base font-extrabold text-stone-800 leading-tight">{chapter.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(chapter)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-50 border-0 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteChapter(chapter.id, chapter.title)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 border-0 text-red-400 hover:bg-red-100 hover:text-red-600 cursor-pointer transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Modules List inside Chapter */}
              {chapter.modules.length === 0 ? (
                <div className="py-6 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl mb-4 bg-stone-50/50">
                  Belum ada sub-bab di dalam Bab ini.
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {chapter.modules.map((mod) => (
                    <div
                      key={mod.id}
                      className="flex items-center gap-3 rounded-[16px] bg-stone-50/70 p-4 border border-stone-100"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white font-extrabold text-stone-500 text-xs border border-stone-200">
                        {mod.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-stone-900 text-sm truncate leading-tight">{mod.title}</p>
                        <p className="mt-0.5 text-xs text-stone-400 leading-none">{mod.duration} menit</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            mod.isPublished
                              ? "bg-[#e8f8ee] text-[#115e59]"
                              : "bg-[#fff4e8] text-orange-600"
                          }`}
                        >
                          {mod.isPublished ? "PUBLISHED" : "DRAFT"}
                        </span>
                        <Link href={`/dashboard/modul/${courseSlug}/${mod.slug}`} target="_blank">
                          <button className="h-[32px] px-3.5 rounded-[8px] bg-white border border-stone-200 text-[11px] font-bold text-stone-600 cursor-pointer hover:bg-stone-50">
                            Preview
                          </button>
                        </Link>
                        <Link href={`/admin/kursus/${courseId}/modul/${mod.id}/edit`}>
                          <button className="h-[32px] px-3.5 rounded-[8px] bg-[#2563eb] border-0 text-[11px] font-bold text-white cursor-pointer hover:bg-[#1d4ed8]">
                            Edit
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Latihan Soal (Quizzes) List inside Chapter */}
              {chapter.quizzes && chapter.quizzes.length > 0 && (
                <div className="space-y-3 mb-4 mt-4 border-t border-stone-100 pt-4">
                  <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">
                    Latihan Soal (Quiz)
                  </div>
                  {chapter.quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center gap-3 rounded-[16px] bg-indigo-50/30 p-4 border border-indigo-100/50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white font-extrabold text-indigo-500 text-xs border border-indigo-200">
                        <FileQuestion size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-stone-900 text-sm truncate leading-tight">{quiz.title}</p>
                        <p className="mt-0.5 text-xs text-stone-400 leading-none">Latihan Soal Evaluasi Bab</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            quiz.isPublished
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-[#fff4e8] text-orange-600 border border-orange-200"
                          }`}
                        >
                          {quiz.isPublished ? "PUBLISHED" : "DRAFT"}
                        </span>
                        <Link href={`/dashboard/quiz/${courseSlug}/${quiz.id}`} target="_blank">
                          <button className="h-[32px] px-3.5 rounded-[8px] bg-white border border-stone-200 text-[11px] font-bold text-stone-600 cursor-pointer hover:bg-stone-50">
                            Preview
                          </button>
                        </Link>
                        <Link href={`/admin/kursus/${courseId}/quiz/${quiz.id}`}>
                          <button className="h-[32px] px-3.5 rounded-[8px] bg-indigo-600 border-0 text-[11px] font-bold text-white cursor-pointer hover:bg-indigo-750 hover:bg-indigo-700">
                            Edit
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Sub-bab / Quiz inside Chapter buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/admin/kursus/${courseId}/modul/tambah?chapterId=${chapter.id}`} className="flex-1">
                  <button className="w-full flex h-[44px] items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-stone-300 bg-white text-xs font-bold text-stone-500 hover:bg-stone-50 cursor-pointer transition-colors">
                    <Plus size={14} /> Tambah Sub-bab Baru
                  </button>
                </Link>
                <Link href={`/admin/kursus/${courseId}/quiz/tambah?chapterId=${chapter.id}`} className="flex-1">
                  <button className="w-full flex h-[44px] items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-indigo-300 bg-indigo-50/20 text-xs font-bold text-indigo-600 hover:bg-indigo-100/40 cursor-pointer transition-colors">
                    <Plus size={14} /> Tambah Latihan Soal
                  </button>
                </Link>
              </div>
            </div>
          ))}

          {/* Evaluasi Akhir (Course-Wide Quiz) Section */}
          <div className="mb-4 mt-8 flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="text-xl font-bold text-stone-800">Evaluasi Akhir Kelas (Ujian Kelulusan)</h2>
            <Link href={`/admin/kursus/${courseId}/quiz/tambah`}>
              <button className="h-[32px] px-3.5 rounded-[10px] bg-[#2563eb] text-xs font-bold text-white hover:bg-[#1d4ed8] cursor-pointer flex items-center gap-1.5 border-0">
                <Plus size={13} /> Tambah Evaluasi
              </button>
            </Link>
          </div>

          {finalQuizzes.length === 0 ? (
            <div className="rounded-[24px] border-2 border-dashed border-stone-350 bg-white p-8 text-center text-stone-400 shadow-[0_5px_20px_rgba(0,0,0,0.02)]">
              <FileQuestion size={36} className="mx-auto mb-2 text-stone-300" />
              <h4 className="font-bold text-stone-700 mb-1">Belum ada Kuis Kelulusan</h4>
              <p className="text-xs text-stone-400 mb-4">Buat evaluasi akhir untuk menguji pemahaman total siswa sebelum penerbitan sertifikat.</p>
              <Link href={`/admin/kursus/${courseId}/quiz/tambah`}>
                <button className="h-[40px] px-5 rounded-[12px] bg-[#2563eb] text-white text-xs font-bold border-0 cursor-pointer hover:bg-[#1d4ed8]">
                  + Buat Evaluasi Akhir
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {finalQuizzes.map((quiz) => (
                <div key={quiz.id} className="rounded-[24px] border-2 border-dashed border-blue-200 bg-[#eff6ff]/30 p-5 shadow-[0_5px_20px_rgba(37,99,235,0.02)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-extrabold text-[#2563eb] text-sm border border-blue-200">
                        <FileQuestion size={18} />
                      </div>
                      <div>
                        <p className="font-extrabold text-stone-900 text-sm leading-tight">{quiz.title}</p>
                        <p className="mt-0.5 text-xs text-stone-400 leading-none">Ujian evaluasi kelulusan kelas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          quiz.isPublished
                            ? "bg-[#e8f8ee] text-[#115e59]"
                            : "bg-[#fff4e8] text-orange-600"
                        }`}
                      >
                        {quiz.isPublished ? "PUBLISHED" : "DRAFT"}
                      </span>
                      <Link href={`/dashboard/quiz/${courseSlug}/${quiz.id}`} target="_blank">
                        <button className="h-[32px] px-3.5 rounded-[8px] bg-white border border-stone-200 text-[11px] font-bold text-stone-600 cursor-pointer hover:bg-stone-50">
                          Preview
                        </button>
                      </Link>
                      <Link href={`/admin/kursus/${courseId}/quiz/${quiz.id}`}>
                        <button className="h-[32px] px-3.5 rounded-[8px] bg-[#2563eb] border-0 text-[11px] font-bold text-white cursor-pointer hover:bg-[#1d4ed8]">
                          Edit
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Chapter Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-stone-50 border-0 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-stone-900 mb-4">
              {modalMode === "CREATE" ? "Tambah Bab Utama Baru" : "Edit Judul Bab"}
            </h3>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-5">
              <label className="mb-2 block text-xs font-bold text-stone-500 uppercase tracking-wider">Judul Bab</label>
              <input
                type="text"
                placeholder="e.g. Bab 1: Bilangan"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="h-[48px] w-full rounded-[12px] border-2 border-[#edf1f5] px-3.5 text-sm outline-none focus:border-[#2563eb]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 h-[44px] rounded-[12px] bg-stone-100 text-stone-600 text-xs font-bold border-0 cursor-pointer hover:bg-stone-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveChapter}
                disabled={loading}
                className="flex-1 h-[44px] rounded-[12px] bg-[#2563eb] text-white text-xs font-bold border-0 cursor-pointer hover:bg-[#1d4ed8] disabled:opacity-60"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

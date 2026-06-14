"use client";

import { useState, useEffect, use, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, ChevronUp, ChevronDown, Code, Eye, Globe, Video, FileText } from "lucide-react";
import dynamic from "next/dynamic";

const YoutubeIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
  >
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p className="text-stone-400 text-xs p-4 bg-stone-50 rounded-xl border border-stone-100">Loading editor...</p>,
});
import "react-quill-new/dist/quill.snow.css";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
];

function toSlug(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}


type Widget = {
  id?: string;
  type: "HTML_JS" | "IFRAME" | "VIDEO" | "TEXT";
  title?: string;
  htmlCode?: string;
  jsCode?: string;
  cssCode?: string;
  iframeUrl?: string; // Menyimpan URL iframe atau YouTube Video ID
  order: number;
};

function CreateModuleForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialChapterId = searchParams.get("chapterId") || "";

  const [form, setForm] = useState({
    title: "",
    slug: "",
    duration: "",
    description: "",
    order: "1",
    isPublished: true,
  });

  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);

  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [activeTabs, setActiveTabs] = useState<Record<number, "HTML" | "CSS" | "JS" | "PREVIEW">>({});

  const [totalModules, setTotalModules] = useState<number | null>(null);
  const [orderError, setOrderError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/kursus/${courseId}`)
      .then((r) => r.json())
      .then((data) => {
        const list = data.chapters || [];
        setChapters(list);
        if (!selectedChapterId && list.length > 0) {
          setSelectedChapterId(list[0].id);
        }
      });
  }, [courseId, selectedChapterId]);

  useEffect(() => {
    if (!selectedChapterId || chapters.length === 0) return;
    const currentChapter = chapters.find(ch => ch.id === selectedChapterId);
    const count = currentChapter?.modules?.length ?? 0;
    setTotalModules(count);
    setForm((f) => ({ ...f, order: String(count + 1) }));
  }, [selectedChapterId, chapters]);

  function handleOrderChange(val: string) {
    setForm((f) => ({ ...f, order: val }));
    const num = Number(val);
    if (!val || isNaN(num) || num < 1 || !Number.isInteger(num)) {
      setOrderError("Urutan harus berupa angka bulat minimal 1.");
    } else {
      setOrderError("");
    }
  }

  function handleTitle(title: string) {
    setForm((f) => ({ ...f, title, slug: toSlug(title) }));
  }

  async function handleSubmit() {
    if (!selectedChapterId) {
      setError("Bab Utama wajib dipilih.");
      return;
    }
    if (!form.title) {
      setError("Judul materi wajib diisi.");
      return;
    }
    const orderNum = Number(form.order);
    if (!form.order || isNaN(orderNum) || orderNum < 1 || !Number.isInteger(orderNum)) {
      setError("Urutan tidak valid.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const firstVideoWidget = widgets.find(w => w.type === "VIDEO");
      const mainYoutubeId = firstVideoWidget ? firstVideoWidget.iframeUrl : null;

      // 1. Buat materi (materi) baru
      const res = await fetch("/api/admin/modul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          description: form.description,
          youtubeId: mainYoutubeId || "",
          duration: Number(form.duration) || 0,
          order: Number(form.order) || 1,
          chapterId: selectedChapterId,
          isFree: false,
          isPublished: form.isPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal membuat materi.");
        setLoading(false);
        return;
      }

      const newModuleId = data.id;

      // 2. Simpan semua widget simulasi/konten
      if (widgets.length > 0) {
        const resWidgets = await fetch(`/api/admin/modul/${newModuleId}/widgets`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(widgets.map((w, idx) => ({ ...w, order: idx }))),
        });
        const dataWidgets = await resWidgets.json();
        if (!resWidgets.ok) {
          setError(dataWidgets.message || "Materi dibuat, tetapi gagal menyimpan widget pendukung.");
          setLoading(false);
          return;
        }
      }

      router.push(`/admin/kursus/${courseId}/modul`);
    } catch (err) {
      setError("Terjadi kesalahan koneksi saat membuat materi.");
    } finally {
      setLoading(false);
    }
  }

  // MANAJEMEN WIDGET
  function addWidget(type: "HTML_JS" | "VIDEO" | "TEXT") {
    const newWidget: Widget = {
      type,
      order: widgets.length,
      htmlCode: type === "TEXT"
        ? "<p>Ketik materi pembelajaran di sini...</p>"
        : type === "HTML_JS"
          ? '<div class="card">\n  <h3>Simulasi Interaktif</h3>\n  <p>Klik tombol di bawah:</p>\n  <button id="btn">Klik Saya</button>\n</div>'
          : undefined,
      cssCode: type === "HTML_JS" ? ".card {\n  padding: 20px;\n  background: #f1f5f9;\n  border-radius: 12px;\n  text-align: center;\n  font-family: sans-serif;\n}\nbutton {\n  background: #4f46e5;\n  color: white;\n  border: none;\n  padding: 8px 16px;\n  border-radius: 6px;\n  cursor: pointer;\n}" : undefined,
      jsCode: type === "HTML_JS" ? 'const btn = document.getElementById("btn");\nbtn.addEventListener("click", () => {\n  alert("Simulasi berhasil dijalankan!");\n});' : undefined,
      iframeUrl: type === "VIDEO"
        ? "dQw4w9WgXcQ"
        : undefined,
    };

    const index = widgets.length;
    setWidgets([...widgets, newWidget]);
    setActiveTabs((prev) => ({ ...prev, [index]: type === "HTML_JS" ? "HTML" : "PREVIEW" }));
  }

  function removeWidget(index: number) {
    if (!confirm("Hapus elemen konten ini?")) return;
    const filtered = widgets.filter((_, idx) => idx !== index);
    setWidgets(filtered);

    const newTabs = { ...activeTabs };
    delete newTabs[index];
    setActiveTabs(newTabs);
  }

  function updateWidgetField(index: number, field: keyof Widget, value: any) {
    const updated = widgets.map((w, idx) => {
      if (idx === index) {
        return { ...w, [field]: value };
      }
      return w;
    });
    setWidgets(updated);
  }

  function moveWidget(index: number, direction: "UP" | "DOWN") {
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === widgets.length - 1) return;

    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    const newWidgets = [...widgets];

    const temp = newWidgets[index];
    newWidgets[index] = newWidgets[targetIndex];
    newWidgets[targetIndex] = temp;

    const tempTab = activeTabs[index];
    const targetTab = activeTabs[targetIndex];
    setActiveTabs((prev) => ({
      ...prev,
      [index]: targetTab,
      [targetIndex]: tempTab,
    }));

    setWidgets(newWidgets);
  }

  function extractYoutubeId(urlOrId: string) {
    if (!urlOrId) return "";
    const trimmed = urlOrId.trim();
    if (trimmed.length === 11 && !trimmed.includes("/") && !trimmed.includes(".")) {
      return trimmed;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    return (match && match[2].length === 11) ? match[2] : trimmed;
  }

  return (
    <div className="mx-auto max-w-[850px] pb-16 pt-4 px-4 bg-[#f4f6fb] min-h-screen">
      <div className="mb-6">
        <Link href={`/admin/kursus/${courseId}/modul`}>
          <button className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white border-0 shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-lg mb-5 cursor-pointer text-stone-600 hover:bg-stone-50 transition-colors">
            ←
          </button>
        </Link>
        <h1 className="text-[32px] font-extrabold text-[#111827] mb-2 leading-tight">Hybrid Module Editor</h1>
        <p className="text-[#64748b] text-[15px] leading-relaxed">
          Create learning materials with rich text, videos, mathematical formulas using KaTeX, and interactive HTML simulations.
        </p>
      </div>

      <div className="sticky top-[15px] z-[100] bg-white rounded-[18px] p-3 flex flex-wrap gap-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.06)] mb-6">
        <button
          type="button"
          onClick={() => addWidget("TEXT")}
          className="border-0 bg-[#eff6ff] text-[#2563eb] hover:bg-[#dbeafe] px-4 py-2.5 rounded-[12px] font-semibold text-sm cursor-pointer transition-colors flex items-center gap-1.5"
        >
          <FileText size={16} /> + Editor Teks
        </button>
        <button
          type="button"
          onClick={() => addWidget("HTML_JS")}
          className="border-0 bg-[#eef2ff] text-[#4338ca] hover:bg-[#e0e7ff] px-4 py-2.5 rounded-[12px] font-semibold text-sm cursor-pointer transition-colors flex items-center gap-1.5"
        >
          <Code size={16} /> + Kode & Simulasi
        </button>        <button
          type="button"
          onClick={() => addWidget("VIDEO")}
          className="border-0 bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca] px-4 py-2.5 rounded-[12px] font-semibold text-sm cursor-pointer transition-colors flex items-center gap-1.5"
        >
          <YoutubeIcon size={16} /> + Video YouTube
        </button>
      </div>

      <div className="bg-white rounded-[24px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] min-h-[600px] mb-6">
        <div className="border-b border-stone-100 pb-6 mb-6">
          <span className="inline-block bg-[#dbeafe] text-[#2563eb] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            Informasi Materi Utama
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2 text-stone-700 text-sm">Judul Materi</label>
              <input
                className="w-full border border-stone-200 rounded-[14px] px-4 py-3 text-[15px] focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all placeholder-stone-400"
                placeholder="Contoh: Bab 1 - Operasi Bilangan"
                value={form.title}
                onChange={(e) => handleTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-stone-700 text-sm">Bab Utama</label>
              {chapters.length === 0 ? (
                <div className="text-xs text-red-500 bg-red-50 p-3 rounded-[12px] border border-red-100">
                  Belum ada Bab Utama di kelas ini.
                </div>
              ) : (
                <select
                  className="w-full border border-stone-200 bg-white rounded-[14px] px-4 py-3 text-[15px] focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer"
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                >
                  {chapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-2 text-stone-700 text-sm">Durasi (Menit)</label>
              <input
                className="w-full border border-stone-200 rounded-[14px] px-4 py-3 text-[15px] focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all placeholder-stone-400"
                placeholder="Contoh: 15"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block font-semibold text-stone-700 text-sm">Urutan Materi</label>
                {totalModules !== null && (
                  <span className="text-xs text-stone-400">
                    Disarankan: {totalModules + 1}
                  </span>
                )}
              </div>
              <input
                type="number"
                min={1}
                step={1}
                className={`w-full border rounded-[14px] px-4 py-3 text-[15px] focus:outline-none focus:ring-4 transition-all ${orderError
                  ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100"
                  : "border-stone-200 focus:border-indigo-600 focus:ring-indigo-100"
                  }`}
                value={form.order}
                onChange={(e) => handleOrderChange(e.target.value)}
              />
              {orderError && <p className="mt-1.5 text-xs text-red-500">{orderError}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="block font-semibold mb-2 text-stone-700 text-sm">Deskripsi</label>
            <textarea
              className="w-full border border-stone-200 rounded-[14px] px-4 py-3 text-[15px] focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all placeholder-stone-400 h-[80px] resize-none"
              placeholder="Apa saja yang akan dipelajari?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="mt-4">
            <label className="block font-semibold mb-2 text-stone-700 text-sm">Status Publikasi</label>
            <div className="flex bg-[#f1f5f9] p-1 rounded-[12px] gap-1.5 max-w-[280px]">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isPublished: true }))}
                className={`flex-1 border-0 py-2 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${form.isPublished
                  ? "bg-white text-indigo-600 font-bold shadow-sm"
                  : "bg-transparent text-stone-500 hover:text-stone-700"
                  }`}
              >
                Published
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isPublished: false }))}
                className={`flex-1 border-0 py-2 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${!form.isPublished
                  ? "bg-white text-indigo-600 font-bold shadow-sm"
                  : "bg-transparent text-stone-500 hover:text-stone-700"
                  }`}
              >
                Draft
              </button>
            </div>
          </div>
        </div>

        <div>
          <span className="inline-block bg-[#e8f8ee] text-[#15803d] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            Penyusun Blok Konten
          </span>

          {widgets.length === 0 ? (
            <div className="border-2 border-dashed border-stone-300 rounded-[22px] h-[240px] flex flex-col items-center justify-center text-center p-6 text-[#94a3b8]">
              <div className="text-[52px] font-light mb-2">&lt;/&gt;</div>
              <h3 className="text-[#334155] font-bold text-base mt-2 mb-1">Belum ada konten</h3>
              <p className="text-sm max-w-[280px]">
                Tambahkan video pembelajaran atau widget simulasi interaktif untuk memulai materi.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {widgets.map((widget, idx) => {
                const activeTab = activeTabs[idx] || (widget.type === "HTML_JS" ? "HTML" : "PREVIEW");

                return (
                  <div key={idx} className="relative rounded-2xl border-2 border-[#edf1f5] p-6 bg-white shadow-sm">
                    <div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-xs font-extrabold text-stone-600">
                          {idx + 1}
                        </span>
                        <span
                          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${widget.type === "VIDEO"
                            ? "bg-[#fee2e2] text-[#b91c1c]"
                            : widget.type === "HTML_JS"
                              ? "bg-[#eef2ff] text-[#4338ca]"
                              : widget.type === "TEXT"
                                ? "bg-[#eff6ff] text-[#2563eb]"
                                : "bg-[#dcfce7] text-[#15803d]"
                            }`}
                        >
                          {widget.type === "VIDEO" ? (
                            <><YoutubeIcon size={12} /> Video YouTube</>
                          ) : widget.type === "HTML_JS" ? (
                            <><Code size={12} /> Kode & Simulasi</>
                          ) : widget.type === "TEXT" ? (
                            <><FileText size={12} /> Editor Teks</>
                          ) : (
                            <><Globe size={12} /> Embed Eksternal</>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveWidget(idx, "UP")}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-50 border-0 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === widgets.length - 1}
                          onClick={() => moveWidget(idx, "DOWN")}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-50 border-0 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronDown size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeWidget(idx)}
                          className="ml-2 flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 border-0 text-red-500 transition-colors hover:bg-red-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="mb-1.5 block text-xs font-bold text-stone-500">Judul Konten (Opsional)</label>
                      <input
                        type="text"
                        className="h-[46px] w-full rounded-[12px] border border-stone-200 px-3 text-sm outline-none focus:border-indigo-600"
                        value={widget.title || ""}
                        onChange={(e) => updateWidgetField(idx, "title", e.target.value)}
                        placeholder={
                          widget.type === "VIDEO"
                            ? "Contoh: Video Penjelasan Teori"
                            : widget.type === "HTML_JS"
                              ? "Contoh: Simulasi Interaktif"
                              : widget.type === "TEXT"
                                ? "Contoh: Penjelasan Materi Utama"
                                : "Contoh: Lembar Kerja Matematika"
                        }
                      />
                    </div>

                    {widget.type === "TEXT" && (
                      <div className="space-y-3">
                        <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
                          <ReactQuill
                            theme="snow"
                            value={widget.htmlCode || ""}
                            onChange={(val) => updateWidgetField(idx, "htmlCode", val)}
                            modules={quillModules}
                            formats={quillFormats}
                            placeholder="Ketik materi pembelajaran di sini..."
                          />
                        </div>
                        <p className="text-[11px] text-[#4f46e5] font-semibold italic">
                          Tips: Anda dapat menulis rumus matematika dengan format LaTeX langsung di dalam teks. Contoh: <code>$$x^2 + y^2 = r^2$$</code> untuk baris baru, atau <code>$E = mc^2$</code> untuk inline.
                        </p>
                      </div>
                    )}

                    {widget.type === "VIDEO" && (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1.5 block text-xs font-bold text-stone-500">ID Video YouTube / Link URL</label>
                          <input
                            type="text"
                            required
                            className="h-[46px] w-full rounded-[12px] border border-stone-200 px-3 text-sm outline-none focus:border-indigo-600"
                            value={widget.iframeUrl || ""}
                            onChange={(e) => updateWidgetField(idx, "iframeUrl", extractYoutubeId(e.target.value))}
                            placeholder="Contoh: dQw4w9WgXcQ atau https://www.youtube.com/watch?v=..."
                          />
                        </div>
                        {widget.iframeUrl && (
                          <div className="rounded-xl border border-stone-100 bg-[#f8fafc] p-2 flex justify-center">
                            <iframe
                              className="aspect-video w-full max-w-[480px] rounded-lg bg-black"
                              src={`https://www.youtube.com/embed/${widget.iframeUrl}`}
                              title={`YouTube Preview ${idx}`}
                              allowFullScreen
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {widget.type === "HTML_JS" && (
                      <div className="space-y-3">
                        <div className="flex border-b border-stone-100">
                          {(["HTML", "CSS", "JS", "PREVIEW"] as const).map((tab) => (
                            <button
                              type="button"
                              key={tab}
                              onClick={() => setActiveTabs((prev) => ({ ...prev, [idx]: tab }))}
                              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all border-0 bg-transparent ${activeTab === tab
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-stone-400 hover:text-stone-600"
                                }`}
                            >
                              {tab === "PREVIEW" ? (
                                <span className="flex items-center gap-1"><Eye size={12} /> Live Preview</span>
                              ) : (
                                tab
                              )}
                            </button>
                          ))}
                        </div>
                        {activeTab === "HTML" && (
                          <div>
                            <textarea
                              className="h-40 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 font-mono text-xs text-stone-800 focus:outline-none focus:bg-white resize-none"
                              value={widget.htmlCode || ""}
                              onChange={(e) => updateWidgetField(idx, "htmlCode", e.target.value)}
                              placeholder="Contoh: <div>Konten Simulasi</div>"
                            />
                          </div>
                        )}

                        {activeTab === "CSS" && (
                          <div>
                            <textarea
                              className="h-40 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 font-mono text-xs text-stone-800 focus:outline-none focus:bg-white resize-none"
                              value={widget.cssCode || ""}
                              onChange={(e) => updateWidgetField(idx, "cssCode", e.target.value)}
                              placeholder="Contoh: div { color: blue; }"
                            />
                          </div>
                        )}

                        {activeTab === "JS" && (
                          <div>
                            <textarea
                              className="h-40 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 font-mono text-xs text-stone-800 focus:outline-none focus:bg-white resize-none"
                              value={widget.jsCode || ""}
                              onChange={(e) => updateWidgetField(idx, "jsCode", e.target.value)}
                              placeholder="Contoh: document.getElementById('btn').addEventListener('click', ...)"
                            />
                          </div>
                        )}

                        {activeTab === "PREVIEW" && (
                          <div className="rounded-xl border border-stone-200 bg-white p-2">
                            <iframe
                              sandbox="allow-scripts"
                              className="h-[320px] w-full rounded-lg bg-white border border-stone-100"
                              srcDoc={`
                                <!DOCTYPE html>
                                <html>
                                  <head>
                                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
                                    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
                                    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body, {delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]});"></script>
                                    <style>
                                      body { margin: 0; padding: 10px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                                      .formula {
                                        background: #f8fafc;
                                        border-left: 4px solid #2563eb;
                                        padding: 18px;
                                        border-radius: 12px;
                                        margin: 25px 0;
                                        font-family: 'Times New Roman', Times, serif;
                                        font-size: 22px;
                                        text-align: center;
                                      }
                                      ${widget.cssCode || ""}
                                    </style>
                                  </head>
                                  <body>
                                    ${widget.htmlCode || ""}
                                    <script>
                                      try {
                                        ${widget.jsCode || ""}
                                      } catch (e) {
                                        document.body.innerHTML += '<div style="color:red; margin-top:10px; font-size:12px;">Error: ' + e.message + '</div>';
                                      }
                                    </script>
                                  </body>
                                </html>
                              `}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {widget.type === "IFRAME" && (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1.5 block text-xs font-bold text-stone-500">
                            URL Link Embed (PhET, GeoGebra, Scratch, dll)
                          </label>
                          <input
                            type="url"
                            required
                            className="h-[46px] w-full rounded-[12px] border border-stone-200 px-3 text-sm outline-none focus:border-indigo-600"
                            value={widget.iframeUrl || ""}
                            onChange={(e) => updateWidgetField(idx, "iframeUrl", e.target.value)}
                            placeholder="Contoh: https://www.geogebra.org/material/iframe/id/..."
                          />
                        </div>

                        {widget.iframeUrl && widget.iframeUrl.startsWith("http") && (
                          <div className="rounded-xl border border-stone-200 bg-white p-2">
                            <iframe
                              className="h-48 w-full rounded-lg bg-white border border-stone-100"
                              src={widget.iframeUrl}
                              title={`Iframe Preview ${idx}`}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {error && <p className="mt-6 text-sm text-red-500 text-center font-semibold">{error}</p>}

      <div className="sticky bottom-[15px] z-50 bg-white rounded-[18px] p-3.5 flex gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.08)] mt-6">
        <Link href={`/admin/kursus/${courseId}/modul`} className="flex-1">
          <button
            type="button"
            className="w-full h-[52px] rounded-[16px] border-0 bg-stone-100 text-stone-600 text-[15px] font-semibold hover:bg-stone-200 cursor-pointer transition-colors"
          >
            Batal
          </button>
        </Link>
        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="flex-1 h-[52px] rounded-[16px] border-0 bg-[#2563eb] text-white text-[15px] font-semibold hover:bg-[#1d4ed8] disabled:opacity-60 cursor-pointer transition-colors"
        >
          {loading ? "Membuat..." : "Buat Materi"}
        </button>
      </div>
    </div>
  );
}

export default function CreateModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params);
  return (
    <Suspense fallback={<div className="pt-20 text-center text-sm text-stone-400">Loading page...</div>}>
      <CreateModuleForm courseId={courseId} />
    </Suspense>
  );
}

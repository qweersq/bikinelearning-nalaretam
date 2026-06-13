"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, ChevronUp, ChevronDown, Code, Eye, Globe, Video } from "lucide-react";

type Params = { id: string; moduleId: string };

type Widget = {
  id?: string;
  type: "HTML_JS" | "IFRAME" | "VIDEO";
  title?: string;
  htmlCode?: string;
  jsCode?: string;
  cssCode?: string;
  iframeUrl?: string;
  order: number;
};

export default function EditModulePage({ params }: { params: Promise<Params> }) {
  const { id: courseId, moduleId } = use(params);
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    duration: "",
    description: "",
    order: "",
    isPublished: true,
    isFree: false,
    courseId,
  });

  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [activeTabs, setActiveTabs] = useState<Record<number, "HTML" | "CSS" | "JS" | "PREVIEW">>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/modul/${moduleId}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          title: data.title,
          slug: data.slug,
          description: data.description ?? "",
          duration: String(data.duration),
          order: String(data.order),
          isPublished: data.isPublished,
          isFree: data.isFree,
          courseId: data.courseId,
        });
        setWidgets(data.widgets || []);

        const tabs: Record<number, "HTML" | "CSS" | "JS" | "PREVIEW"> = {};
        (data.widgets || []).forEach((w: Widget, idx: number) => {
          if (w.type === "HTML_JS") {
            tabs[idx] = "HTML";
          }
        });
        setActiveTabs(tabs);
        setLoading(false);
      });
  }, [moduleId]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const firstVideoWidget = widgets.find(w => w.type === "VIDEO");
      const mainYoutubeId = firstVideoWidget ? firstVideoWidget.iframeUrl : null;

      // 1. Simpan detail materi dasar
      const resModul = await fetch(`/api/admin/modul/${moduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          youtubeId: mainYoutubeId || "",
          duration: Number(form.duration) || 0,
          order: Number(form.order) || 1,
        }),
      });
      const dataModul = await resModul.json();
      if (!resModul.ok) {
        setError(dataModul.message || "Gagal menyimpan materi.");
        setSaving(false);
        return;
      }

      // 2. Simpan list widget konten pendukung
      const resWidgets = await fetch(`/api/admin/modul/${moduleId}/widgets`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(widgets.map((w, idx) => ({ ...w, order: idx }))),
      });
      const dataWidgets = await resWidgets.json();
      if (!resWidgets.ok) {
        setError(dataWidgets.message || "Gagal menyimpan widget materi.");
        setSaving(false);
        return;
      }

      router.push(`/admin/kursus/${courseId}/modul`);
    } catch (err) {
      setError("Terjadi kesalahan koneksi saat menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Hapus materi ini? Data progress siswa juga akan dihapus.")) return;
    setDeleting(true);
    await fetch(`/api/admin/modul/${moduleId}`, { method: "DELETE" });
    router.push(`/admin/kursus/${courseId}/modul`);
  }

  // MANAJEMEN WIDGET
  function addWidget(type: "HTML_JS" | "IFRAME" | "VIDEO") {
    const newWidget: Widget = {
      type,
      order: widgets.length,
      htmlCode: type === "HTML_JS" ? '<div class="card">\n  <h3>Simulasi Interaktif</h3>\n  <p>Klik tombol di bawah:</p>\n  <button id="btn">Klik Saya</button>\n</div>' : undefined,
      cssCode: type === "HTML_JS" ? ".card {\n  padding: 20px;\n  background: #f1f5f9;\n  border-radius: 12px;\n  text-align: center;\n  font-family: sans-serif;\n}\nbutton {\n  background: #4f46e5;\n  color: white;\n  border: none;\n  padding: 8px 16px;\n  border-radius: 6px;\n  cursor: pointer;\n}" : undefined,
      jsCode: type === "HTML_JS" ? 'const btn = document.getElementById("btn");\nbtn.addEventListener("click", () => {\n  alert("Simulasi berhasil dijalankan!");\n});' : undefined,
      iframeUrl: type === "IFRAME" 
        ? "https://www.geogebra.org/material/iframe/id/..." 
        : type === "VIDEO" 
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

  if (loading) return <div className="pt-20 text-center text-sm text-stone-400">Loading...</div>;

  return (
    <div className="mx-auto max-w-[720px] pb-16 pt-4 px-4 bg-[#f4f6fb] min-h-screen">
      {/* Tombol Kembali */}
      <Link href={`/admin/kursus/${courseId}/modul`}>
        <button className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white border-0 shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-lg mb-5 cursor-pointer text-stone-600 hover:bg-stone-50 transition-colors">
          ←
        </button>
      </Link>

      <h1 className="text-[30px] font-extrabold text-[#111827] mb-2 leading-tight">Edit Materi</h1>
      <p className="text-[#64748b] mb-6 text-[15px]">
        Edit materi belajar, video pembelajaran, dan simulasi interaktif.
      </p>

      {/* Informasi Materi Card */}
      <div className="bg-white rounded-[24px] p-[22px] mb-[18px] shadow-[0_8px_25px_rgba(0,0,0,0.05)]">
        <h2 className="text-lg font-bold text-[#111827] mb-5">Informasi Materi</h2>

        <div className="mb-4">
          <label className="block font-semibold mb-2 text-stone-700 text-sm">Judul Materi</label>
          <input
            className="w-full border border-stone-200 rounded-[16px] px-4 py-3 text-[15px] focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2 text-stone-700 text-sm">Durasi (Menit)</label>
          <input
            className="w-full border border-stone-200 rounded-[16px] px-4 py-3 text-[15px] focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2 text-stone-700 text-sm">Urutan Materi</label>
          <input
            type="number"
            min={1}
            step={1}
            className="w-full border border-stone-200 rounded-[16px] px-4 py-3 text-[15px] focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2 text-stone-700 text-sm">Deskripsi</label>
          <textarea
            className="w-full border border-stone-200 rounded-[16px] px-4 py-3 text-[15px] focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all h-[100px] resize-none"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="mb-2">
          <label className="block font-semibold mb-2 text-stone-700 text-sm">Status</label>
          <div className="flex bg-[#f1f5f9] p-1 rounded-[16px] gap-1.5">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isPublished: true }))}
              className={`flex-1 border-0 py-3 rounded-[12px] text-sm font-semibold transition-all cursor-pointer ${
                form.isPublished 
                  ? "bg-white text-indigo-600 font-bold shadow-sm" 
                  : "bg-transparent text-stone-500 hover:text-stone-700"
              }`}
            >
              Published
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isPublished: false }))}
              className={`flex-1 border-0 py-3 rounded-[12px] text-sm font-semibold transition-all cursor-pointer ${
                !form.isPublished 
                  ? "bg-white text-indigo-600 font-bold shadow-sm" 
                  : "bg-transparent text-stone-500 hover:text-stone-700"
              }`}
            >
              Draft
            </button>
          </div>
        </div>
      </div>

      {/* Penyusun Konten Card */}
      <div className="bg-white rounded-[24px] p-[22px] shadow-[0_8px_25px_rgba(0,0,0,0.05)]">
        <h2 className="text-lg font-bold text-[#111827] mb-4">Penyusun Konten</h2>

        {/* Builder Action Buttons */}
        <div className="flex gap-2.5 overflow-x-auto pb-1.5 mb-5 scrollbar-thin">
          <button
            type="button"
            onClick={() => addWidget("VIDEO")}
            className="flex-shrink-0 border-0 rounded-full px-[18px] py-3 font-semibold text-sm bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca] transition-transform active:scale-95 cursor-pointer"
          >
            + Video
          </button>
          <button
            type="button"
            onClick={() => addWidget("HTML_JS")}
            className="flex-shrink-0 border-0 rounded-full px-[18px] py-3 font-semibold text-sm bg-[#eef2ff] text-[#4338ca] hover:bg-[#e0e7ff] transition-transform active:scale-95 cursor-pointer"
          >
            + HTML/CSS/JS
          </button>
          <button
            type="button"
            onClick={() => addWidget("IFRAME")}
            className="flex-shrink-0 border-0 rounded-full px-[18px] py-3 font-semibold text-sm bg-[#dcfce7] text-[#15803d] hover:bg-[#bbf7d0] transition-transform active:scale-95 cursor-pointer"
          >
            + Embed
          </button>
        </div>

        {/* Content list or Empty State */}
        {widgets.length === 0 ? (
          <div className="border-2 border-dashed border-stone-300 rounded-[22px] h-[240px] flex flex-col items-center justify-center text-center p-6 text-[#94a3b8]">
            <div className="text-[52px] font-light mb-2">&lt;/&gt;</div>
            <h3 className="text-[#334155] font-bold text-base mt-2 mb-1">Belum ada konten</h3>
            <p className="text-sm max-w-[280px]">
              Tambahkan video pembelajaran atau widget simulasi interaktif untuk memulai materi.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {widgets.map((widget, idx) => {
              const activeTab = activeTabs[idx] || (widget.type === "HTML_JS" ? "HTML" : "PREVIEW");

              return (
                <div key={idx} className="relative rounded-2xl border-2 border-[#edf1f5] p-5 bg-white">
                  {/* Widget Header & Actions */}
                  <div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-xs font-extrabold text-stone-600">
                        {idx + 1}
                      </span>
                      <span
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                          widget.type === "VIDEO" 
                            ? "bg-[#fee2e2] text-[#b91c1c]"
                            : widget.type === "HTML_JS" 
                            ? "bg-[#eef2ff] text-[#4338ca]" 
                            : "bg-[#dcfce7] text-[#15803d]"
                        }`}
                      >
                        {widget.type === "VIDEO" ? (
                          <><Video size={12} /> Video YouTube</>
                        ) : widget.type === "HTML_JS" ? (
                          <><Code size={12} /> Simulasi HTML/JS</>
                        ) : (
                          <><Globe size={12} /> Embed Eksternal</>
                        )}
                      </span>
                    </div>

                    {/* Order & Delete actions */}
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

                  {/* Judul Konten Kustom */}
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
                          ? "Contoh: Simulasi Eksperimen" 
                          : "Contoh: Lembar Kerja Matematika"
                      }
                    />
                  </div>

                  {/* Render based on Widget Type */}
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
                      {/* Code Tabs */}
                      <div className="flex border-b border-stone-100">
                        {(["HTML", "CSS", "JS", "PREVIEW"] as const).map((tab) => (
                          <button
                            type="button"
                            key={tab}
                            onClick={() => setActiveTabs((prev) => ({ ...prev, [idx]: tab }))}
                            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all border-0 bg-transparent ${
                              activeTab === tab
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

                      {/* Code Inputs */}
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
                            className="h-48 w-full rounded-lg bg-white border border-stone-100"
                            srcDoc={`
                              <!DOCTYPE html>
                              <html>
                                <head>
                                  <style>
                                    body { margin: 0; padding: 10px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
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

      {/* ERROR MESSAGE */}
      {error && <p className="mt-6 text-sm text-red-500 text-center font-semibold">{error}</p>}

      {/* Action Buttons below content */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 h-[52px] rounded-[16px] border-0 bg-[#fff2f2] text-red-500 text-[15px] font-semibold hover:bg-red-100 disabled:opacity-60 cursor-pointer transition-colors"
        >
          {deleting ? "Menghapus..." : "Hapus Materi"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="flex-1 h-[52px] rounded-[16px] border-0 bg-[#4f46e5] text-white text-[15px] font-semibold hover:bg-[#4338ca] disabled:opacity-60 cursor-pointer transition-colors"
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}

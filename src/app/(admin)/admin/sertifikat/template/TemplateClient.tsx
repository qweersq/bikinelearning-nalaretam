"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Award, Info, Upload, X } from "lucide-react";
import Image from "next/image";

type Template = {
  id: string; title: string; text: string;
  logoUrl: string | null; backgroundUrl: string | null; signatureUrl: string | null;
};

const DEFAULT_TEXT = "Sertifikat ini diberikan kepada {{student_name}} atas keberhasilannya menyelesaikan materi {{course_name}} di Nalar Etam.";

export default function TemplateClient({ template }: { template: Template | null }) {
  const [form, setForm] = useState({
    title: template?.title ?? "Certificate of Completion",
    text: template?.text ?? DEFAULT_TEXT,
    logoUrl: template?.logoUrl ?? "",
    backgroundUrl: template?.backgroundUrl ?? "",
    signatureUrl: template?.signatureUrl ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  function set(key: string, value: string) { setForm((f) => ({ ...f, [key]: value })); setSaved(false); }

  async function handleUpload(key: "logoUrl" | "backgroundUrl" | "signatureUrl", file: File) {
    setUploading((u) => ({ ...u, [key]: true }));
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) set(key, data.url);
    setUploading((u) => ({ ...u, [key]: false }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/sertifikat/template", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        text: form.text,
        logoUrl: form.logoUrl || null,
        backgroundUrl: form.backgroundUrl || null,
        signatureUrl: form.signatureUrl || null,
      }),
    });
    setSaving(false);
    setSaved(true);
  }

  const preview = form.text
    .replace("{{student_name}}", "Budi Santoso")
    .replace("{{course_name}}", "Aljabar & Fungsi");

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Link href="/admin/sertifikat">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <ArrowLeft size={18} className="text-stone-600" />
          </div>
        </Link>
        <h1 className="text-[22px] font-extrabold text-stone-900">Template Sertifikat</h1>
      </div>

      <div className="space-y-4">
        {/* Preview */}
        <div className="overflow-hidden rounded-[24px] bg-gradient-to-br from-[#2563eb] to-[#3b82f6] p-6 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <div
            className="overflow-hidden rounded-[18px] bg-white"
            style={form.backgroundUrl ? { backgroundImage: `url(${form.backgroundUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
            <div className={form.backgroundUrl ? "bg-white/85 p-5" : "p-5"}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#eff6ff]">
                  {form.logoUrl ? (
                    <Image src={form.logoUrl} alt="Logo" width={40} height={40} className="h-10 w-10 rounded-[12px] object-cover" />
                  ) : (
                    <Award size={20} className="text-[#2563eb]" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#2563eb]">{process.env.NEXT_PUBLIC_APP_NAME ?? "Nalar Etam"}</p>
                  <p className="text-sm font-extrabold text-stone-800">{form.title}</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-stone-600">{preview}</p>
              <div className="mt-4 border-t border-[#f1f3f5] pt-3">
                {form.signatureUrl && (
                  <Image src={form.signatureUrl} alt="Tanda Tangan" width={80} height={32} className="mb-1 h-8 w-auto object-contain" />
                )}
                <p className="font-mono text-[10px] text-stone-300">CERT-2024-0001</p>
                <p className="text-[10px] text-stone-300">1 Januari 2025</p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-white/60">Preview Sertifikat</p>
        </div>

        {/* Title & Text */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Konten Sertifikat</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Judul Sertifikat</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)}
                className="w-full rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Teks Sertifikat</label>
              <textarea value={form.text} onChange={(e) => set("text", e.target.value)} rows={4}
                className="w-full resize-none rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#2563eb]" />
            </div>
            <div className="flex items-start gap-2 rounded-[12px] bg-blue-50 p-3">
              <Info size={14} className="mt-0.5 shrink-0 text-blue-400" />
              <div className="text-xs text-blue-600">
                <p className="font-semibold mb-1">Variabel yang tersedia:</p>
                <p><code className="font-mono">{"{{student_name}}"}</code> — Nama siswa</p>
                <p><code className="font-mono">{"{{course_name}}"}</code> — Nama kursus</p>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Upload */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 font-bold text-stone-900">Aset Visual</h3>
          <div className="space-y-4">
            <UploadField
              label="Logo"
              value={form.logoUrl}
              uploading={!!uploading.logoUrl}
              onUpload={(f) => handleUpload("logoUrl", f)}
              onClear={() => set("logoUrl", "")}
            />
            <UploadField
              label="Background"
              value={form.backgroundUrl}
              uploading={!!uploading.backgroundUrl}
              onUpload={(f) => handleUpload("backgroundUrl", f)}
              onClear={() => set("backgroundUrl", "")}
            />
            <UploadField
              label="Tanda Tangan"
              value={form.signatureUrl}
              uploading={!!uploading.signatureUrl}
              onUpload={(f) => handleUpload("signatureUrl", f)}
              onClear={() => set("signatureUrl", "")}
            />
          </div>
        </div>

        {saved && <p className="rounded-[12px] bg-[#eff6ff] p-3 text-center text-sm font-semibold text-[#2563eb]">Template berhasil disimpan!</p>}

        <button onClick={handleSave} disabled={saving}
          className="flex h-[56px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#2563eb] text-sm font-bold text-white disabled:opacity-60">
          <Save size={16} />
          {saving ? "Menyimpan..." : "Simpan Template"}
        </button>
      </div>
    </div>
  );
}

function UploadField({
  label, value, uploading, onUpload, onClear,
}: {
  label: string;
  value: string;
  uploading: boolean;
  onUpload: (f: File) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-stone-500">{label}</label>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-[12px] border border-[#f1f3f5] bg-[#f8fafc]">
          <Image
            src={value}
            alt={label}
            width={400}
            height={120}
            className="h-[100px] w-full object-contain p-2"
          />
          <div className="flex border-t border-[#f1f3f5]">
            <button
              type="button"
              onClick={() => ref.current?.click()}
              disabled={uploading}
              className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-[#2563eb] disabled:opacity-60"
            >
              {uploading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#2563eb] border-t-transparent" />
              ) : (
                <Upload size={13} />
              )}
              {uploading ? "Mengupload..." : "Ganti"}
            </button>
            <div className="w-px bg-[#f1f3f5]" />
            <button
              type="button"
              onClick={onClear}
              className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-red-400"
            >
              <X size={13} /> Hapus
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="flex h-[80px] w-full items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-[#d1f0e0] bg-[#f8fafc] text-sm font-semibold text-[#2563eb] disabled:opacity-60"
        >
          {uploading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#2563eb] border-t-transparent" />
          ) : (
            <Upload size={16} />
          )}
          {uploading ? "Mengupload..." : `Upload ${label}`}
        </button>
      )}
    </div>
  );
}

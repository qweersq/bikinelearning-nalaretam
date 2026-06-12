"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";

export default function PrintButton({ certNumber, recipientName }: { certNumber: string; recipientName: string }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/sertifikat/${certNumber}/download`, { method: "POST" }).catch(() => null);
  }, [certNumber]);

  async function handleDownload() {
    setLoading(true);
    try {
      const { toJpeg } = await import("html-to-image");
      const jsPDF = (await import("jspdf")).default;

      const el = document.getElementById("certificate-card");
      if (!el) return;

      const imgData = await toJpeg(el, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH);
      pdf.save(`Sertifikat-${recipientName.replace(/\s+/g, "-")}-${certNumber}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 rounded-full bg-[#2563eb] px-4 py-2 text-sm font-bold text-white disabled:opacity-70"
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <Download size={15} />
      )}
      {loading ? "Memproses..." : "Download PDF"}
    </button>
  );
}

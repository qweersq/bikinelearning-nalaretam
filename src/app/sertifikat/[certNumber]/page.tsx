import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function CertificatePrintPage({
  params,
}: {
  params: Promise<{ certNumber: string }>;
}) {
  const { certNumber } = await params;

  const [cert, setting, template] = await Promise.all([
    prisma.certificate.findUnique({
      where: { certificateNumber: certNumber },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
    }),
    prisma.setting.findUnique({ where: { id: "singleton" } }),
    prisma.certificateTemplate.findFirst({ orderBy: { createdAt: "asc" } }),
  ]);

  if (!cert) notFound();

  const academyName = setting?.academyName ?? "Nalar Etam";
  const certTitle = template?.title ?? "Certificate of Completion";
  const certText = (template?.text ?? "Sertifikat ini diberikan kepada {{student_name}} atas keberhasilannya menyelesaikan materi {{course_name}} di Nalar Etam.")
    .replace("{{student_name}}", cert.user.name)
    .replace("{{course_name}}", cert.course.title);

  const issuedDate = cert.issuedAt.toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: white; }
          .cert-page { box-shadow: none !important; margin: 0 !important; padding: 0 !important; min-height: 100vh; }
        }
        @page {
          size: A4 landscape;
          margin: 0;
        }
      `}</style>

      {/* Print action bar — hidden when printing */}
      <div className="no-print fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-stone-900 px-5 py-3">
        <div>
          <p className="text-xs text-stone-400">Sertifikat</p>
          <p className="text-sm font-bold text-white">{cert.user.name}</p>
        </div>
        <PrintButton certNumber={certNumber} recipientName={cert.user.name} />
      </div>

      {/* Certificate */}
      <div
        className="cert-page relative flex min-h-screen flex-col items-center justify-center bg-white pt-[56px] print:pt-0"
        style={
          template?.backgroundUrl
            ? { backgroundImage: `url(${template.backgroundUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        {/* Overlay for readability */}
        <div className={`flex w-full flex-1 flex-col items-center justify-center px-12 py-10 ${template?.backgroundUrl ? "bg-white/88" : ""}`}>

          {/* Border frame */}
          <div id="certificate-card" className="w-full max-w-[860px] rounded-[20px] border-[6px] border-[#2563eb]/20 bg-white p-12 print:rounded-none print:border-4">

            {/* Header: logo + academy name */}
            <div className="mb-8 flex flex-col items-center">
              {template?.logoUrl ? (
                <Image src={template.logoUrl} alt={academyName} width={80} height={80} className="mb-3 h-16 w-auto object-contain" />
              ) : (
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#eff6ff]">
                  <span className="text-2xl font-extrabold text-[#2563eb]">N</span>
                </div>
              )}
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#2563eb]">{academyName}</p>
              <div className="mt-3 h-[2px] w-24 bg-[#2563eb]/30" />
            </div>

            {/* Title */}
            <p className="mb-2 text-center text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
              proudly presents
            </p>
            <h1 className="mb-6 text-center text-[36px] font-extrabold leading-tight text-stone-900 print:text-[30px]">
              {certTitle}
            </h1>

            {/* Recipient */}
            <div className="mb-6 text-center">
              <p className="text-sm text-stone-400">Diberikan kepada</p>
              <p className="mt-1 text-[42px] font-extrabold text-[#2563eb] print:text-[34px]">{cert.user.name}</p>
              <div className="mx-auto mt-2 h-[2px] w-48 bg-[#2563eb]/30" />
            </div>

            {/* Body text */}
            <p className="mb-8 text-center text-base leading-relaxed text-stone-600 print:text-sm">
              {certText}
            </p>

            {/* Footer: date + cert number + signature */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-stone-400">Tanggal Terbit</p>
                <p className="mt-0.5 font-semibold text-stone-700">{issuedDate}</p>
              </div>

              <div className="text-center">
                <p className="font-mono text-xs text-stone-400">{cert.certificateNumber}</p>
                <p className="mt-0.5 text-[10px] text-stone-300">Certificate Number</p>
              </div>

              <div className="text-right">
                {template?.signatureUrl ? (
                  <Image
                    src={template.signatureUrl}
                    alt="Tanda Tangan"
                    width={120}
                    height={48}
                    className="mb-1 ml-auto h-12 w-auto object-contain"
                  />
                ) : (
                  <div className="mb-1 h-12 w-[120px]" />
                )}
                <div className="ml-auto w-[120px] border-t border-stone-300 pt-1">
                  <p className="text-xs font-semibold text-stone-600">{academyName}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

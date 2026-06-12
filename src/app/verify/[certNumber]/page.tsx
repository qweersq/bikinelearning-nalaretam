import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, XCircle, Award, BookOpen, Calendar, Hash } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VerifyPage({ params }: { params: Promise<{ certNumber: string }> }) {
  const { certNumber } = await params;

  const [cert, setting, template] = await Promise.all([
    prisma.certificate.findUnique({
      where: { certificateNumber: certNumber },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true, slug: true } },
      },
    }),
    prisma.setting.findUnique({ where: { id: "singleton" } }),
    prisma.certificateTemplate.findFirst({ orderBy: { createdAt: "asc" } }),
  ]);

  const academyName = setting?.academyName ?? "Nalar Etam";
  const certTitle = template?.title ?? "Certificate of Completion";

  function formatDate(d: Date) {
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  }

  function resolveText(raw: string, name: string, course: string) {
    return raw.replace("{{student_name}}", name).replace("{{course_name}}", course);
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <div className="mx-auto max-w-[768px] px-5 pb-10 pt-8">

        {/* Header */}
        <div className="mb-8 flex flex-col items-center">
          {template?.logoUrl ? (
            <Image src={template.logoUrl} alt={academyName} width={64} height={64} className="mb-2 h-14 w-auto object-contain" />
          ) : null}
          <div className="text-xl font-extrabold text-[#2563eb]">{academyName}</div>
          <p className="text-sm text-stone-400">Verifikasi Sertifikat</p>
        </div>

        {cert ? (
          <>
            {/* Valid badge */}
            <div className="mb-5 flex flex-col items-center rounded-[28px] bg-gradient-to-br from-[#2563eb] to-[#3b82f6] p-7 text-white">
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
                <CheckCircle size={40} className="text-white" />
              </div>
              <p className="text-lg font-extrabold">Sertifikat Valid</p>
              <p className="mt-1 text-sm opacity-80">Sertifikat asli dan terverifikasi secara resmi</p>
            </div>

            {/* Certificate card */}
            <div
              className="mb-4 overflow-hidden rounded-[24px] bg-white shadow-[0_5px_20px_rgba(0,0,0,0.08)]"
              style={
                template?.backgroundUrl
                  ? { backgroundImage: `url(${template.backgroundUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : undefined
              }
            >
              {/* Overlay so text stays readable over background */}
              <div className={template?.backgroundUrl ? "bg-white/90 backdrop-blur-sm" : ""}>
                <div className="p-5">
                  {/* Logo + title */}
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#eff6ff]">
                      {template?.logoUrl ? (
                        <Image src={template.logoUrl} alt={academyName} width={48} height={48} className="h-12 w-12 rounded-[14px] object-cover" />
                      ) : (
                        <Award size={22} className="text-[#2563eb]" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#2563eb]">{academyName}</p>
                      <p className="font-extrabold text-stone-900">{certTitle}</p>
                    </div>
                  </div>

                  {/* Certificate text */}
                  {template?.text && (
                    <p className="mb-5 text-sm leading-relaxed text-stone-600">
                      {resolveText(template.text, cert.user.name, cert.course.title)}
                    </p>
                  )}

                  {/* Info rows */}
                  <div className="space-y-3">
                    <InfoRow icon={<Hash size={15} className="text-stone-400" />} label="Nomor Sertifikat" value={cert.certificateNumber} mono />
                    <InfoRow icon={<Award size={15} className="text-stone-400" />} label="Diberikan Kepada" value={cert.user.name} />
                    <InfoRow icon={<BookOpen size={15} className="text-stone-400" />} label="Program / Kelas" value={cert.course.title} />
                    <InfoRow icon={<Calendar size={15} className="text-stone-400" />} label="Tanggal Terbit" value={formatDate(cert.issuedAt)} />
                  </div>

                  {/* Signature */}
                  {template?.signatureUrl && (
                    <div className="mt-5 border-t border-[#f1f3f5] pt-4">
                      <Image
                        src={template.signatureUrl}
                        alt="Tanda Tangan"
                        width={120}
                        height={48}
                        className="h-12 w-auto object-contain"
                      />
                      <p className="mt-1 text-[10px] text-stone-400">{academyName}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Verification timestamp */}
            <div className="mb-6 rounded-[16px] bg-[#eff6ff] p-4 text-center">
              <p className="text-xs font-semibold text-[#2563eb]">Terverifikasi pada {formatDate(new Date())}</p>
              <p className="mt-0.5 text-xs text-stone-400">Sertifikat ini diterbitkan secara resmi oleh {academyName}</p>
            </div>
          </>
        ) : (
          <>
            {/* Invalid */}
            <div className="mb-5 flex flex-col items-center rounded-[28px] bg-gradient-to-br from-red-400 to-rose-500 p-7 text-white">
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
                <XCircle size={40} className="text-white" />
              </div>
              <p className="text-lg font-extrabold">Sertifikat Tidak Valid</p>
              <p className="mt-1 text-sm opacity-80">Certificate not found or invalid</p>
            </div>

            <div className="mb-6 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
              <p className="mb-1 font-bold text-stone-800">Nomor sertifikat tidak ditemukan</p>
              <p className="text-sm text-stone-400 leading-relaxed">
                Pastikan nomor sertifikat yang dimasukkan benar. Jika masih bermasalah, hubungi {academyName} secara langsung.
              </p>
              <div className="mt-4 rounded-[12px] bg-[#f8fafc] px-4 py-3">
                <p className="font-mono text-sm text-stone-500">{certNumber}</p>
              </div>
            </div>
          </>
        )}

        <Link href="/">
          <button className="h-[52px] w-full rounded-[16px] bg-[#2563eb] text-sm font-bold text-white">
            Kembali ke Beranda
          </button>
        </Link>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3 border-b border-[#f1f3f5] pb-3 last:border-0 last:pb-0">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-stone-400">{label}</p>
        <p className={`mt-0.5 text-sm font-semibold text-stone-800 ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}

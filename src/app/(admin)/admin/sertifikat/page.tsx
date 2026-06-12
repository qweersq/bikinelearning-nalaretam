import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Award, FileText } from "lucide-react";
import SertifikatUI from "./SertifikatUI";

export const dynamic = "force-dynamic";

export default async function AdminSertifikatPage() {
  await requireAdmin();

  const [certs, totalStudents, totalCourses] = await Promise.all([
    prisma.certificate.findMany({
      orderBy: { issuedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
  ]);

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const thisMonthCount = certs.filter((c) => c.issuedAt >= thisMonth).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[28px] font-extrabold text-stone-900">Certificates</h1>
        <Link href="/admin/sertifikat/template">
          <div className="flex h-[42px] items-center gap-2 rounded-[14px] bg-white px-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <FileText size={16} className="text-stone-500" />
            <span className="text-sm font-semibold text-stone-600">Template</span>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { icon: Award,     label: "Total Cert",   value: certs.length },
          { icon: Award,     label: "This Month",   value: thisMonthCount },
          { icon: FileText,  label: "Active Courses", value: totalCourses },
        ].map((s, i) => (
          <div key={i} className="rounded-[20px] bg-white p-4 shadow-[0_5px_20px_rgba(0,0,0,0.04)] text-center">
            <s.icon size={18} className="mx-auto mb-2 text-[#2563eb]" />
            <p className="text-lg font-extrabold text-stone-800">{s.value}</p>
            <p className="mt-0.5 text-[10px] text-stone-400">{s.label}</p>
          </div>
        ))}
      </div>

      <SertifikatUI
        certs={certs.map((c) => ({
          id: c.id,
          certificateNumber: c.certificateNumber,
          issuedAt: c.issuedAt.toISOString(),
          userName: c.user.name,
          userEmail: c.user.email,
          userId: c.user.id,
          courseTitle: c.course.title,
          courseId: c.course.id,
        }))}
        totalStudents={totalStudents}
      />
    </div>
  );
}

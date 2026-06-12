import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Play } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminModuleListPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: { orderBy: { order: "asc" } },
      transactions: { where: { status: "SUCCESS" }, select: { userId: true } },
    },
  });

  if (!course) notFound();

  const studentCount = new Set(course.transactions.map((t) => t.userId)).size;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/admin/kursus/${id}`}>
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <ArrowLeft size={18} className="text-stone-600" />
            </div>
          </Link>
          <h1 className="text-[28px] font-extrabold text-stone-900">Modules</h1>
        </div>
        <Link href={`/admin/kursus/${id}/modul/tambah`}>
          <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[16px] bg-[#2563eb] shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
            <Plus size={24} className="text-white" />
          </div>
        </Link>
      </div>

      {/* Course Info */}
      <div className="mb-6 rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <h2 className="text-[22px] font-extrabold text-stone-900">{course.title}</h2>
        {course.description && (
          <p className="mt-2 text-sm leading-relaxed text-stone-400">{course.description}</p>
        )}
        <div className="mt-4 flex gap-3">
          {[
            { label: "Modules", value: course.modules.length },
            { label: "Students", value: studentCount },
          ].map((s) => (
            <div key={s.label} className="flex-1 rounded-[14px] bg-[#f8fafc] p-3 text-center">
              <p className="font-bold text-[#2563eb]">{s.value}</p>
              <p className="mt-1 text-[11px] text-stone-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Module List */}
      <h2 className="mb-4 text-[22px] font-extrabold text-stone-900">Course Modules</h2>

      {course.modules.length === 0 ? (
        <div className="rounded-[24px] bg-white p-10 text-center shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <Play size={40} className="mx-auto mb-3 text-stone-200" />
          <p className="text-sm text-stone-400">Belum ada modul. Tambahkan modul pertama!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {course.modules.map((mod) => (
            <div key={mod.id} className="rounded-[22px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#eff6ff] font-bold text-[#2563eb]">
                  {mod.order}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-stone-900">{mod.title}</p>
                  <p className="mt-1 text-xs text-stone-400">{mod.duration} Minutes</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  mod.isPublished ? "bg-[#e8f4ff] text-blue-600" : "bg-[#fff4e8] text-orange-500"
                }`}>
                  {mod.isPublished ? "VIDEO" : "DRAFT"}
                </span>
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/modul/${course.slug}/${mod.slug}`} target="_blank" className="flex-1">
                  <button className="h-[42px] w-full rounded-[12px] bg-[#f4f6f8] text-sm font-bold text-stone-700">Preview</button>
                </Link>
                <Link href={`/admin/kursus/${id}/modul/${mod.id}/edit`} className="flex-1">
                  <button className="h-[42px] w-full rounded-[12px] bg-[#2563eb] text-sm font-bold text-white">Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

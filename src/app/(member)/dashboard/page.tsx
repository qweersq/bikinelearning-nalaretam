import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Play, Award, BookOpen, TrendingUp, Users, Bell } from "lucide-react";

export const dynamic = "force-dynamic";

const courseIconMap: Record<string, React.ElementType> = {
  "matematika": BookOpen,
  "aljabar": BookOpen,
  "geometri": BookOpen,
};

export default async function DashboardPage() {
  const session = await requireSession();

  const [user, modules, progresses, unreadNotifCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: {
        name: true,
        groups: {
          include: {
            tutor: { select: { name: true } },
            students: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.module.findMany({
      where: { isPublished: true },
      include: { course: { include: { category: true } } },
      orderBy: [{ course: { order: "asc" } }, { order: "asc" }],
    }),
    prisma.progress.findMany({ where: { userId: session.id, completed: true } }),
    prisma.notification.count({ where: { userId: session.id, isRead: false } }),
  ]);

  const completedIds = new Set(progresses.map((p) => p.moduleId));
  const percent = modules.length > 0 ? Math.round((completedIds.size / modules.length) * 100) : 0;
  const nextModule = modules.find((m) => !completedIds.has(m.id));
  const courses = Array.from(new Map(modules.map((m) => [m.courseId, m.course])).values());
  const firstName = user?.name?.split(" ")[0] ?? "Kamu";

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-stone-400">Selamat datang kembali</p>
          <p className="text-lg font-bold text-stone-900">{firstName}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification Button */}
          <Link href="/dashboard/notifikasi">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-stone-500 shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-colors hover:text-stone-800">
              <Bell size={18} />
              {unreadNotifCount > 0 && (
                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                </span>
              )}
            </div>
          </Link>
          {/* Profile Button */}
          <Link href="/dashboard/profil">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2563eb] text-sm font-extrabold text-white shadow-[0_4px_15px_rgba(37,99,235,0.15)] transition-transform hover:scale-105">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </Link>
        </div>
      </div>

      {/* Hero Progress */}
      <div className="mb-6 rounded-[28px] bg-gradient-to-br from-[#2563eb] to-[#1fb86d] p-6 text-white">
        <p className="text-sm opacity-80">Progress Belajarmu</p>
        <h2 className="mt-2 text-[26px] font-extrabold leading-tight">
          {percent === 0 ? "Yuk mulai belajar sekarang!" : percent === 100 ? "Semua materi selesai 🎉" : "Lanjutkan perjalanan belajarmu"}
        </h2>
        <div className="mt-5 rounded-[18px] bg-white/15 p-4">
          <div className="mb-2.5 flex justify-between text-sm font-medium">
            <span>Progress</span>
            <strong>{percent}%</strong>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-xs opacity-70">{completedIds.size} dari {modules.length} materi selesai</p>
        </div>
      </div>

      {/* Continue Learning */}
      {nextModule && (
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900">Lanjutkan Belajar</h3>
            <Link href="/dashboard/modul" className="text-sm font-semibold text-[#2563eb]">Lihat Semua</Link>
          </div>
          <Link href={`/dashboard/modul/${nextModule.course.slug}/${nextModule.slug}`}>
            <div className="flex items-center justify-between rounded-[24px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-stone-400">Materi {nextModule.order}</p>
                <h4 className="mt-1 truncate text-base font-bold text-stone-900">{nextModule.title}</h4>
                <p className="mt-0.5 text-xs text-stone-400">{nextModule.course.title} · {nextModule.duration} mnt</p>
              </div>
              <div className="ml-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-white">
                <Play size={20} fill="white" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Grup Belajar Saya */}
      {user?.groups && user.groups.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-bold text-stone-900">Grup Belajar Saya</h3>
          <div className="space-y-3">
            {user.groups.map((group) => (
              <div key={group.id} className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-stone-900">{group.name}</h4>
                    <p className="text-xs text-stone-400 capitalize">Tipe Kelas: {group.type.toLowerCase()}</p>
                  </div>
                </div>
                
                {group.tutor && (
                  <div className="mt-4 border-t border-stone-100 pt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Tutor Pendamping</p>
                    <p className="mt-0.5 text-sm font-bold text-stone-800">{group.tutor.name}</p>
                  </div>
                )}

                <div className="mt-3 border-t border-stone-100 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Anggota Grup ({group.students.length} Siswa)</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {group.students.map((student) => (
                      <span key={student.id} className="rounded-full bg-stone-50 border border-stone-100 px-2.5 py-1 text-xs text-stone-600 font-medium">
                        {student.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Path */}
      {courses.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-bold text-stone-900">Jalur Belajar</h3>
          <div className="grid grid-cols-2 gap-3">
            {courses.map((course) => {
              const courseModules = modules.filter((m) => m.courseId === course.id);
              const courseDone = courseModules.filter((m) => completedIds.has(m.id)).length;
              const Icon = courseIconMap[course.slug] ?? TrendingUp;
              return (
                <Link key={course.id} href="/dashboard/modul">
                  <div className="rounded-[22px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff6ff]">
                      <Icon size={20} className="text-[#2563eb]" />
                    </div>
                    <h4 className="text-sm font-bold leading-snug text-stone-900">{course.title}</h4>
                    <p className="mt-1 text-xs text-stone-400">{courseDone}/{courseModules.length} selesai</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Sertifikat */}
      <div>
        <h3 className="mb-3 text-lg font-bold text-stone-900">Sertifikat</h3>
        <Link href="/dashboard/sertifikat">
          <div className="flex items-center justify-between rounded-[24px] bg-white p-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
            <div>
              <h4 className="font-bold text-stone-900">Nalar Etam</h4>
              <p className="mt-0.5 text-xs text-stone-400">
                {percent === 100 ? "Selesai — siap diunduh" : `Selesaikan ${modules.length - completedIds.size} materi lagi`}
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-50">
              <Award size={24} className="text-amber-500" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

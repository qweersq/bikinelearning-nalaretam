import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, User, ArrowLeft, CalendarDays, Clock, Video, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

function formatGroupType(type: string) {
  if (type === "SEMIPRIVAT") return "Semiprivat";
  return "Group";
}

export default async function StudentGroupPage() {
  const session = await requireSession();

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      groups: {
        include: {
          tutor: { select: { name: true, email: true } },
          students: { select: { id: true, name: true, email: true } },
          schedules: {
            where: { isPublished: true },
            orderBy: { scheduledAt: "asc" },
          },
        },
      },
    },
  });

  if (!user) return <div className="py-10 text-center text-stone-500">Pengguna tidak ditemukan.</div>;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <ArrowLeft size={18} className="text-stone-600" />
          </div>
        </Link>
        <div>
          <h1 className="text-[22px] font-extrabold text-stone-900">Grup Belajar Saya</h1>
          <p className="text-xs text-stone-400">Informasi grup coaching dan sesi live Zoom</p>
        </div>
      </div>

      {user.groups.length === 0 ? (
        <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <Users size={40} className="mx-auto mb-3 text-stone-300" />
          <p className="text-sm font-semibold text-stone-500">Kamu belum terdaftar di grup mana pun</p>
          <p className="mt-1.5 text-xs text-stone-400">Silakan hubungi admin untuk mendaftar ke kelas grup atau semi-privat.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {user.groups.map((group) => {
            const upcomingSchedules = group.schedules.filter(
              (s) => new Date(s.scheduledAt).getTime() + s.durationMin * 60000 > Date.now()
            ).slice(0, 5);
            const groupType = formatGroupType(group.type);

            return (
              <div key={group.id} className="space-y-4">
                {/* Group Info Card */}
                <div className="rounded-[28px] bg-gradient-to-br from-[#2563eb] to-[#3b82f6] p-6 text-white shadow-[0_10px_25px_rgba(37,99,235,0.15)]">
                  <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                    Kelas {groupType}
                  </span>
                  <h2 className="mt-3 text-[24px] font-extrabold">{group.name}</h2>
                  <p className="mt-1 text-sm opacity-80">
                    Program {groupType.toLowerCase()} dengan kapasitas maksimal {group.maxStudents} siswa
                  </p>
                </div>

                {/* Tutor Card */}
                {group.tutor && (
                  <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
                    <h3 className="mb-3.5 text-xs font-semibold uppercase tracking-wider text-stone-400">Tutor Pendamping</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eff6ff] text-[#2563eb]">
                        <User size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-stone-900">{group.tutor.name}</p>
                        <p className="flex items-center gap-1 text-xs text-stone-400">
                          <Mail size={12} /> {group.tutor.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!group.tutor && (
                  <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
                    <h3 className="mb-3.5 text-xs font-semibold uppercase tracking-wider text-stone-400">Tutor Pendamping</h3>
                    <p className="text-sm text-stone-500">Tutor untuk grup ini belum ditentukan oleh admin.</p>
                  </div>
                )}

                {/* Members Card */}
                <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Teman Sekelompok ({group.students.length} Siswa)
                  </h3>
                  <div className="divide-y divide-stone-100">
                    {group.students.map((student) => (
                      <div key={student.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-50 text-stone-500 border border-stone-100 text-sm font-bold">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-stone-800">{student.name} {student.id === session.id && "(Kamu)"}</p>
                          <p className="text-xs text-stone-400">{student.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sesi Live Group */}
                <div className="rounded-[24px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Jadwal Pertemuan Group Terdekat
                  </h3>
                  {upcomingSchedules.length === 0 ? (
                    <p className="py-2 text-center text-xs text-stone-400">Belum ada jadwal mendatang untuk grup ini.</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingSchedules.map((schedule) => (
                        <div key={schedule.id} className="rounded-xl border border-stone-100 p-4">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-bold text-stone-800">{schedule.title}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${schedule.classType === "OFFLINE" ? "bg-stone-100 text-stone-700" : "bg-blue-50 text-[#2563eb]"}`}>
                              {schedule.classType === "OFFLINE" ? "📍 Offline" : "🌐 Online"}
                            </span>
                          </div>
                          {schedule.description && <p className="mt-1 text-xs text-stone-500">{schedule.description}</p>}
                          {schedule.classType === "OFFLINE" && schedule.location && (
                            <p className="mt-1.5 text-xs text-stone-600 font-medium">📍 Lokasi: {schedule.location}</p>
                          )}
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-3 text-xs text-stone-400">
                              <span className="flex items-center gap-1">
                                <CalendarDays size={12} />
                                {new Date(schedule.scheduledAt).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(schedule.scheduledAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            {schedule.classType === "ONLINE" && schedule.meetingUrl && (
                              <a href={schedule.meetingUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 rounded-full bg-[#2563eb] px-3.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-blue-600">
                                <Video size={12} /> Gabung Sesi
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

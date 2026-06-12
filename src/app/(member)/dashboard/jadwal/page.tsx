"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock, Video, CheckCircle2, CalendarX } from "lucide-react";

type Schedule = {
  id: string; title: string; description: string | null;
  scheduledAt: string; durationMin: number; meetingUrl: string | null;
  group?: { name: string } | null;
  classType: string;
  location: string | null;
};

function useCountdown(target: string) {
  const [diff, setDiff] = useState(new Date(target).getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(new Date(target).getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return diff;
}

function Countdown({ target }: { target: string }) {
  const diff = useCountdown(target);
  if (diff <= 0) return <span className="text-[#2563eb] font-bold">Sedang berlangsung!</span>;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (d > 0) return <span>{d} hari {h} jam lagi</span>;
  if (h > 0) return <span>{h} jam {m} menit lagi</span>;
  return <span className="text-amber-600 font-semibold">{m}m {s}s lagi</span>;
}

export default function JadwalPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch("/api/jadwal").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setSchedules(data);
    }).finally(() => setLoading(false));
  }, []);

  const now      = Date.now();
  const upcoming = schedules.filter((s) => new Date(s.scheduledAt).getTime() + s.durationMin * 60000 > now);
  const past     = schedules.filter((s) => new Date(s.scheduledAt).getTime() + s.durationMin * 60000 <= now);
  const next     = upcoming[0] ?? null;

  function isLive(s: Schedule) {
    const start = new Date(s.scheduledAt).getTime();
    return start <= now && start + s.durationMin * 60000 > now;
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563eb] border-t-transparent" />
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold text-stone-900">Jadwal Kelas Online</h1>
        <p className="mt-1 text-sm text-stone-400">Sesi live bersama instruktur via Zoom / Google Meet</p>
      </div>

      {/* Next class banner */}
      {next && (
        <div className="mb-5 rounded-[28px] bg-gradient-to-br from-[#2563eb] to-[#3b82f6] p-5 text-white">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              {next.classType === "OFFLINE" ? "📍 Offline" : "🌐 Online"}
            </span>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70">
              {isLive(next) ? "🔴 Sedang Berlangsung" : "Kelas Berikutnya"}
            </p>
          </div>
          <p className="mt-2 text-lg font-extrabold leading-snug">{next.title}</p>
          <div className="mt-2 flex items-center gap-4 text-sm opacity-80">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} />
              {new Date(next.scheduledAt).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              {new Date(next.scheduledAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          {next.classType === "OFFLINE" && next.location && (
            <p className="mt-2 text-xs opacity-90">📍 Lokasi: {next.location}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm font-semibold opacity-90">
              <Countdown target={next.scheduledAt} />
            </p>
            {next.classType === "ONLINE" && next.meetingUrl && (
              <a href={next.meetingUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold text-white backdrop-blur hover:bg-white/30">
                <Video size={13} /> Gabung
              </a>
            )}
          </div>
        </div>
      )}

      {/* Upcoming list */}
      {upcoming.length === 0 ? (
        <div className="mb-6 rounded-[24px] bg-white p-8 text-center shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <CalendarX size={32} className="mx-auto mb-3 text-stone-200" />
          <p className="text-sm font-semibold text-stone-400">Belum ada kelas online mendatang</p>
          <p className="mt-1 text-xs text-stone-300">Admin akan mengumumkan jadwal live berikutnya segera.</p>
        </div>
      ) : (
        <div className="mb-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Mendatang</p>
          {upcoming.map((s) => (
            <ScheduleCard key={s.id} s={s} live={isLive(s)} />
          ))}
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Selesai</p>
          {past.map((s) => (
            <div key={s.id} className="rounded-[20px] bg-white p-4 opacity-60 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0 text-[#2563eb]" />
                <p className="font-semibold text-stone-700">{s.title}</p>
              </div>
              <p className="mt-1.5 pl-[23px] text-xs text-stone-400">
                {new Date(s.scheduledAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} · {s.durationMin} menit
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleCard({ s, live }: { s: Schedule; live: boolean }) {
  return (
    <div className={`rounded-[20px] bg-white p-4 shadow-[0_5px_20px_rgba(0,0,0,0.04)] ${live ? "ring-2 ring-[#2563eb]" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {live && <span className="flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">● LIVE</span>}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.classType === "OFFLINE" ? "bg-stone-100 text-stone-700" : "bg-blue-50 text-[#2563eb]"}`}>
              {s.classType === "OFFLINE" ? "📍 Offline" : "🌐 Online"}
            </span>
            {s.group ? (
              <span className="rounded-full bg-[#eff6ff] px-2 py-0.5 text-[10px] font-bold text-[#2563eb]">
                Group: {s.group.name}
              </span>
            ) : (
              <span className="rounded-full bg-[#f8fafc] border border-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-500">
                Sesi Privat
              </span>
            )}
            <p className="font-bold text-stone-900">{s.title}</p>
          </div>
          {s.description && <p className="mt-0.5 text-xs text-stone-400 line-clamp-2">{s.description}</p>}
          {s.classType === "OFFLINE" && s.location && (
            <p className="mt-1 text-xs text-stone-500 font-medium">📍 Lokasi: {s.location}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-stone-400">
            <span className="flex items-center gap-1">
              <CalendarDays size={12} />
              {new Date(s.scheduledAt).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {new Date(s.scheduledAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} · {s.durationMin} mnt
            </span>
          </div>
          <p className="mt-1.5 text-xs text-stone-400">
            <Countdown target={s.scheduledAt} />
          </p>
        </div>
        {s.classType === "ONLINE" && s.meetingUrl && (
          <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 rounded-[12px] bg-[#eff6ff] px-3 py-2 text-xs font-bold text-[#2563eb]">
            <Video size={13} /> Gabung
          </a>
        )}
      </div>
    </div>
  );
}

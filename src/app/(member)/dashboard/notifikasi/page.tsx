"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, BookOpen, Award, Trophy, GraduationCap, Download } from "lucide-react";

type Notif = { id: string; title: string; body: string; type: string; isRead: boolean; createdAt: string };

const typeIcon: Record<string, React.ReactNode> = {
  enrollment:    <BookOpen size={18} className="text-blue-500" />,
  completion:    <GraduationCap size={18} className="text-[#2563eb]" />,
  quiz_result:   <Trophy size={18} className="text-amber-500" />,
  cert_issued:   <Award size={18} className="text-purple-500" />,
  cert_download: <Download size={18} className="text-stone-400" />,
};

const typeBg: Record<string, string> = {
  enrollment:    "bg-blue-50",
  completion:    "bg-[#eff6ff]",
  quiz_result:   "bg-amber-50",
  cert_issued:   "bg-purple-50",
  cert_download: "bg-stone-50",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function NotifikasiPage() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => { setNotifs(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  }

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold text-stone-900">Notifikasi</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-stone-400">{unreadCount} belum dibaca</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 rounded-full bg-[#eff6ff] px-3 py-1.5 text-xs font-semibold text-[#2563eb]">
            <CheckCheck size={13} /> Tandai semua
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[80px] animate-pulse rounded-[20px] bg-stone-100" />
          ))}
        </div>
      ) : notifs.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-stone-100">
            <Bell size={32} className="text-stone-300" />
          </div>
          <p className="font-semibold text-stone-500">Belum ada notifikasi</p>
          <p className="mt-1 text-xs text-stone-400">Notifikasi akan muncul di sini saat ada aktivitas belajar</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifs.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={`flex w-full items-start gap-3 rounded-[20px] p-4 text-left transition-colors ${n.isRead ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]" : "bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] ring-1 ring-[#2563eb]/10"}`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${typeBg[n.type] ?? "bg-stone-50"}`}>
                {typeIcon[n.type] ?? <Bell size={18} className="text-stone-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm leading-snug ${n.isRead ? "font-medium text-stone-700" : "font-bold text-stone-900"}`}>
                    {n.title}
                  </p>
                  {!n.isRead && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#2563eb]" />
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-stone-400 line-clamp-2">{n.body}</p>
                <p className="mt-1.5 text-[10px] text-stone-300">{timeAgo(n.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

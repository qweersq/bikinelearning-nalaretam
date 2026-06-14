"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ClipboardList, CalendarDays, Users } from "lucide-react";

const navItems = [
  { href: "/dashboard",              label: "Home",       icon: Home },
  { href: "/dashboard/modul",        label: "Materi",     icon: BookOpen },
  { href: "/dashboard/quiz",         label: "Soal",       icon: ClipboardList },
  { href: "/dashboard/jadwal",       label: "Jadwal",     icon: CalendarDays },
  { href: "/dashboard/grup",         label: "Grup",       icon: Users },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard/modul/") || pathname.startsWith("/dashboard/quiz/")) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      <nav className="flex items-center gap-1 rounded-[24px] bg-white px-3 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 rounded-2xl px-2.5 py-2 transition-colors ${
                active ? "text-[#2563eb]" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-semibold leading-none ${active ? "text-[#2563eb]" : "text-stone-400"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

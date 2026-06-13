"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, BookOpen, Users, CalendarDays, GraduationCap } from "lucide-react";

const navItems = [
  { href: "/admin",           label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/kursus",    label: "Materi",     icon: BookOpen },
  { href: "/admin/grup",      label: "Grup",       icon: Users },
  { href: "/admin/jadwal",    label: "Jadwal",     icon: CalendarDays },
  { href: "/admin/member",    label: "Siswa",      icon: GraduationCap },
];

export default function AdminBottomNav() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const show = () => setHidden(true);
    const hide = () => setHidden(false);
    window.addEventListener("admin-modal-open", show);
    window.addEventListener("admin-modal-close", hide);
    return () => {
      window.removeEventListener("admin-modal-open", show);
      window.removeEventListener("admin-modal-close", hide);
    };
  }, []);

  const shouldHide = hidden || pathname.includes("/tambah") || pathname.includes("/edit");
  if (shouldHide) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      <nav className="flex items-center gap-1 rounded-[24px] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
        {navItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2.5 py-2 transition-colors ${
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

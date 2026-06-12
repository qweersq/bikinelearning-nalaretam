import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, School, Award, Bell, User, Tag } from "lucide-react";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

const menuItems = [
  { icon: School, label: "Profil Akademi",         sub: "Nama, Logo & Branding",            href: "/admin/settings/profil" },
  { icon: Tag,    label: "Kode Promo",             sub: "Diskon & kode voucher",            href: "/admin/promo" },
  { icon: Award,  label: "Sertifikat Kelulusan",   sub: "Daftar sertifikat terbit",         href: "/admin/sertifikat" },
  { icon: Award,  label: "Pengaturan Sertifikat",  sub: "Template & Syarat Kelulusan",      href: "/admin/settings/sertifikat" },
  { icon: Bell,   label: "Pengaturan Notifikasi",  sub: "Email & Push Notification",        href: "/admin/settings/notifikasi" },
  { icon: User,   label: "Pengaturan Akun",        sub: "Password & Keamanan",              href: "/admin/settings/akun" },
];

export default async function AdminSettingsPage() {
  const session = await requireAdmin();

  const [totalStudents, totalCourses] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
  ]);

  const initial = session.name?.slice(0, 2).toUpperCase() ?? "KA";

  return (
    <div>
      {/* Header */}
      <h1 className="mb-6 text-[30px] font-extrabold text-stone-900">Pengaturan</h1>

      {/* Profile Card */}
      <div className="mb-6 flex items-center gap-4 rounded-[28px] bg-white p-6 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
        <div className="flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-[20px] bg-[#eff6ff] text-2xl font-extrabold text-[#2563eb]">
          {initial}
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-stone-900">{session.name}</h3>
          <p className="mt-1 text-sm text-stone-400">{session.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-[20px] bg-white p-[18px] text-center shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="text-[22px] font-bold text-[#2563eb]">{totalStudents}</h3>
          <p className="mt-1 text-xs text-stone-400">Siswa</p>
        </div>
        <div className="rounded-[20px] bg-white p-[18px] text-center shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
          <h3 className="text-[22px] font-bold text-[#2563eb]">{totalCourses}</h3>
          <p className="mt-1 text-xs text-stone-400">Materi</p>
        </div>
      </div>

      {/* Menu */}
      <h2 className="mb-4 text-[22px] font-extrabold text-stone-900">Pengaturan Umum</h2>
      <div className="flex flex-col gap-[14px]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center justify-between rounded-[22px] bg-white px-5 py-[22px] shadow-[0_5px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-4">
                  <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-[#f8fafc]">
                    <Icon size={22} className="text-stone-500" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900">{item.label}</p>
                    <p className="mt-1 text-xs text-stone-400">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-stone-300" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6">
        <LogoutButton />
      </div>

      <p className="mt-6 text-center text-xs text-stone-300">Nalar Etam Admin v1.0.0</p>
    </div>
  );
}

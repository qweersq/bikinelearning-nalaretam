import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import BottomNav from "@/components/layout/BottomNav";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.hasAccess) redirect("/checkout");
  const isAdmin = session?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {isAdmin && (
        <div className="sticky top-0 z-[100] bg-[#2563eb] text-white px-4 py-2.5 text-center text-xs font-bold shadow-md flex items-center justify-center gap-2">
          <span>Mode Preview (Admin)</span>
          <span className="opacity-50">·</span>
          <Link href="/admin/kursus" className="underline hover:text-blue-100 transition-colors">
            Kembali ke Admin Panel →
          </Link>
        </div>
      )}
      <div className="mx-auto max-w-[768px] px-5 pb-32 pt-5">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

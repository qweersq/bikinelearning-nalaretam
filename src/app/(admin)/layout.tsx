import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import AdminBottomNav from "@/components/layout/AdminBottomNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try { await requireAdmin(); } catch { redirect("/login"); }

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <div className="mx-auto max-w-[768px] px-5 pb-32 pt-5">
        {children}
      </div>
      <AdminBottomNav />
    </div>
  );
}

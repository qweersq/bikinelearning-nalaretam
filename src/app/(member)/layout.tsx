import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import BottomNav from "@/components/layout/BottomNav";

export const dynamic = "force-dynamic";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.hasAccess) redirect("/checkout");

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="mx-auto max-w-[768px] px-5 pb-32 pt-5">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

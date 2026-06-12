import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AkunClient from "./AkunClient";

export const dynamic = "force-dynamic";

export default async function AkunSettingsPage() {
  const session = await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { id: true, name: true, email: true } });
  return <AkunClient user={user!} />;
}

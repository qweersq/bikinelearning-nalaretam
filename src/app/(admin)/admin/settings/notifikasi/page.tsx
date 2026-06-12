import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NotifikasiClient from "./NotifikasiClient";

export const dynamic = "force-dynamic";

export default async function NotifikasiSettingsPage() {
  await requireAdmin();
  const setting = await prisma.setting.upsert({ where: { id: "singleton" }, create: {}, update: {} });
  return <NotifikasiClient setting={setting} />;
}

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfilClient from "./ProfilClient";

export const dynamic = "force-dynamic";

export default async function ProfilSettingsPage() {
  await requireAdmin();
  const setting = await prisma.setting.upsert({ where: { id: "singleton" }, create: {}, update: {} });
  return <ProfilClient setting={setting} />;
}

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SertifikatClient from "./SertifikatClient";

export const dynamic = "force-dynamic";

export default async function SertifikatSettingsPage() {
  await requireAdmin();
  const setting = await prisma.setting.upsert({ where: { id: "singleton" }, create: {}, update: {} });
  return <SertifikatClient setting={setting} />;
}

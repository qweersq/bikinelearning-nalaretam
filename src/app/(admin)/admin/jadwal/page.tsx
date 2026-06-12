import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import JadwalClient from "./JadwalClient";

export const dynamic = "force-dynamic";

export default async function AdminJadwalPage() {
  await requireAdmin();
  const [schedules, groups] = await Promise.all([
    prisma.classSchedule.findMany({
      include: { group: { select: { name: true } } },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.group.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serialized = schedules.map((s) => ({
    ...s,
    scheduledAt: s.scheduledAt.toISOString(),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return <JadwalClient initialSchedules={serialized} groups={groups} />;
}

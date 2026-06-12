import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }
  const schedules = await prisma.classSchedule.findMany({ orderBy: { scheduledAt: "asc" } });
  return NextResponse.json(schedules);
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }
  const { title, description, scheduledAt, durationMin, meetingUrl, isPublished, groupId, classType, location } = await req.json();
  if (!title || !scheduledAt) return NextResponse.json({ message: "Judul dan waktu wajib diisi." }, { status: 400 });
  const schedule = await prisma.classSchedule.create({
    data: {
      title,
      description: description || null,
      scheduledAt: new Date(scheduledAt),
      durationMin: durationMin ?? 60,
      meetingUrl: meetingUrl || null,
      isPublished: isPublished ?? false,
      groupId: groupId || null,
      classType: classType || "ONLINE",
      location: location || null,
    },
    include: {
      group: {
        select: { name: true },
      },
    },
  });
  return NextResponse.json(schedule);
}

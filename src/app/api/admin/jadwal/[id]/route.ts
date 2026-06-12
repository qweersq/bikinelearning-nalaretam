import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description || null;
  if (body.scheduledAt !== undefined) data.scheduledAt = new Date(body.scheduledAt);
  if (body.durationMin !== undefined) data.durationMin = body.durationMin;
  if (body.meetingUrl !== undefined) data.meetingUrl = body.meetingUrl || null;
  if (body.isPublished !== undefined) data.isPublished = body.isPublished;
  if (body.groupId !== undefined) data.groupId = body.groupId || null;
  if (body.classType !== undefined) data.classType = body.classType;
  if (body.location !== undefined) data.location = body.location || null;
  const schedule = await prisma.classSchedule.update({
    where: { id },
    data,
    include: {
      group: {
        select: { name: true },
      },
    },
  });
  return NextResponse.json(schedule);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }
  const { id } = await params;
  await prisma.classSchedule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

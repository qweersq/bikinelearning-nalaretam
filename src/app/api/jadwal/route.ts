import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireSession();
    
    // Dapatkan grup-grup di mana user terdaftar
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { groups: { select: { id: true } } },
    });
    
    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    const groupIds = user.groups.map((g) => g.id);

    const schedules = await prisma.classSchedule.findMany({
      where: {
        isPublished: true,
        OR: [
          { groupId: null, studentId: null }, // Jadwal publik
          { groupId: { in: groupIds } },      // Jadwal grup user
          { studentId: session.id },          // Jadwal privat user
        ],
      },
      include: {
        group: {
          select: { name: true },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json(schedules);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const groups = await prisma.group.findMany({
      include: {
        tutor: { select: { id: true, name: true, email: true } },
        students: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const tutors = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });

    const students = await prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ groups, tutors, students });
  } catch (error) {
    console.error("GET Group Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, type, maxStudents, tutorId, studentIds } = await req.json();

    if (!name || !type) {
      return NextResponse.json({ message: "Nama dan tipe grup wajib diisi." }, { status: 400 });
    }

    if (type !== "GROUP" && type !== "SEMIPRIVAT") {
      return NextResponse.json({ message: "Tipe grup tidak valid." }, { status: 400 });
    }

    const group = await prisma.group.create({
      data: {
        name,
        type,
        maxStudents: maxStudents ? Number(maxStudents) : (type === "SEMIPRIVAT" ? 2 : 5),
        tutorId: tutorId || null,
        students: studentIds && Array.isArray(studentIds) ? {
          connect: studentIds.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        tutor: { select: { id: true, name: true, email: true } },
        students: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("POST Group Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

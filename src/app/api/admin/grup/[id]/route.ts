import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, type, maxStudents, tutorId, studentIds } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) {
      if (type !== "GROUP" && type !== "SEMIPRIVAT") {
        return NextResponse.json({ message: "Tipe grup tidak valid." }, { status: 400 });
      }
      updateData.type = type;
      if (maxStudents === undefined) {
        updateData.maxStudents = type === "SEMIPRIVAT" ? 2 : 5;
      }
    }
    if (maxStudents !== undefined) updateData.maxStudents = Number(maxStudents);
    if (tutorId !== undefined) updateData.tutorId = tutorId || null;
    if (studentIds !== undefined && Array.isArray(studentIds)) {
      updateData.students = {
        set: studentIds.map((sid: string) => ({ id: sid })),
      };
    }

    const group = await prisma.group.update({
      where: { id },
      data: updateData,
      include: {
        tutor: { select: { id: true, name: true, email: true } },
        students: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error("PATCH Group Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.group.delete({ where: { id } });
    return NextResponse.json({ message: "Grup berhasil dihapus." });
  } catch (error) {
    console.error("DELETE Group Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Ctx = { params: Promise<{ chapterId: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { chapterId } = await params;
  const { title, order } = await req.json();

  if (!title) {
    return NextResponse.json({ message: "Judul bab wajib diisi." }, { status: 400 });
  }

  const chapter = await prisma.chapter.update({
    where: { id: chapterId },
    data: { title, order: typeof order === "number" ? order : 0 },
  });

  return NextResponse.json(chapter);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { chapterId } = await params;

  // Delete progresses first matching modules under this chapter to prevent integrity errors
  await prisma.progress.deleteMany({
    where: {
      module: {
        chapterId: chapterId,
      },
    },
  });

  // Delete chapter (this will cascade delete its modules and widgets)
  await prisma.chapter.delete({
    where: { id: chapterId },
  });

  return NextResponse.json({ message: "Bab berhasil dihapus." });
}

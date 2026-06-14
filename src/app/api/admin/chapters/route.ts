import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { title, courseId, order } = await req.json();

  if (!title || !courseId) {
    return NextResponse.json({ message: "Judul bab dan kelas wajib diisi." }, { status: 400 });
  }

  const chapter = await prisma.chapter.create({
    data: { title, courseId, order: typeof order === "number" ? order : 0 },
  });

  return NextResponse.json(chapter, { status: 201 });
}

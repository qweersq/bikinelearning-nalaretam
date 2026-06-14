import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const modul = await prisma.module.findUnique({
    where: { id },
    include: {
      widgets: {
        orderBy: { order: "asc" }
      }
    }
  });
  if (!modul) return NextResponse.json({ message: "Modul tidak ditemukan." }, { status: 404 });
  return NextResponse.json(modul);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { title, slug, description, youtubeId, duration, order, chapterId, isFree, isPublished } = body;

  if (!title || !slug || !chapterId) {
    return NextResponse.json({ message: "Field wajib: judul, slug, bab." }, { status: 400 });
  }

  const conflict = await prisma.module.findFirst({ where: { slug, NOT: { id } } });
  if (conflict) {
    return NextResponse.json({ message: "Slug sudah dipakai modul lain." }, { status: 400 });
  }

  const modul = await prisma.module.update({
    where: { id },
    data: { title, slug, description: description || null, youtubeId: youtubeId || null, duration, order, chapterId, isFree, isPublished },
  });

  return NextResponse.json(modul);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.progress.deleteMany({ where: { moduleId: id } });
  await prisma.module.delete({ where: { id } });
  return NextResponse.json({ message: "Modul dihapus." });
}

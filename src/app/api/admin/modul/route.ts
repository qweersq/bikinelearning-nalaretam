import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, slug, description, youtubeId, duration, order, chapterId, isFree, isPublished } = body;

  if (!title || !slug || !chapterId) {
    return NextResponse.json({ message: "Field wajib: judul, slug, bab." }, { status: 400 });
  }

  const existing = await prisma.module.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ message: "Slug sudah dipakai, gunakan slug lain." }, { status: 400 });
  }

  const modul = await prisma.module.create({
    data: { title, slug, description: description || null, youtubeId: youtubeId || null, duration, order, chapterId, isFree, isPublished },
  });

  return NextResponse.json(modul, { status: 201 });
}

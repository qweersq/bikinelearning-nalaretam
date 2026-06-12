import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { name, slug, description, order } = await req.json();
  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanSlug = typeof slug === "string" ? slug.trim().toLowerCase() : "";

  if (!cleanName || !cleanSlug) {
    return NextResponse.json({ message: "Nama dan slug kategori wajib diisi." }, { status: 400 });
  }

  const duplicate = await prisma.category.findFirst({
    where: { slug: cleanSlug, NOT: { id } },
    select: { id: true },
  });
  if (duplicate) {
    return NextResponse.json({ message: "Slug kategori sudah dipakai." }, { status: 400 });
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: cleanName,
      slug: cleanSlug,
      description: description?.trim() || null,
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const courseCount = await prisma.course.count({ where: { categoryId: id } });

  if (courseCount > 0) {
    return NextResponse.json(
      { message: `Kategori masih digunakan oleh ${courseCount} materi.` },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

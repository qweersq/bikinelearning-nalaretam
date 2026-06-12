import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { courses: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { name, slug, description, order } = await req.json();
  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanSlug = typeof slug === "string" ? slug.trim().toLowerCase() : "";

  if (!cleanName || !cleanSlug) {
    return NextResponse.json({ message: "Nama dan slug kategori wajib diisi." }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { slug: cleanSlug } });
  if (existing) {
    return NextResponse.json({ message: "Slug kategori sudah dipakai." }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: {
      name: cleanName,
      slug: cleanSlug,
      description: description?.trim() || null,
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
    },
  });

  return NextResponse.json(category, { status: 201 });
}

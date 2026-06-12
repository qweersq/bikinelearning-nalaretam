import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }

  const courses = await prisma.course.findMany({
    include: {
      category: { select: { name: true } },
      modules: { select: { id: true } },
      transactions: { where: { status: "SUCCESS" }, select: { amount: true } },
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }

  const { title, slug, description, status, categoryId, order, thumbnail } = await req.json();

  if (!title || !slug || !categoryId) {
    return NextResponse.json({ message: "Title, slug, dan kategori wajib diisi." }, { status: 400 });
  }

  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ message: "Slug sudah dipakai." }, { status: 400 });

  const course = await prisma.course.create({
    data: { title, slug, description: description || null, price: 0, status: status || "DRAFT", categoryId, order: order || 0, thumbnail: thumbnail || null },
  });

  return NextResponse.json(course, { status: 201 });
}

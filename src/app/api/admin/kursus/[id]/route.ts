import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }

  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      category: true,
      chapters: {
        orderBy: { order: "asc" },
        include: {
          modules: { orderBy: { order: "asc" } }
        }
      },
      transactions: { where: { status: "SUCCESS" }, select: { amount: true } },
    },
  });
  if (!course) return NextResponse.json({ message: "Kursus tidak ditemukan." }, { status: 404 });
  return NextResponse.json(course);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }

  const { id } = await params;
  const { title, slug, description, status, categoryId, order, thumbnail } = await req.json();

  if (!title || !slug || !categoryId) {
    return NextResponse.json({ message: "Title, slug, dan kategori wajib diisi." }, { status: 400 });
  }

  const conflict = await prisma.course.findFirst({ where: { slug, NOT: { id } } });
  if (conflict) return NextResponse.json({ message: "Slug sudah dipakai." }, { status: 400 });

  const course = await prisma.course.update({
    where: { id },
    data: { title, slug, description: description || null, price: 0, status, categoryId, order: order || 0, thumbnail: thumbnail ?? null },
  });
  return NextResponse.json(course);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }

  const { id } = await params;
  // Delete progresses first matching modules in chapters under the course
  await prisma.progress.deleteMany({
    where: {
      module: {
        chapter: {
          courseId: id
        }
      }
    }
  });
  // Delete chapters (will cascade delete modules and widgets)
  await prisma.chapter.deleteMany({ where: { courseId: id } });
  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ message: "Kursus dihapus." });
}

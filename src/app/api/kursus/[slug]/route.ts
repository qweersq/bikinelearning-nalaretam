import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await requireSession();
    const { slug } = await params;

    const modul = await prisma.module.findUnique({
      where: { slug, isPublished: true },
      include: { chapter: { include: { course: true } } },
    });
    if (!modul) return NextResponse.json({ message: "Modul tidak ditemukan." }, { status: 404 });

    const allModules = await prisma.module.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      select: { id: true, slug: true, title: true, order: true },
    });

    const idx = allModules.findIndex((m) => m.id === modul.id);
    const prev = idx > 0 ? allModules[idx - 1] : null;
    const next = idx < allModules.length - 1 ? allModules[idx + 1] : null;

    const progress = await prisma.progress.findUnique({
      where: { userId_moduleId: { userId: session.id, moduleId: modul.id } },
    });

    return NextResponse.json({ ...modul, prev, next, completed: progress?.completed ?? false });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

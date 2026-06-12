import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { createNotif } from "@/lib/notify";

export async function POST(_: NextRequest, { params }: { params: Promise<{ moduleId: string }> }) {
  try {
    const session = await requireSession();
    const { moduleId } = await params;

    await prisma.progress.upsert({
      where: { userId_moduleId: { userId: session.id, moduleId } },
      update: { completed: true, completedAt: new Date() },
      create: { userId: session.id, moduleId, completed: true, completedAt: new Date() },
    });

    // Check if all modules in the course are now completed
    const module = await prisma.module.findUnique({ where: { id: moduleId }, select: { courseId: true, course: { select: { title: true } } } });
    if (module) {
      const publishedModules = await prisma.module.findMany({ where: { courseId: module.courseId, isPublished: true }, select: { id: true } });
      const completed = await prisma.progress.findMany({ where: { userId: session.id, completed: true, moduleId: { in: publishedModules.map((m) => m.id) } } });
      if (publishedModules.length > 0 && completed.length >= publishedModules.length) {
        await createNotif(session.id, "completion", "Kursus Selesai! 🎓", `Selamat! Kamu telah menyelesaikan semua modul kursus "${module.course.title}". Jangan lupa kerjakan quiz untuk mendapatkan sertifikat.`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

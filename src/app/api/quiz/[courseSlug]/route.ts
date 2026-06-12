import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ courseSlug: string }> }) {
  let session;
  try { session = await requireSession(); } catch { return NextResponse.json({ message: "Unauthorized" }, { status: 401 }); }

  const { courseSlug } = await params;
  const course = await prisma.course.findUnique({ where: { slug: courseSlug }, select: { id: true, title: true } });
  if (!course) return NextResponse.json({ message: "Course tidak ditemukan." }, { status: 404 });

  const quiz = await prisma.quiz.findUnique({
    where: { courseId: course.id },
    include: {
      questions: {
        where: {},
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" }, select: { id: true, text: true } } },
      },
    },
  });

  if (!quiz || !quiz.isPublished) return NextResponse.json({ message: "Quiz belum tersedia." }, { status: 404 });

  const lastAttempt = await prisma.quizAttempt.findFirst({
    where: { userId: session.id, quizId: quiz.id },
    orderBy: { completedAt: "desc" },
  });

  return NextResponse.json({ quiz, course, lastAttempt });
}

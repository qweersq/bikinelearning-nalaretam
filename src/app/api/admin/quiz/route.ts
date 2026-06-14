import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }

  const { courseId, chapterId, moduleId, title, description, passingScore, timeLimit, isPublished } = await req.json();
  if (!courseId || !title) return NextResponse.json({ message: "courseId dan title wajib." }, { status: 400 });

  const existing = await prisma.quiz.findFirst({
    where: {
      courseId,
      chapterId: chapterId || null,
      moduleId: moduleId || null,
    },
  });
  if (existing) return NextResponse.json({ message: "Quiz/Latihan Soal untuk cakupan ini sudah ada." }, { status: 400 });

  const quiz = await prisma.quiz.create({
    data: {
      courseId,
      chapterId: chapterId || null,
      moduleId: moduleId || null,
      title,
      description: description || null,
      passingScore: passingScore || 70,
      timeLimit: timeLimit || null,
      isPublished: !!isPublished,
    },
  });
  return NextResponse.json(quiz, { status: 201 });
}

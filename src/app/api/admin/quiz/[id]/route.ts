import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }
  const { id } = await params;
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { questions: { include: { options: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } }, attempts: { select: { id: true } } },
  });
  if (!quiz) return NextResponse.json({ message: "Quiz tidak ditemukan." }, { status: 404 });
  return NextResponse.json(quiz);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }
  const { id } = await params;
  const { title, description, passingScore, timeLimit, isPublished } = await req.json();
  const quiz = await prisma.quiz.update({
    where: { id },
    data: { title, description: description || null, passingScore: passingScore || 70, timeLimit: timeLimit || null, isPublished: !!isPublished },
  });
  return NextResponse.json(quiz);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }
  const { id } = await params;
  await prisma.quizAttempt.deleteMany({ where: { quizId: id } });
  await prisma.quizOption.deleteMany({ where: { question: { quizId: id } } });
  await prisma.quizQuestion.deleteMany({ where: { quizId: id } });
  await prisma.quiz.delete({ where: { id } });
  return NextResponse.json({ message: "Quiz dihapus." });
}

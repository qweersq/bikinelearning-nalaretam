import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }

  const { courseId, title, description, passingScore, timeLimit, isPublished } = await req.json();
  if (!courseId || !title) return NextResponse.json({ message: "courseId dan title wajib." }, { status: 400 });

  const existing = await prisma.quiz.findUnique({ where: { courseId } });
  if (existing) return NextResponse.json({ message: "Kursus sudah punya quiz." }, { status: 400 });

  const quiz = await prisma.quiz.create({
    data: { courseId, title, description: description || null, passingScore: passingScore || 70, timeLimit: timeLimit || null, isPublished: !!isPublished },
  });
  return NextResponse.json(quiz, { status: 201 });
}

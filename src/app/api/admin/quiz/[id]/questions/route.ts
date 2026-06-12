import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }

  const { id: quizId } = await params;
  const { question, type, order, options, expectedAnswer } = await req.json();

  if (!question || !type) return NextResponse.json({ message: "Question dan type wajib." }, { status: 400 });

  const q = await prisma.quizQuestion.create({
    data: {
      quizId, question, type, order: order || 0,
      expectedAnswer: type === "ESSAY" ? (expectedAnswer || null) : null,
      options: type === "MULTIPLE_CHOICE" && options?.length
        ? { create: options.map((o: { text: string; isCorrect: boolean }, i: number) => ({ text: o.text, isCorrect: o.isCorrect, order: i })) }
        : undefined,
    },
    include: { options: true },
  });
  return NextResponse.json(q, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string; qId: string }> };

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }
  const { qId } = await params;
  await prisma.quizOption.deleteMany({ where: { questionId: qId } });
  await prisma.quizQuestion.delete({ where: { id: qId } });
  return NextResponse.json({ message: "Pertanyaan dihapus." });
}

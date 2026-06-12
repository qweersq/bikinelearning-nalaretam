import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import QuizEditClient, { type AttemptAnswer } from "./QuizEditClient";

export const dynamic = "force-dynamic";

export default async function QuizEditPage({ params }: { params: Promise<{ id: string; quizId: string }> }) {
  await requireAdmin();
  const { id: courseId, quizId } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: { include: { options: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
      attempts: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { completedAt: "desc" },
      },
    },
  });

  if (!quiz || quiz.courseId !== courseId) notFound();

  const serialized = {
    ...quiz,
    attempts: quiz.attempts.map((a) => ({
      ...a,
      completedAt: a.completedAt.toISOString(),
      answers: (a.answers as AttemptAnswer[]) ?? [],
    })),
  };

  return <QuizEditClient courseId={courseId} quiz={serialized} />;
}

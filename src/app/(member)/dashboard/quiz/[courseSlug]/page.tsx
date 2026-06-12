import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import QuizClient from "./QuizClient";

export const dynamic = "force-dynamic";

export default async function QuizPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const session = await requireSession();
  const { courseSlug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: { id: true, title: true, slug: true },
  });
  if (!course) notFound();

  const quiz = await prisma.quiz.findUnique({
    where: { courseId: course.id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" }, select: { id: true, text: true } } },
      },
    },
  });

  if (!quiz || !quiz.isPublished) notFound();

  const lastAttempt = await prisma.quizAttempt.findFirst({
    where: { userId: session.id, quizId: quiz.id },
    orderBy: { completedAt: "desc" },
  });

  return (
    <QuizClient
      course={{ id: course.id, title: course.title, slug: course.slug }}
      quiz={{
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        passingScore: quiz.passingScore,
        timeLimit: quiz.timeLimit,
        questions: quiz.questions.map((q) => ({
          id: q.id,
          question: q.question,
          type: q.type as "MULTIPLE_CHOICE" | "ESSAY",
          options: q.options,
        })),
      }}
      lastAttempt={lastAttempt ? { score: lastAttempt.score, passed: lastAttempt.passed, completedAt: lastAttempt.completedAt.toISOString() } : null}
    />
  );
}

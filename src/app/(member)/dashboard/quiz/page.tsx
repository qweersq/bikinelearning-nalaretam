import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QuizListUI from "./QuizListUI";

export const dynamic = "force-dynamic";

export default async function QuizzesListPage() {
  const session = await requireSession();

  const [quizzes, categories] = await Promise.all([
    prisma.quiz.findMany({
      where: {
        isPublished: true,
        course: {
          status: "PUBLISHED",
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            categoryId: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        chapter: {
          select: {
            id: true,
            title: true,
          },
        },
        module: {
          select: {
            id: true,
            title: true,
          },
        },
        questions: {
          select: {
            id: true,
          },
        },
        attempts: {
          where: {
            userId: session.id,
          },
          orderBy: {
            completedAt: "desc",
          },
        },
      },
      orderBy: [
        { course: { order: "asc" } },
        { chapter: { order: "asc" } },
        { createdAt: "asc" },
      ],
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);

  const quizzesWithStats = quizzes.map((q) => {
    const attempts = q.attempts;
    const bestAttempt = attempts.length > 0
      ? attempts.reduce((best, current) => (current.score > best.score ? current : best), attempts[0])
      : null;
    const lastAttempt = attempts[0] || null;
    const passed = attempts.some((a) => a.passed);

    return {
      id: q.id,
      title: q.title,
      description: q.description,
      passingScore: q.passingScore,
      timeLimit: q.timeLimit,
      courseSlug: q.course.slug,
      courseTitle: q.course.title,
      categoryId: q.course.categoryId,
      categoryName: q.course.category.name,
      thumbnail: q.course.thumbnail,
      questionCount: q.questions.length,
      chapterTitle: q.chapter?.title || null,
      moduleTitle: q.module?.title || null,
      attemptCount: attempts.length,
      passed,
      bestScore: bestAttempt?.score ?? null,
      lastScore: lastAttempt?.score ?? null,
    };
  });

  return <QuizListUI quizzes={quizzesWithStats} categories={categories} />;
}

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [course, categories] = await Promise.all([
    prisma.course.findUnique({
      where: { id },
      include: {
        chapters: {
          include: {
            modules: { select: { id: true } }
          }
        },
        transactions: { where: { status: "SUCCESS" }, select: { amount: true, userId: true } },
        quizzes: { where: { chapterId: null, moduleId: null }, select: { id: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!course) notFound();

  const studentCount = new Set(course.transactions.map((t) => t.userId)).size;
  const revenue = course.transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalModules = course.chapters.reduce((sum, ch) => sum + ch.modules.length, 0);

  return (
    <CourseDetailClient
      course={{
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description ?? "",
        status: course.status,
        categoryId: course.categoryId,
        thumbnail: course.thumbnail ?? "",
        moduleCount: totalModules,
        studentCount,
        revenue,
        hasQuiz: course.quizzes.length > 0,
      }}
      categories={categories}
    />
  );
}

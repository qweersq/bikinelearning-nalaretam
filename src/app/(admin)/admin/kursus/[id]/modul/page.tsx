import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdminModuleListClient from "./AdminModuleListClient";

export const dynamic = "force-dynamic";

export default async function AdminModuleListPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          modules: { orderBy: { order: "asc" } },
          quizzes: { orderBy: { createdAt: "asc" } },
        },
      },
      quizzes: {
        where: { chapterId: null, moduleId: null },
      },
      transactions: { where: { status: "SUCCESS" }, select: { userId: true } },
    },
  });

  if (!course) notFound();

  const studentCount = new Set(course.transactions.map((t) => t.userId)).size;

  return (
    <AdminModuleListClient
      courseId={course.id}
      courseTitle={course.title}
      courseDescription={course.description}
      courseSlug={course.slug}
      studentCount={studentCount}
      initialChapters={course.chapters}
      finalQuizzes={course.quizzes}
    />
  );
}

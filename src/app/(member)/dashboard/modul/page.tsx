import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CoursesUI from "./CoursesUI";

export const dynamic = "force-dynamic";

export default async function CoursesListPage() {
  const session = await requireSession();

  const [courses, categories, progresses] = await Promise.all([
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      include: {
        category: true,
        chapters: {
          include: {
            modules: { where: { isPublished: true }, select: { id: true, duration: true } },
          },
        },
      },
      orderBy: { order: "asc" },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.progress.findMany({ where: { userId: session.id, completed: true }, select: { moduleId: true } }),
  ]);

  const completedIds = new Set(progresses.map((p) => p.moduleId));

  const coursesWithStats = courses.map((c) => {
    const allModules = c.chapters.flatMap((ch) => ch.modules);
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      thumbnail: c.thumbnail,
      categoryId: c.categoryId,
      category: c.category,
      moduleCount: allModules.length,
      totalDuration: allModules.reduce((sum, m) => sum + m.duration, 0),
      completedCount: allModules.filter((m) => completedIds.has(m.id)).length,
    };
  });

  return <CoursesUI courses={coursesWithStats} categories={categories} />;
}

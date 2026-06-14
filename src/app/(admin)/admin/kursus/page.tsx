import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CourseListUI from "./CourseListUI";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  await requireAdmin();

  const courses = await prisma.course.findMany({
    include: {
      chapters: {
        include: {
          modules: { select: { id: true } }
        }
      },
      transactions: { where: { status: "SUCCESS" }, select: { amount: true, userId: true } },
    },
    orderBy: { order: "asc" },
  });

  const coursesWithStats = courses.map((c) => {
    const totalModules = c.chapters.reduce((sum, ch) => sum + ch.modules.length, 0);
    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      status: c.status,
      moduleCount: totalModules,
      studentCount: new Set(c.transactions.map((t) => t.userId)).size,
      revenue: c.transactions.reduce((sum, t) => sum + t.amount, 0),
    };
  });

  return <CourseListUI courses={coursesWithStats} />;
}

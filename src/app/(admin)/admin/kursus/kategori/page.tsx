import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CategoryManager from "./CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCourseCategoriesPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { courses: true } } },
  });

  return <CategoryManager categories={categories} />;
}

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import StudentsUI from "./StudentsUI";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const q = sp.q?.trim() ?? "";
  const filter = (sp.filter as "All" | "Active" | "Inactive" | "Completed") ?? "All";

  const totalModules = await prisma.module.count({ where: { isPublished: true } });

  // Build base where
  let where: Prisma.UserWhereInput = { role: "USER" };

  if (q) {
    where = {
      ...where,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    };
  }

  if (filter === "Active") where = { ...where, hasAccess: true };
  if (filter === "Inactive") where = { ...where, hasAccess: false };
  if (filter === "Completed" && totalModules > 0) {
    const grouped = await prisma.progress.groupBy({
      by: ["userId"],
      where: { completed: true },
      _count: { id: true },
    });
    const completedIds = grouped.filter((g) => g._count.id >= totalModules).map((g) => g.userId);
    where = { ...where, id: { in: completedIds } };
  }

  const [users, totalCount, statsActive, statsCerts] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        progress: { where: { completed: true }, select: { moduleId: true } },
        certificates: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: "USER", hasAccess: true } }),
    prisma.certificate.count(),
  ]);

  const students = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    hasAccess: u.hasAccess,
    completedCount: u.progress.length,
    certCount: u.certificates.length,
    progress: totalModules > 0 ? Math.round((u.progress.length / totalModules) * 100) : 0,
  }));

  const totalUsers = await prisma.user.count({ where: { role: "USER" } });
  const avgProgress = totalModules > 0
    ? Math.round(
        (await prisma.progress.count({ where: { completed: true, user: { role: "USER" } } })) /
        Math.max(1, totalUsers) / totalModules * 100
      )
    : 0;

  return (
    <StudentsUI
      students={students}
      stats={{ total: totalUsers, active: statsActive, certificates: statsCerts, avgProgress }}
      pagination={{ page, totalCount, pageSize: PAGE_SIZE }}
      currentQ={q}
      currentFilter={filter}
    />
  );
}

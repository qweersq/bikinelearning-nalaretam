import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TransactionsUI from "./TransactionsUI";

export const dynamic = "force-dynamic";

export default async function AdminTransaksiPage() {
  await requireAdmin();

  const transactions = await prisma.transaction.findMany({
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = transactions.map((t) => ({
    id: t.id,
    userName: t.user.name,
    userEmail: t.user.email,
    courseTitle: t.course?.title ?? "Nalar Etam",
    amount: t.amount,
    status: t.status as "SUCCESS" | "PENDING" | "FAILED" | "EXPIRED",
    paymentMethod: t.paymentMethod,
    createdAt: t.createdAt.toISOString(),
    paidAt: t.paidAt?.toISOString() ?? null,
  }));

  const total = data.length;
  const paid = data.filter((t) => t.status === "SUCCESS").length;
  const pending = data.filter((t) => t.status === "PENDING").length;

  return <TransactionsUI transactions={data} summary={{ total, paid, pending }} />;
}

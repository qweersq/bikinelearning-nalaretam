import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function AdminModulPage() {
  await requireAdmin();
  const modules = await prisma.module.findMany({
    include: { course: true },
    orderBy: [{ course: { order: "asc" } }, { order: "asc" }],
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-stone-900">Kelola Modul</h1>
          <p className="mt-1 text-stone-500">{modules.length} modul terdaftar.</p>
        </div>
        <Link href="/admin/modul/tambah">
          <Button size="sm">+ Tambah Modul</Button>
        </Link>
      </div>

      <Card>
        <div className="divide-y divide-stone-100">
          {modules.length === 0 ? (
            <p className="px-5 py-10 text-sm text-stone-400 text-center">Belum ada modul. Tambah modul pertamamu.</p>
          ) : modules.map((m) => (
            <div key={m.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-sm font-bold text-white">
                {m.order}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-900 text-sm">{m.title}</p>
                <p className="text-xs text-stone-400 mt-0.5">{m.course.title} · {m.duration} mnt</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={m.isPublished ? "green" : "neutral"}>
                  {m.isPublished ? "Aktif" : "Draft"}
                </Badge>
                <Link href={`/admin/modul/${m.id}/edit`}>
                  <Button variant="secondary" size="sm">Edit</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

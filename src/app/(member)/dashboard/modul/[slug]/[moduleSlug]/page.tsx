import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import MarkCompleteButton from "./MarkCompleteButton";

export const dynamic = "force-dynamic";

export default async function ModulePlayerPage({
  params,
}: {
  params: Promise<{ slug: string; moduleSlug: string }>;
}) {
  const session = await requireSession();
  const { slug: courseSlug, moduleSlug } = await params;
  const isAdmin = session.role === "ADMIN";

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      modules: { where: isAdmin ? {} : { isPublished: true }, orderBy: { order: "asc" } },
    },
  });
  if (!course) notFound();

  const modul = course.modules.find((m) => m.slug === moduleSlug);
  if (!modul) notFound();

  const moduleIds = course.modules.map((m) => m.id);
  const progresses = await prisma.progress.findMany({
    where: { userId: session.id, completed: true, moduleId: { in: moduleIds } },
    select: { moduleId: true },
  });

  const completedSet = new Set(progresses.map((p) => p.moduleId));
  const currentIdx = course.modules.findIndex((m) => m.id === modul.id);
  const prevModule = currentIdx > 0 ? course.modules[currentIdx - 1] : null;
  const nextModule = currentIdx < course.modules.length - 1 ? course.modules[currentIdx + 1] : null;
  const completedCount = completedSet.size;
  const percent = course.modules.length > 0 ? Math.round((completedCount / course.modules.length) * 100) : 0;
  const isCompleted = completedSet.has(modul.id);

  return (
    <div className="-mx-5 -mt-5 pb-[120px]">
      {/* Video Player */}
      <div className="relative">
        <div className="relative h-[240px] bg-gradient-to-br from-[#2563eb] to-[#23c873]">
          <Link
            href={`/dashboard/modul/${courseSlug}`}
            className="absolute left-5 top-5 flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white/20 text-white"
          >
            <ArrowLeft size={20} />
          </Link>

          {/* Duration badge */}
          <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white">
            {modul.duration} mnt
          </div>

          {/* YouTube embed */}
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${modul.youtubeId}?rel=0&modestbranding=1`}
            title={modul.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white px-5 pb-6 pt-5">
        {/* Course label */}
        <p className="text-xs font-bold text-[#2563eb]">{course.title.toUpperCase()}</p>

        {/* Module title */}
        <h1 className="mt-2 text-[26px] font-extrabold leading-snug text-stone-900">{modul.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#666]">
          Materi {modul.order} · {modul.description ?? ""}
        </p>

        {/* Progress */}
        <div className="mt-[25px] rounded-[20px] bg-[#f7f9fc] p-[18px]">
          <div className="mb-2.5 flex justify-between text-sm font-medium">
            <span className="text-stone-500">Progress Kursus</span>
            <strong className="text-stone-900">{percent}%</strong>
          </div>
          <div className="h-[10px] overflow-hidden rounded-full bg-[#e6eaf0]">
            <div
              className="h-full rounded-full bg-[#2563eb] transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Description */}
        {modul.description && (
          <p className="mt-5 text-sm leading-relaxed text-[#666]">{modul.description}</p>
        )}
      </div>

      {/* Course Content List */}
      <div className="px-5 pt-2">
        <div className="mb-[18px] flex items-center justify-between">
          <h3 className="text-[22px] font-bold text-stone-900">Konten Kursus</h3>
          <span className="text-sm text-stone-400">{course.modules.length} Pelajaran</span>
        </div>

        <div className="flex flex-col gap-3">
          {course.modules.map((m) => {
            const isCurrentModule = m.id === modul.id;
            const isCompletedModule = completedSet.has(m.id);

            return (
              <Link key={m.id} href={`/dashboard/modul/${courseSlug}/${m.slug}`}>
                <div className="flex items-center justify-between rounded-[18px] border border-[#edf0f5] bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isCurrentModule
                        ? "bg-[#2563eb] text-white"
                        : isCompletedModule
                        ? "bg-[#eff6ff] text-[#2563eb]"
                        : "bg-[#f5f7fa] text-stone-400"
                    }`}>
                      {isCompletedModule && !isCurrentModule ? <CheckCircle2 size={18} /> : m.order}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900">{m.title}</h4>
                      <p className="mt-0.5 text-xs text-[#888]">{m.duration} Menit</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Fixed bottom prev/next */}
      <MarkCompleteButton
        moduleId={modul.id}
        isCompleted={isCompleted}
        nextSlug={nextModule?.slug ?? null}
        courseSlug={courseSlug}
      />
    </div>
  );
}

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, BookOpen, Video, Code, Globe } from "lucide-react";
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

  // Load specific module with its widgets
  const modulWithWidgets = await prisma.module.findUnique({
    where: { id: modul.id },
    include: {
      widgets: {
        orderBy: { order: "asc" },
      },
    },
  });

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

  const widgets = modulWithWidgets?.widgets || [];

  return (
    <div className="mx-auto max-w-[720px] px-4 pb-32 pt-4 min-h-screen bg-[#f5f7fb]">
      
      {/* Back Button */}
      <Link href={`/dashboard/modul/${courseSlug}`}>
        <button className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white border-0 shadow-[0_4px_12px_rgba(0,0,0,0.06)] cursor-pointer text-stone-600 hover:bg-stone-50 transition-colors mb-5">
          ←
        </button>
      </Link>

      {/* Course Tag */}
      <div className="text-[#2563eb] text-xs font-bold uppercase tracking-wider mb-2">
        {course.title}
      </div>

      {/* Module Title & Subtext */}
      <h1 className="text-3xl font-extrabold text-stone-900 mb-2 leading-tight">
        Materi {modul.order}: {modul.title}
      </h1>
      
      {modul.description && (
        <p className="text-[#6b7280] text-[15px] leading-relaxed mb-6">
          {modul.description}
        </p>
      )}

      {/* Progress Card */}
      <div className="bg-white p-5 rounded-[20px] shadow-[0_8px_25px_rgba(0,0,0,0.05)] mb-5">
        <div className="flex justify-between mb-3 text-sm font-semibold">
          <span className="text-stone-500">Progress Pembelajaran</span>
          <span className="text-stone-900">{percent}%</span>
        </div>
        <div className="h-2.5 bg-[#e5e7eb] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2563eb] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Learning Journey Card */}
      {widgets.length > 0 && (
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-[22px] font-bold text-stone-900 mb-3.5">
            <BookOpen className="w-5.5 h-5.5 text-stone-700" />
            Alur Belajar
          </h2>
          <div className="bg-white rounded-[20px] p-5 shadow-[0_8px_25px_rgba(0,0,0,0.05)] space-y-4">
            {widgets.map((widget, index) => {
              let widgetTitle = widget.title || "Media Pembelajaran";
              let widgetDesc = "Pelajari materi pendukung";

              if (widget.type === "VIDEO") {
                widgetTitle = widget.title || `Video Penjelasan ${index + 1}`;
                widgetDesc = "Tonton video materi teori";
              } else if (widget.type === "HTML_JS") {
                widgetTitle = widget.title || "Simulasi Interaktif";
                widgetDesc = "Coba manipulasi parameter dan lihat hasilnya";
              } else if (widget.type === "IFRAME") {
                widgetTitle = widget.title || "Media Embed Eksternal";
                widgetDesc = "Pelajari konsep visual interaktif";
              }

              return (
                <div key={widget.id || index} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#dbeafe] text-[#2563eb] flex items-center justify-center font-bold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm leading-tight">{widgetTitle}</h3>
                    <p className="text-stone-500 text-xs mt-0.5">{widgetDesc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Content Cards */}
      {widgets.length === 0 ? (
        <div className="bg-white rounded-[24px] p-8 text-center shadow-[0_8px_25px_rgba(0,0,0,0.05)] text-stone-400">
          <p className="text-sm font-medium">Materi ini belum memiliki konten.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {widgets.map((widget, idx) => {
            let IconComponent = Globe;
            let iconBgClass = "bg-emerald-50 text-emerald-600";
            let displayTitle = widget.title || "Media Interaktif";
            let displayDesc = "Pelajari konsep visual interaktif di bawah ini:";

            if (widget.type === "VIDEO") {
              IconComponent = Video;
              iconBgClass = "bg-red-50 text-red-600";
              displayTitle = widget.title || `Video Penjelasan`;
              displayDesc = "Simak penjelasan video di bawah ini secara seksama:";
            } else if (widget.type === "HTML_JS") {
              IconComponent = Code;
              iconBgClass = "bg-indigo-50 text-indigo-600";
              displayTitle = widget.title || "Simulasi Interaktif";
              displayDesc = "Ubah parameter simulasi dan amati bagaimana hasilnya berubah secara langsung:";
            }

            return (
              <div key={widget.id || idx} className="bg-white rounded-[24px] p-5 shadow-[0_8px_25px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-[14px] flex justify-center items-center shrink-0 ${iconBgClass}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900 leading-tight">
                      {displayTitle}
                    </h2>
                  </div>
                </div>

                <p className="text-stone-500 text-sm leading-relaxed mb-4">
                  {displayDesc}
                </p>

                {/* Content Renderers */}
                {widget.type === "VIDEO" && (
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
                    <iframe
                      className="h-full w-full border-0"
                      src={`https://www.youtube.com/embed/${widget.iframeUrl}`}
                      title={`YouTube Video ${idx + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {widget.type === "HTML_JS" && (
                  <iframe
                    sandbox="allow-scripts"
                    className="h-[480px] w-full rounded-2xl bg-white border border-stone-100 shadow-inner"
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta charset="utf-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1">
                          <style>
                            body {
                              margin: 0;
                              padding: 16px;
                              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                              color: #1c1917;
                              background: #ffffff;
                            }
                            ${widget.cssCode || ""}
                          </style>
                        </head>
                        <body>
                          ${widget.htmlCode || ""}
                          <script>
                            try {
                              ${widget.jsCode || ""}
                            } catch (e) {
                              document.body.innerHTML += '<div style="color: #dc2626; padding: 12px; border: 1px solid #fca5a5; background: #fef2f2; border-radius: 8px; margin-top: 12px; font-size: 14px;"><strong>JavaScript Error:</strong> ' + e.message + '</div>';
                            }
                          </script>
                        </body>
                      </html>
                    `}
                  />
                )}

                {widget.type === "IFRAME" && (
                  <iframe
                    className="h-[480px] w-full rounded-2xl bg-white border border-stone-100 shadow-inner"
                    src={widget.iframeUrl || ""}
                    title={`External Simulation ${idx + 1}`}
                    allowFullScreen
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Navigation buttons (Mark complete & Next) */}
      <MarkCompleteButton
        moduleId={modul.id}
        isCompleted={isCompleted}
        nextSlug={nextModule?.slug ?? null}
        courseSlug={courseSlug}
      />
    </div>
  );
}

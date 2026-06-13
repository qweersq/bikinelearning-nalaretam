import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id: moduleId } = await params;
  
  // Verify module exists
  const moduleExists = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!moduleExists) {
    return NextResponse.json({ message: "Modul tidak ditemukan." }, { status: 404 });
  }

  try {
    const body = await req.json(); // Array of widgets: { id?, type, htmlCode, jsCode, cssCode, iframeUrl, order }
    if (!Array.isArray(body)) {
      return NextResponse.json({ message: "Body harus berupa array widget." }, { status: 400 });
    }

    // Filter out valid IDs to prevent deletion
    const existingIdsToKeep = body
      .map((w: any) => w.id)
      .filter((id: any) => typeof id === "string" && id.length > 0);

    await prisma.$transaction(async (tx) => {
      // 1. Delete widgets that are not in the new payload
      await tx.moduleWidget.deleteMany({
        where: {
          moduleId,
          id: { notIn: existingIdsToKeep }
        }
      });

      // 2. Upsert each widget in the payload
      for (let i = 0; i < body.length; i++) {
        const w = body[i];
        const widgetData = {
          type: w.type || "HTML_JS",
          title: w.title || null,
          htmlCode: w.htmlCode || null,
          jsCode: w.jsCode || null,
          cssCode: w.cssCode || null,
          iframeUrl: w.iframeUrl || null,
          order: typeof w.order === "number" ? w.order : i,
        };

        if (w.id && existingIdsToKeep.includes(w.id)) {
          // Update existing
          await tx.moduleWidget.update({
            where: { id: w.id },
            data: widgetData
          });
        } else {
          // Create new
          await tx.moduleWidget.create({
            data: {
              ...widgetData,
              moduleId
            }
          });
        }
      }
    });

    // Fetch and return the updated widgets list
    const updatedWidgets = await prisma.moduleWidget.findMany({
      where: { moduleId },
      orderBy: { order: "asc" }
    });

    return NextResponse.json(updatedWidgets);
  } catch (error: any) {
    console.error("Error syncing widgets:", error);
    return NextResponse.json({ message: error.message || "Gagal sinkronisasi widget." }, { status: 500 });
  }
}

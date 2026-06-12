import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }
  const template = await prisma.certificateTemplate.findFirst({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(template ?? null);
}

export async function PUT(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }
  const { title, text, logoUrl, backgroundUrl, signatureUrl } = await req.json();

  const existing = await prisma.certificateTemplate.findFirst({ orderBy: { createdAt: "asc" } });
  const data = { title, text, logoUrl: logoUrl || null, backgroundUrl: backgroundUrl || null, signatureUrl: signatureUrl || null };

  const template = existing
    ? await prisma.certificateTemplate.update({ where: { id: existing.id }, data })
    : await prisma.certificateTemplate.create({ data });

  return NextResponse.json(template);
}

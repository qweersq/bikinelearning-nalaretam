import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }
  const setting = await prisma.setting.upsert({
    where: { id: "singleton" },
    create: {},
    update: {},
  });
  return NextResponse.json(setting);
}

export async function PUT(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }
  const body = await req.json();
  const setting = await prisma.setting.upsert({
    where: { id: "singleton" },
    create: { ...body },
    update: { ...body },
  });
  return NextResponse.json(setting);
}

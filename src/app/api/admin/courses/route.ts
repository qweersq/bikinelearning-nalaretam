import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const courses = await prisma.course.findMany({
    orderBy: { order: "asc" },
    select: { id: true, title: true, slug: true, status: true, order: true },
  });
  return NextResponse.json(courses);
}

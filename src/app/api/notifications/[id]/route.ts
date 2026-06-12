import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try { session = await requireSession(); } catch { return NextResponse.json({ message: "Unauthorized" }, { status: 401 }); }

  const { id } = await params;
  await prisma.notification.updateMany({
    where: { id, userId: session.id },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}

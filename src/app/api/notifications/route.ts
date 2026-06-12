import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  let session;
  try { session = await requireSession(); } catch { return NextResponse.json({ message: "Unauthorized" }, { status: 401 }); }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(notifications);
}

// Mark all as read
export async function PATCH() {
  let session;
  try { session = await requireSession(); } catch { return NextResponse.json({ message: "Unauthorized" }, { status: 401 }); }

  await prisma.notification.updateMany({
    where: { userId: session.id, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}

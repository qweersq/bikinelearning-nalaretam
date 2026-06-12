import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createNotif } from "@/lib/notify";

export async function POST(_: NextRequest, { params }: { params: Promise<{ certNumber: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false });

  const { certNumber } = await params;

  const cert = await prisma.certificate.findUnique({
    where: { certificateNumber: certNumber },
    include: { course: { select: { title: true } } },
  });

  if (!cert || cert.userId !== session.id) return NextResponse.json({ ok: false });

  await createNotif(
    session.id,
    "cert_download",
    "Sertifikat Diunduh",
    `Sertifikat kursus "${cert.course.title}" berhasil diunduh.`,
  );

  return NextResponse.json({ ok: true });
}

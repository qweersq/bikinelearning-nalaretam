import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(promos);
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { code, discount, maxUses, expiresAt } = await req.json();
  if (!code || !discount) {
    return NextResponse.json({ message: "Kode dan diskon wajib diisi." }, { status: 400 });
  }
  if (discount < 1 || discount > 100) {
    return NextResponse.json({ message: "Diskon harus antara 1–100%." }, { status: 400 });
  }

  const existing = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase().trim() } });
  if (existing) return NextResponse.json({ message: "Kode sudah ada." }, { status: 400 });

  const promo = await prisma.promoCode.create({
    data: {
      code: code.toUpperCase().trim(),
      discount: Number(discount),
      maxUses: maxUses ? Number(maxUses) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json(promo, { status: 201 });
}

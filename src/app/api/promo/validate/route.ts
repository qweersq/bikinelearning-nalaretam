import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ message: "Login dulu." }, { status: 401 });
  }

  const { code, originalPrice } = await req.json();
  if (!code) return NextResponse.json({ message: "Masukkan kode promo." }, { status: 400 });

  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase().trim() },
  });

  if (!promo || !promo.isActive) {
    return NextResponse.json({ message: "Kode promo tidak valid." }, { status: 404 });
  }
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return NextResponse.json({ message: "Kode promo sudah kadaluarsa." }, { status: 400 });
  }
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return NextResponse.json({ message: "Kode promo sudah habis digunakan." }, { status: 400 });
  }

  const discountAmount = Math.floor((originalPrice * promo.discount) / 100);
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  return NextResponse.json({
    valid: true,
    code: promo.code,
    discount: promo.discount,
    discountAmount,
    finalPrice,
  });
}

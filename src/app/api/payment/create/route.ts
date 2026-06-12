import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createTransaction } from "@/lib/tripay";
import { requireSession } from "@/lib/auth";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    if (session.hasAccess) {
      return NextResponse.json({ message: "Kamu sudah punya akses." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ message: "User tidak ditemukan." }, { status: 404 });

    const { promoCode, programId } = await req.json().catch(() => ({ promoCode: null, programId: null }));

    const setting = await prisma.setting.upsert({ where: { id: "singleton" }, create: {}, update: {} });
    let basePrice = setting.coursePrice;
    let productName = "Nalar Etam Premium";

    if (programId === "group") {
      basePrice = 30000;
      productName = "Kelas Group - Nalar Etam";
    } else if (programId === "semiprivat") {
      basePrice = 60000;
      productName = "Kelas Semiprivat - Nalar Etam";
    } else if (programId === "privat") {
      basePrice = 100000;
      productName = "Kelas Privat - Nalar Etam";
    }

    let finalAmount = basePrice;
    let promoId: string | null = null;
    const cleanPromo = promoCode ? promoCode.toUpperCase().trim() : null;

    // Validasi dan terapkan kode promo
    if (cleanPromo) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: cleanPromo },
      });
      if (!promo || !promo.isActive) {
        return NextResponse.json({ message: "Kode promo tidak valid atau sudah tidak aktif." }, { status: 400 });
      }
      if (promo.expiresAt && promo.expiresAt < new Date()) {
        return NextResponse.json({ message: "Kode promo ini sudah kedaluwarsa." }, { status: 400 });
      }
      if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
        return NextResponse.json({ message: "Kuota penggunaan kode promo ini sudah habis." }, { status: 400 });
      }

      // Pastikan pengguna belum pernah menggunakan kode promo ini sebelumnya
      const alreadyUsed = await prisma.transaction.findFirst({
        where: {
          userId: user.id,
          promoCode: cleanPromo,
          status: "SUCCESS",
        },
      });
      if (alreadyUsed) {
        return NextResponse.json({ message: "Kamu sudah pernah menggunakan kode promo ini." }, { status: 400 });
      }

      const discountAmount = Math.floor((basePrice * promo.discount) / 100);
      finalAmount = Math.max(0, basePrice - discountAmount);
      promoId = promo.id;
    }

    const orderId = `KA-${Date.now()}-${user.id.slice(0, 6).toUpperCase()}`;

    // Harga 0 = langsung grant akses (mode gratis atau 100% promo)
    if (finalAmount === 0) {
      await prisma.transaction.create({
        data: {
          orderId,
          userId: user.id,
          amount: 0,
          status: "SUCCESS",
          paidAt: new Date(),
          promoCode: cleanPromo,
        },
      });
      await prisma.user.update({ where: { id: user.id }, data: { hasAccess: true } });
      if (promoId) {
        await prisma.promoCode.update({ where: { id: promoId }, data: { usedCount: { increment: 1 } } });
      }
      const newToken = signToken({ id: user.id, name: user.name, email: user.email, role: user.role, hasAccess: true });
      const cookieStore = await cookies();
      cookieStore.set("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return NextResponse.json({ success: true, data: { checkout_url: "/dashboard" } });
    }

    await prisma.transaction.create({
      data: {
        orderId,
        userId: user.id,
        amount: finalAmount,
        status: "PENDING",
        promoCode: cleanPromo,
      },
    });
    if (promoId) {
      await prisma.promoCode.update({ where: { id: promoId }, data: { usedCount: { increment: 1 } } });
    }

    const tripay = await createTransaction({
      orderId,
      amount: finalAmount,
      customerName: user.name,
      customerEmail: user.email,
      items: [{ name: productName, price: finalAmount, quantity: 1 }],
    });

    await prisma.transaction.update({
      where: { orderId },
      data: { tripayReference: tripay.reference },
    });

    return NextResponse.json({ success: true, data: { checkout_url: tripay.checkout_url, reference: tripay.reference } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan server.";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

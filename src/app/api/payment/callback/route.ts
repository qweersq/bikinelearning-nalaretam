import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCallback } from "@/lib/tripay";
import { sendWelcomeEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-callback-signature") ?? "";

    if (!verifyCallback(rawBody, signature)) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    const payload = JSON.parse(rawBody);
    const { merchant_ref: orderId, status, payment_method: paymentMethod } = payload;

    const transaction = await prisma.transaction.findUnique({
      where: { orderId },
      include: { user: true },
    });
    if (!transaction) return NextResponse.json({ message: "Transaction not found" }, { status: 404 });

    if (status === "PAID" && transaction.status !== "SUCCESS") {
      await prisma.transaction.update({
        where: { orderId },
        data: { status: "SUCCESS", paymentMethod, paidAt: new Date() },
      });

      await prisma.user.update({
        where: { id: transaction.userId },
        data: { hasAccess: true },
      });

      await sendWelcomeEmail(transaction.user.email, transaction.user.name).catch(() => null);
    } else if (status === "EXPIRED") {
      await prisma.transaction.update({ where: { orderId }, data: { status: "EXPIRED" } });
    } else if (status === "FAILED") {
      await prisma.transaction.update({ where: { orderId }, data: { status: "FAILED" } });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

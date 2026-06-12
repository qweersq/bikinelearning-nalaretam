import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendResetPasswordEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email wajib diisi." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Selalu return sukses agar tidak bocorkan apakah email terdaftar
    if (!user) {
      return NextResponse.json({ success: true, message: "Jika email terdaftar, link reset akan dikirim." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    await sendResetPasswordEmail(email, token);

    return NextResponse.json({ success: true, message: "Link reset password sudah dikirim." });
  } catch {
    return NextResponse.json({ message: "Terjadi kesalahan server." }, { status: 500 });
  }
}

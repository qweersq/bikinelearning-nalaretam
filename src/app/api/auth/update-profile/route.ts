import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession();
    const { name, currentPassword, newPassword } = await req.json();
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ message: "User tidak ditemukan." }, { status: 404 });

    const data: Record<string, string> = {};
    if (name?.trim()) data.name = name.trim();

    if (currentPassword && newPassword) {
      if (newPassword.length < 8) return NextResponse.json({ message: "Password baru minimal 8 karakter." }, { status: 400 });
      if (!user.password) return NextResponse.json({ message: "Akun ini tidak memiliki password (login via Google)." }, { status: 400 });
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return NextResponse.json({ message: "Password sekarang tidak sesuai." }, { status: 400 });
      data.password = await bcrypt.hash(newPassword, 10);
    }

    await prisma.user.update({ where: { id: session.id }, data });
    return NextResponse.json({ success: true, message: "Profil berhasil diperbarui." });
  } catch {
    return NextResponse.json({ message: "Terjadi kesalahan server." }, { status: 500 });
  }
}

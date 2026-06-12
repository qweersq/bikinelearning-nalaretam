import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }

  const { currentPassword, newPassword, name } = await req.json();

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ message: "User tidak ditemukan." }, { status: 404 });

  if (currentPassword && newPassword) {
    if (!user.password) return NextResponse.json({ message: "Akun ini tidak memiliki password (login via Google)." }, { status: 400 });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ message: "Password lama tidak sesuai." }, { status: 400 });
    if (newPassword.length < 8) return NextResponse.json({ message: "Password baru minimal 8 karakter." }, { status: 400 });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed, ...(name ? { name } : {}) } });
  } else if (name) {
    await prisma.user.update({ where: { id: user.id }, data: { name } });
  }

  return NextResponse.json({ message: "Akun berhasil diperbarui." });
}

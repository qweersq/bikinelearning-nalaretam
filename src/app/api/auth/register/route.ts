import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { createNotif } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Semua field wajib diisi." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ message: "Password minimal 8 karakter." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Email sudah terdaftar." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role, hasAccess: user.hasAccess });
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    await createNotif(user.id, "enrollment", "Selamat Datang di Nalar Etam! 🎉", "Akun kamu berhasil dibuat. Mulai belajar sekarang!");

    return NextResponse.json({ success: true, message: "Akun berhasil dibuat." }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Terjadi kesalahan server." }, { status: 500 });
  }
}

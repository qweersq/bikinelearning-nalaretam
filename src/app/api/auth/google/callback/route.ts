import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { createNotif } from "@/lib/notify";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/login?error=cancelled`);
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${APP_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) throw new Error("token_exchange_failed");

    const { access_token } = await tokenRes.json();

    // Fetch user info from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) throw new Error("userinfo_failed");

    const { id: googleId, email, name, picture } = await userRes.json();

    if (!email) throw new Error("no_email");

    // Find existing user by googleId or email
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    let isNewUser = false;
    if (!user) {
      // New user — create account
      user = await prisma.user.create({
        data: { name, email, googleId, avatar: picture ?? null },
      });
      isNewUser = true;
    } else if (!user.googleId) {
      // Existing email/password user — link Google account
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatar: user.avatar ?? picture ?? null },
      });
    }

    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasAccess: user.hasAccess,
    });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    if (isNewUser) {
      await createNotif(user.id, "enrollment", "Selamat Datang di Nalar Etam! 🎉", "Akun kamu berhasil dibuat via Google. Mulai belajar sekarang!");
    }

    const redirectTo =
      user.role === "ADMIN" ? "/admin" : user.hasAccess ? "/dashboard" : "/checkout";

    return NextResponse.redirect(`${APP_URL}${redirectTo}`);
  } catch {
    return NextResponse.redirect(`${APP_URL}/login?error=google_failed`);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { signToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();

    const reference = req.nextUrl.searchParams.get("reference");
    if (!reference) return NextResponse.json({ status: "PENDING" });

    const transaction = await prisma.transaction.findFirst({
      where: { tripayReference: reference, userId: session.id },
    });

    if (!transaction) return NextResponse.json({ status: "NOT_FOUND" }, { status: 404 });

    if (transaction.status === "SUCCESS") {
      // Issue fresh JWT with hasAccess: true
      const user = await prisma.user.findUnique({ where: { id: session.id } });
      if (user) {
        const newToken = signToken({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          hasAccess: true,
        });
        const cookieStore = await cookies();
        cookieStore.set("token", newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
      }
      return NextResponse.json({ status: "SUCCESS" });
    }

    return NextResponse.json({ status: transaction.status });
  } catch {
    return NextResponse.json({ status: "ERROR" }, { status: 500 });
  }
}

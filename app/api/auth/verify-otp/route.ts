import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, SESSION_COOKIE_OPTIONS, signAdminToken } from "@/lib/auth";

const bodySchema = z.object({
  phone: z.string(),
  otp: z.string(),
});

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const phone = parsed.data.phone.replace(/^\+91/, "").replace(/\s/g, "");
  const otp = parsed.data.otp.trim();

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || user.role !== "ADMIN" || user.accountStatus !== "ACTIVE") {
    return NextResponse.json(
      { error: "Not authorised for admin access" },
      { status: 403 },
    );
  }

  const token = await prisma.otpToken.findFirst({
    where: { phone, token: otp, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!token) {
    return NextResponse.json(
      { error: "Invalid or expired OTP" },
      { status: 400 },
    );
  }

  await prisma.otpToken.update({
    where: { id: token.id },
    data: { usedAt: new Date() },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { isPhoneVerified: true },
  });

  const jwt = await signAdminToken({
    userId: user.id,
    phone: user.phone,
    name: user.name,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, jwt, SESSION_COOKIE_OPTIONS);
  return res;
}

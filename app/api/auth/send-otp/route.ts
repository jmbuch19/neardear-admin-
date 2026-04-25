import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  phone: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    return await handleSendOtp(req);
  } catch (err) {
    console.error("[ADMIN /api/auth/send-otp] fatal", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function handleSendOtp(req: NextRequest) {
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
  if (!/^\d{10}$/.test(phone)) {
    return NextResponse.json(
      { error: "Phone must be 10 digits" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || user.role !== "ADMIN" || user.accountStatus !== "ACTIVE") {
    // Don't reveal which condition failed.
    return NextResponse.json(
      { error: "Not authorised for admin access" },
      { status: 403 },
    );
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.otpToken.count({
    where: { phone, createdAt: { gte: oneHourAgo } },
  });
  if (recentCount >= 5) {
    return NextResponse.json(
      { error: "Too many OTP requests. Try again later." },
      { status: 429 },
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.otpToken.create({
    data: {
      userId: user.id,
      token: otp,
      phone,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  if (!process.env.MSG91_API_KEY || !process.env.MSG91_OTP_TEMPLATE_ID) {
    console.log(`[ADMIN OTP] Phone: ${phone} OTP: ${otp}`);
  } else {
    try {
      const r = await fetch("https://api.msg91.com/api/v5/otp", {
        method: "POST",
        headers: {
          authkey: process.env.MSG91_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_id: process.env.MSG91_OTP_TEMPLATE_ID,
          mobile: `91${phone}`,
          otp,
        }),
      });
      const result = (await r.json()) as { type?: string };
      if (result.type !== "success") console.error("[ADMIN OTP SEND]", result);
    } catch (err) {
      console.error("[ADMIN OTP ERROR]", err);
    }
  }

  return NextResponse.json({ ok: true });
}

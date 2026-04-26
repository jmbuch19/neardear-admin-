import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/auth";

const bodySchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().trim().max(500).optional(),
});

async function requireAdminUser(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const { id } = await params;
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const profile = await prisma.providerProfile.findUnique({ where: { id } });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (parsed.data.action === "APPROVE") {
    await prisma.providerProfile.update({
      where: { id },
      data: {
        aadhaarVerified: "CONFIRMED",
        aadhaarVerifiedAt: new Date(),
        pccStatus: "CONFIRMED",
        pccVerifiedAt: new Date(),
        accountStatus: "ACTIVE",
      },
    });
  } else {
    await prisma.providerProfile.update({
      where: { id },
      data: {
        aadhaarVerified: "FAILED",
        pccStatus: "FAILED",
        accountStatus: "SUSPENDED",
      },
    });
  }

  return NextResponse.json({ ok: true });
}

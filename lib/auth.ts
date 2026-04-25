import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "nd_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24h

export interface AdminClaims {
  userId: string;
  phone: string;
  name: string;
}

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(claims: AdminClaims): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<AdminClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.userId === "string" &&
      typeof payload.phone === "string" &&
      typeof payload.name === "string"
    ) {
      return {
        userId: payload.userId,
        phone: payload.phone,
        name: payload.name,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: true,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};

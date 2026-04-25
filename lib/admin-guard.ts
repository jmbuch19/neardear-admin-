import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifyAdminToken, type AdminClaims } from "./auth";

export async function requireAdmin(): Promise<AdminClaims> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) redirect("/login");
  const claims = await verifyAdminToken(token);
  if (!claims) redirect("/login");
  return claims;
}

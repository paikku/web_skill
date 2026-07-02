import { cookies } from "next/headers";
import { SSO_BASE_URL } from "./config";

export type Claims = {
  sub: string;
  email: string;
  name: string;
  department?: string;
  employeeNo?: string;
};

export async function getUser(): Promise<Claims | null> {
  const token = (await cookies()).get("expense_token")?.value;
  if (!token) return null;
  try {
    const res = await fetch(`${SSO_BASE_URL}/userinfo`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

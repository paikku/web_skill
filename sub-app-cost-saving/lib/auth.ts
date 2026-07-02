import { cookies } from "next/headers";
import { SSO_BASE_URL } from "./config";

export type SubAppUser = {
  userId: string;
  email: string;
  name: string;
  department?: string;
};

export async function getToken(): Promise<string | null> {
  return (await cookies()).get("cost_saving_token")?.value ?? null;
}

export async function getUser(): Promise<SubAppUser | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${SSO_BASE_URL}/userinfo`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const claims = await res.json();
    return {
      userId: claims.sub,
      email: claims.email,
      name: claims.name,
      department: claims.department,
    };
  } catch {
    return null;
  }
}

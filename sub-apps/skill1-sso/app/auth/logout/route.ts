import { NextResponse } from "next/server";
import { SELF_ORIGIN, SSO_BASE_URL } from "@/lib/config";

export async function GET() {
  const res = NextResponse.redirect(
    `${SSO_BASE_URL}/logout?redirect_uri=${encodeURIComponent(`${SELF_ORIGIN}/`)}`
  );
  res.cookies.delete("expense_token");
  return res;
}

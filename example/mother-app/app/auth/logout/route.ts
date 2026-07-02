import { NextResponse } from "next/server";
import { PORTAL_ORIGIN, SSO_BASE_URL } from "@/lib/config";

export async function GET() {
  // 포털 세션 제거 후 중앙 SSO 세션도 함께 끊는다.
  const res = NextResponse.redirect(
    `${SSO_BASE_URL}/logout?redirect_uri=${encodeURIComponent(`${PORTAL_ORIGIN}/`)}`
  );
  res.cookies.delete("portal_token");
  return res;
}

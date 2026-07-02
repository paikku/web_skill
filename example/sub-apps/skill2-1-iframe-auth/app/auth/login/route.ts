import { NextRequest, NextResponse } from "next/server";
import { CLIENT_ID, REDIRECT_URI, SSO_BASE_URL } from "@/lib/config";

export async function GET(req: NextRequest) {
  const state = crypto.randomUUID();
  const url = new URL(`${SSO_BASE_URL}/authorize`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("state", state);

  // silent=1: iframe 안에서 SSO 로그인 화면 없이 세션 확인만 시도 (same-sso 자동 로그인)
  if (req.nextUrl.searchParams.get("silent") === "1") {
    url.searchParams.set("silent", "1");
  }

  const res = NextResponse.redirect(url);
  res.cookies.set("cs_oauth_state", state, {
    httpOnly: true,
    path: "/",
    maxAge: 600,
  });
  return res;
}

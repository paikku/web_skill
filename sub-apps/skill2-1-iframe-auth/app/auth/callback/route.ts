import { NextRequest, NextResponse } from "next/server";
import { CLIENT_ID, REDIRECT_URI, SELF_ORIGIN, SSO_BASE_URL } from "@/lib/config";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  // silent 시도 실패 (SSO 세션 없음) → LoginGate가 LOGIN_REQUIRED postMessage를 보낸다.
  if (params.get("error") === "login_required") {
    return NextResponse.redirect(`${SELF_ORIGIN}/?login=required`);
  }

  const code = params.get("code");
  const state = params.get("state");
  const savedState = req.cookies.get("cs_oauth_state")?.value;

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(`${SELF_ORIGIN}/?login=error`);
  }

  const tokenRes = await fetch(`${SSO_BASE_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${SELF_ORIGIN}/?login=error`);
  }
  const { access_token } = await tokenRes.json();

  const res = NextResponse.redirect(`${SELF_ORIGIN}/`);
  res.cookies.set("cost_saving_token", access_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  res.cookies.delete("cs_oauth_state");
  return res;
}

import { NextRequest, NextResponse } from "next/server";
import {
  PORTAL_CLIENT_ID,
  PORTAL_ORIGIN,
  PORTAL_REDIRECT_URI,
  SSO_BASE_URL,
} from "@/lib/config";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("portal_oauth_state")?.value;

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(`${PORTAL_ORIGIN}/?login_error=invalid_state`);
  }

  const tokenRes = await fetch(`${SSO_BASE_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: PORTAL_CLIENT_ID,
      redirect_uri: PORTAL_REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${PORTAL_ORIGIN}/?login_error=token_exchange`);
  }
  const { access_token } = await tokenRes.json();

  const res = NextResponse.redirect(`${PORTAL_ORIGIN}/`);
  res.cookies.set("portal_token", access_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  res.cookies.delete("portal_oauth_state");
  return res;
}

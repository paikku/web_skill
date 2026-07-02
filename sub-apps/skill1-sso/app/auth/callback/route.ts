import { NextRequest, NextResponse } from "next/server";
import { CLIENT_ID, REDIRECT_URI, SELF_ORIGIN, SSO_BASE_URL } from "@/lib/config";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("expense_oauth_state")?.value;

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
  res.cookies.set("expense_token", access_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  res.cookies.delete("expense_oauth_state");
  return res;
}

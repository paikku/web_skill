import { NextResponse } from "next/server";
import {
  PORTAL_CLIENT_ID,
  PORTAL_REDIRECT_URI,
  SSO_BASE_URL,
} from "@/lib/config";

export async function GET() {
  const state = crypto.randomUUID();
  const url = new URL(`${SSO_BASE_URL}/authorize`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", PORTAL_CLIENT_ID);
  url.searchParams.set("redirect_uri", PORTAL_REDIRECT_URI);
  url.searchParams.set("state", state);

  const res = NextResponse.redirect(url);
  res.cookies.set("portal_oauth_state", state, {
    httpOnly: true,
    path: "/",
    maxAge: 600,
  });
  return res;
}

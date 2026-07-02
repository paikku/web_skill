import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { PORTAL_ORIGIN } from "@/lib/config";

// iframe authIntegration의 sessionCheckUrl.
// Mother App(다른 origin)이 fetch하므로 CORS + credentials 허용이 필요하다.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": PORTAL_ORIGIN,
  "Access-Control-Allow-Credentials": "true",
};

export async function GET() {
  const user = await getUser();
  return NextResponse.json(
    user ? { authenticated: true, user } : { authenticated: false },
    { headers: CORS_HEADERS }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

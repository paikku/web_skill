import { NextResponse } from "next/server";
import { getPortalUser } from "@/lib/auth";

// portal-auth-bridge의 getUser()가 호출하는 endpoint.
export async function GET() {
  const user = await getPortalUser();
  if (!user) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
  return NextResponse.json(user);
}

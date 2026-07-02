import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getExpenses } from "@/lib/data";

// 출장경비 앱의 "자기 API". 화면은 SSO가 아니라 이 API에서 데이터를 그린다.
// 흐름: 쿠키의 토큰 → SSO /userinfo 로 사용자 확인(introspection) → 자기 DB 조회.
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
  return NextResponse.json(getExpenses(user.sub));
}

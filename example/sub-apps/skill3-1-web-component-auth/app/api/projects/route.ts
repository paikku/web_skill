import { NextRequest, NextResponse } from "next/server";
import { hasPermission, listProjects, verifyBearer } from "@/lib/data";

// 위젯이 그리는 데이터의 자기 API.
// Mother App BFF가 서버-투-서버로 Bearer 토큰을 붙여 호출한다 (브라우저 직접 호출 아님 → CORS 불필요).
export async function GET(req: NextRequest) {
  const user = await verifyBearer(req.headers.get("authorization"));
  if (!user) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
  if (!hasPermission(user.userId, "COST_SAVING_VIEW")) {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "COST_SAVING_VIEW 권한이 없습니다." },
      { status: 403 }
    );
  }
  return NextResponse.json(listProjects());
}

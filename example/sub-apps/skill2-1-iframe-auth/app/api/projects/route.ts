import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createProject, hasPermission, listProjects } from "@/lib/data";

// 원가절감 앱의 "자기 API". 데이터도 권한 검증도 여기서 한다 (SSO 아님).
// 이 API는 이 앱 프론트가 same-origin 쿠키로 호출한다.
//   GET  : COST_SAVING_VIEW 필요
//   POST : COST_SAVING_EDIT 필요 (프론트에서 버튼을 숨겨도 최종 검증은 여기)
export async function GET() {
  const user = await getUser();
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

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
  if (!hasPermission(user.userId, "COST_SAVING_EDIT")) {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "COST_SAVING_EDIT 권한이 없습니다." },
      { status: 403 }
    );
  }
  const body = await req.json().catch(() => ({}));
  const project = createProject({
    title: String(body.title ?? ""),
    saving: Number(body.saving ?? 0),
    owner: user.userId,
  });
  return NextResponse.json(project);
}

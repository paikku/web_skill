import { NextRequest, NextResponse } from "next/server";
import { BFF_UPSTREAMS } from "@/lib/config";

// BFF (Backend-For-Frontend) — Mother App의 유일한 역할은 "인증 브릿지"다.
// 위젯은 Mother App 쿠키만 갖고 /bff/{appId}/... 를 호출하고,
// Mother App이 포털 세션의 토큰을 붙여 해당 Sub App의 "자기 API"로 프록시한다.
//   - 토큰이 위젯(브라우저 JS)에 노출되지 않는다.
//   - 업무 데이터의 소유/검증은 전적으로 Sub App API가 한다 (여기선 가공 안 함).
async function proxy(
  req: NextRequest,
  appId: string,
  path: string[],
  method: "GET" | "POST"
) {
  const upstreamBase = BFF_UPSTREAMS[appId];
  if (!upstreamBase) {
    return NextResponse.json(
      { code: "UNKNOWN_APP", message: `BFF 업스트림 미등록: ${appId}` },
      { status: 404 }
    );
  }

  const token = req.cookies.get("portal_token")?.value;
  if (!token) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "포털 로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const upstream = await fetch(`${upstreamBase}/${path.join("/")}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: method === "GET" ? undefined : await req.text(),
    cache: "no-store",
  });

  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ appId: string; path: string[] }> }
) {
  const { appId, path } = await params;
  return proxy(req, appId, path, "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ appId: string; path: string[] }> }
) {
  const { appId, path } = await params;
  return proxy(req, appId, path, "POST");
}

import { NextRequest, NextResponse } from "next/server";
import { SSO_BASE_URL } from "@/lib/config";

// BFF mode: 위젯은 Mother App 쿠키만 갖고 /bff/* 를 호출하고,
// Mother App이 포털 세션의 토큰을 붙여 Sub App 업무 API로 전달한다.
// 토큰이 위젯(브라우저 JS)에 노출되지 않는 것이 핵심.
async function proxy(req: NextRequest, path: string[], method: "GET" | "POST") {
  const token = req.cookies.get("portal_token")?.value;
  if (!token) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "포털 로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const upstream = await fetch(
    `${SSO_BASE_URL}/api/cost-saving/${path.join("/")}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: method === "GET" ? undefined : await req.text(),
      cache: "no-store",
    }
  );

  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path, "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path, "POST");
}

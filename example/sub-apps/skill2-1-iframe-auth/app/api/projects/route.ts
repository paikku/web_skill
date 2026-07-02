import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/auth";
import { SSO_BASE_URL } from "@/lib/config";

// Sub App 화면이 자기 backend(FastAPI)를 호출할 때 쓰는 프록시.
// httpOnly 쿠키의 토큰을 서버에서 Bearer로 바꿔 붙인다 (토큰이 JS에 노출되지 않음).
async function proxy(req: NextRequest, method: "GET" | "POST") {
  const token = await getToken();
  if (!token) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const upstream = await fetch(`${SSO_BASE_URL}/api/cost-saving/projects`, {
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

export async function GET(req: NextRequest) {
  return proxy(req, "GET");
}

export async function POST(req: NextRequest) {
  return proxy(req, "POST");
}

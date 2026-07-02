import { NextRequest, NextResponse } from "next/server";
import { getKpi } from "@/lib/data";

// 공개 KPI 위젯의 자기 API (인증 없음). 위젯은 이 API에서 데이터를 그린다.
// CORS는 next.config.ts 에서 /api/* 에 대해 허용.
export async function GET(req: NextRequest) {
  const plant = req.nextUrl.searchParams.get("plant") ?? "KR01";
  return NextResponse.json(getKpi(plant));
}

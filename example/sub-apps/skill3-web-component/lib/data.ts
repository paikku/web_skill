// 공개 KPI 위젯이 그리는 데이터의 소유자도 이 앱이다 (인증 없음 → 공개 데이터).
export type Kpi = { plant: string; rate: string; oee: string };

const KPI: Record<string, Omit<Kpi, "plant">> = {
  KR01: { rate: "92%", oee: "87%" },
  KR02: { rate: "88%", oee: "81%" },
};

export function getKpi(plant: string): Kpi {
  const found = KPI[plant] ?? { rate: "-", oee: "-" };
  return { plant, ...found };
}

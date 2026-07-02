import { useEffect, useState } from "react";

type Kpi = { plant: string; rate: string; oee: string };

// 공개 KPI 위젯 — 평범한 React 컴포넌트로 작성한다.
// 데이터는 이 앱의 자기 API(/api/kpi)에서 가져온다.
// API origin은 이 스크립트가 서빙된 위치(import.meta.url = :3004)에서 유도한다
// → 호스트를 하드코딩하지 않아 배포 위치가 바뀌어도 따라간다.
export function KpiCard({ plant = "KR01" }: { plant?: string }) {
  const [kpi, setKpi] = useState<Kpi | null>(null);

  useEffect(() => {
    const url = new URL(`/api/kpi?plant=${encodeURIComponent(plant)}`, import.meta.url);
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then(setKpi)
      .catch(() => setKpi(null));
  }, [plant]);

  return (
    <section
      style={{
        fontFamily: "sans-serif",
        border: "1px solid #d1d5db",
        borderRadius: 10,
        padding: "14px 16px",
        background: "linear-gradient(135deg,#eff6ff,#e0e7ff)",
      }}
    >
      <div style={{ fontSize: 13, color: "#4338ca", fontWeight: 600 }}>
        🏭 Factory KPI — {plant}
      </div>
      <div style={{ display: "flex", gap: 24, marginTop: 10 }}>
        <Metric label="가동률" value={kpi?.rate ?? "…"} />
        <Metric label="OEE" value={kpi?.oee ?? "…"} />
      </div>
      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
        React 위젯 · 자기 API(/api/kpi) · 인증 없음
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#1e3a8a" }}>{value}</div>
    </div>
  );
}

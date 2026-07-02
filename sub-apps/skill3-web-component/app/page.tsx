import Script from "next/script";

// 이 앱의 본체는 public/widgets/kpi-card.js 하나다.
// 이 페이지는 위젯 제공팀이 자기 위젯을 확인하는 미리보기일 뿐이다.
export default function Page() {
  return (
    <div>
      <h1 style={{ fontSize: 20 }}>🏭 Factory KPI — 위젯 제공 전용 앱</h1>
      <p style={{ fontSize: 14, color: "#555" }}>
        이 앱은 Mother App 대시보드용 Web Component
        (<code>/widgets/kpi-card.js</code>)를 서빙합니다. 로그인 코드가 없는
        <b> Skill 3 (인증 통합 없음)</b> 케이스입니다. 아래는 로컬 미리보기:
      </p>
      <div style={{ maxWidth: 360, display: "grid", gap: 12 }}>
        {/* @ts-expect-error 커스텀 엘리먼트 */}
        <factory-kpi-card plant="KR01" />
        {/* @ts-expect-error 커스텀 엘리먼트 */}
        <factory-kpi-card plant="KR02" />
      </div>
      <Script src="/widgets/kpi-card.js" type="module" />
    </div>
  );
}

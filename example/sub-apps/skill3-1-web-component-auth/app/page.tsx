// 이 앱의 본체는 public/widgets/ 아래 위젯 2개다.
// 인증 통합 위젯은 Mother App 컨텍스트(BFF, portalAuth 주입)가 있어야 동작하므로
// 이 페이지에서는 미리보기 대신 설명만 제공한다.
export default function Page() {
  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 20 }}>💰 원가절감 위젯 — 인증 통합 위젯 제공 전용 앱</h1>
      <p style={{ fontSize: 14, color: "#555" }}>
        <b>Skill 3-1 (Web Component 인증 통합)</b> 케이스입니다. 두 위젯 모두
        token을 직접 다루지 않으며, Mother App 대시보드 안에서만 데이터가
        표시됩니다.
      </p>
      <ul style={{ fontSize: 14, color: "#333", lineHeight: 1.9 }}>
        <li>
          <code>/widgets/cost-saving-widget.js</code> — <b>bff mode</b>:
          Mother App 쿠키로 <code>/bff/cost-saving/projects</code> 호출
        </li>
        <li>
          <code>/widgets/cost-saving-bridge-widget.js</code> —{" "}
          <b>portal-auth-bridge mode</b>: 주입받은{" "}
          <code>portalAuth.getUser()/fetch()</code> 사용
        </li>
      </ul>
      <p style={{ fontSize: 13, color: "#888" }}>
        동작 확인은 Mother App(<code>http://localhost:3000</code>) 홈
        대시보드에서 하세요.
      </p>
    </div>
  );
}

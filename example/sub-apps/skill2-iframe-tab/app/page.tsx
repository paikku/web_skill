// Skill 2: 인증 통합 없는 iframe 탭.
// 이 앱에는 로그인/postMessage/위젯 코드가 전혀 없다 — 전체 화면 하나가 전부.
export default function Page() {
  return (
    <div>
      <h1>
        📊 Legacy Report <span className="badge">iframeTab only · 인증 통합 없음</span>
      </h1>
      <p>
        이 화면은 독립 실행되는 옛날 앱입니다. Mother App 로그인과 무관하게
        항상 보입니다.
        <br />
        Manifest에 <code>iframeTab</code> Skill만 선언한 케이스입니다.
      </p>
      <table>
        <thead>
          <tr><th>월</th><th>생산량</th><th>불량률</th></tr>
        </thead>
        <tbody>
          <tr><td>2026-04</td><td>12,400</td><td>0.8%</td></tr>
          <tr><td>2026-05</td><td>13,100</td><td>0.6%</td></tr>
          <tr><td>2026-06</td><td>12,900</td><td>0.7%</td></tr>
        </tbody>
      </table>
    </div>
  );
}

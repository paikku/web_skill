import { getUser } from "@/lib/auth";

// Skill 1 (standalone-sso) 직접 접속 흐름:
// 1. 로그인 상태 확인 → 2. 없으면 중앙 SSO redirect → 3. callback 복귀 → 4. 화면 표시
export default async function Page() {
  const user = await getUser();

  if (!user) {
    return (
      <div className="card">
        <h1>✈️ 출장경비 <span className="badge">Skill 1: SSO만 사용</span></h1>
        <p>
          이 앱은 Mother App과 아무 화면 통합도 하지 않습니다. 직접 접속 시
          <b> 중앙 SSO</b>로 로그인만 합니다.
          <br />
          포털에서 이미 로그인했다면 SSO 세션이 재사용되어 로그인 화면 없이
          바로 통과합니다.
        </p>
        <a className="btn" href="/auth/login">
          중앙 SSO로 로그인
        </a>
      </div>
    );
  }

  return (
    <div className="card">
      <h1>✈️ 출장경비 <span className="badge">로그인됨</span></h1>
      <p>중앙 SSO가 발급한 token으로 /userinfo에서 조회한 identity:</p>
      <table>
        <tbody>
          <tr><th>sub</th><td>{user.sub}</td></tr>
          <tr><th>name</th><td>{user.name}</td></tr>
          <tr><th>email</th><td>{user.email}</td></tr>
          <tr><th>department</th><td>{user.department}</td></tr>
          <tr><th>employeeNo</th><td>{user.employeeNo}</td></tr>
        </tbody>
      </table>
      <p>
        Token에는 identity만 담겨 있습니다. 기능별 권한이 필요하면 각 Sub App
        DB에서 조회합니다 (문서 11장 Token 정책).
      </p>
      <a className="btn ghost" href="/auth/logout">
        로그아웃
      </a>
    </div>
  );
}

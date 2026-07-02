// 데모 서버 7개가 전부 떠 있는지 확인한다. (의존성 없음, Node 18+)
//   node scripts/check-servers.mjs   또는   npm run check
const SERVERS = [
  ["http://localhost:8000/docs", "sso-backend (FastAPI 가짜 SSO)", "cd sso-backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"],
  ["http://localhost:3000", "mother-app (포털)", "npm run dev:mother"],
  ["http://localhost:3001", "skill1-sso", "npm run dev:skill1"],
  ["http://localhost:3002", "skill2-iframe-tab", "npm run dev:skill2"],
  ["http://localhost:3003", "skill2-1-iframe-auth", "npm run dev:skill2-1"],
  ["http://localhost:3004", "skill3-web-component", "npm run dev:skill3"],
  ["http://localhost:3005", "skill3-1-web-component-auth", "npm run dev:skill3-1"],
];

let allUp = true;

for (const [url, name, howToRun] of SERVERS) {
  try {
    // dev 서버 첫 요청은 컴파일 때문에 수 초 걸릴 수 있다
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    console.log(`✅ ${name} — ${url} (HTTP ${res.status})`);
  } catch {
    allUp = false;
    console.log(`❌ ${name} — ${url} 응답 없음`);
    console.log(`   → 실행: ${howToRun}`);
  }
}

if (allUp) {
  console.log("\n모든 서버 정상. http://localhost:3000 에서 시작하세요.");
} else {
  console.log("\n❌ 표시된 서버를 먼저 띄우세요. 특히 :8000(SSO)이 죽어 있으면");
  console.log("   로그인 버튼을 눌렀을 때 '사이트에 연결할 수 없음'이 나옵니다.");
  process.exitCode = 1;
}

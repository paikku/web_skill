// 5가지 Integration Skill 데모의 전체 시나리오(13개)를 헤드리스 브라우저로 검증한다.
//
// 사전 조건: 서버 7개가 전부 떠 있어야 한다 (npm run check 로 확인).
// 실행 방법 (example/ 에서):
//   npm i --no-save playwright
//   npx playwright install chromium
//   node e2e/e2e.mjs
//
// 스크린샷은 e2e/shots/ 에 저장된다.
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const SHOTS = join(dirname(fileURLToPath(import.meta.url)), "shots");
mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({
  // 환경에 이미 설치된 chromium을 쓰고 싶으면 CHROMIUM_PATH로 지정
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const results = [];
function check(name, ok, detail = "") {
  results.push(`${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
  if (!ok) process.exitCode = 1;
}

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// 위젯은 React로 만들어 Shadow DOM에 렌더되므로 shadowRoot.textContent를 읽는다.
async function shadowText(pg, tag) {
  return pg.locator(tag).first().evaluate((el) => el.shadowRoot?.textContent ?? "").catch(() => "");
}
async function waitShadow(pg, tag, needle, timeout = 15000) {
  await pg
    .waitForFunction(
      ([t, n]) => document.querySelector(t)?.shadowRoot?.textContent?.includes(n),
      [tag, needle],
      { timeout }
    )
    .catch(() => {});
  return shadowText(pg, tag);
}

// ---- 1. 로그인 전 대시보드: 공개 위젯(skill3) OK, 인증 위젯(skill3-1) 401 ----
await page.goto("http://localhost:3000/");
const kpiVisible = await waitShadow(page, "factory-kpi-card", "가동률");
const bffText = await waitShadow(page, "cost-saving-secure-widget", "401");
await page.screenshot({ path: `${SHOTS}/01-dashboard-logged-out.png`, fullPage: true });
check("[3] 공개 위젯(:3004) 로그인 전 표시 (React+자기API)", kpiVisible.includes("가동률"));
check("[3-1] BFF 위젯(:3005) 로그인 전 401", bffText.includes("401"), bffText.slice(0, 50).replace(/\n/g, " "));

// ---- 2. Skill Matrix: 옵션별 앱 5개가 대각선으로 표시 ----
await page.goto("http://localhost:3000/skills");
await page.waitForTimeout(1000);
await page.screenshot({ path: `${SHOTS}/02-skill-matrix.png`, fullPage: true });
const matrixRows = await page.locator("table.matrix tbody tr").count();
check("Skill Matrix 앱 5개", matrixRows === 5, `rows=${matrixRows}`);

// ---- 3. 원가절감 iframe 탭(:3003, 로그인 전): silent 실패 → LOGIN_REQUIRED ----
await page.goto("http://localhost:3000/apps/cost-saving");
await page.waitForTimeout(5000);
await page.screenshot({ path: `${SHOTS}/03-iframe-login-required.png`, fullPage: true });
const banner = await page.locator(".warn-banner").innerText().catch(() => "");
check("[2-1] LOGIN_REQUIRED postMessage 배너", banner.includes("LOGIN_REQUIRED"));

// ---- 4. Legacy Report 탭(:3002): 인증 없이 항상 표시 ----
await page.goto("http://localhost:3000/apps/legacy-report");
await page.waitForTimeout(2500);
const legacyText = await page.frameLocator("iframe").locator("h1").innerText().catch(() => "");
check("[2] Legacy Report iframe (인증 코드 0줄)", legacyText.includes("Legacy Report"));
await page.screenshot({ path: `${SHOTS}/04-legacy-report-tab.png`, fullPage: true });

// ---- 5. 포털 SSO 로그인 (김철수) → 대시보드 인증 위젯 동작 ----
await page.goto("http://localhost:3000/auth/login");
await page.waitForURL(/localhost:8000\/authorize/);
await page.screenshot({ path: `${SHOTS}/05-sso-login-page.png` });
await page.click('button[value="user-kim"]');
await page.waitForURL("http://localhost:3000/");
const header = await page.locator(".user-box").innerText();
check("포털 SSO 로그인 (김철수)", header.includes("김철수"));
const bffAfter = await waitShadow(page, "cost-saving-secure-widget", "건");
check("[3-1] BFF 위젯 데이터 표시 (자기API via BFF)", bffAfter.includes("건"), bffAfter.replace(/\s+/g, " ").slice(0, 40));
const bridgeAfter = await waitShadow(page, "cost-saving-bridge-widget", "김철수");
check("[3-1] Auth Bridge 위젯 사용자 표시", bridgeAfter.includes("김철수"), bridgeAfter.replace(/\s+/g, " ").slice(0, 40));
await page.screenshot({ path: `${SHOTS}/06-dashboard-logged-in.png`, fullPage: true });

// ---- 6. iframe 탭(:3003) same-sso 자동 로그인 + sessionCheck ----
await page.goto("http://localhost:3000/apps/cost-saving");
await page.waitForTimeout(5000);
const frameHeader = await page.frameLocator("iframe").locator(".app-header h1").innerText().catch(() => "");
check("[2-1] iframe same-sso 자동 로그인", frameHeader.includes("김철수"), frameHeader.replace(/\n/g, " "));
await page.screenshot({ path: `${SHOTS}/07-iframe-auto-login.png`, fullPage: true });
await page.click("text=sessionCheckUrl 확인");
await page.waitForTimeout(1500);
const sessionJson = await page.locator(".session-panel pre").innerText().catch(() => "");
check("[2-1] sessionCheckUrl CORS 조회", sessionJson.includes('"authenticated":true'), sessionJson.slice(0, 70));

// ---- 7. Skill 1 앱(:3001) 직접 접속: SSO 세션 재사용으로 로그인 화면 생략 ----
await page.goto("http://localhost:3001/");
await page.locator("a.btn", { hasText: "중앙 SSO로 로그인" }).click();
await page.waitForSelector("table", { timeout: 15000 });
await page.waitForFunction(() => document.body.innerText.includes("합계"), null, { timeout: 15000 }).catch(() => {});
const claims = await page.locator(".card").innerText();
check("[1] standalone-sso 직접 접속 (로그인 화면 생략)", claims.includes("김철수"));
check("[1] 경비 내역을 자기 API(/api/expenses)로 표시", claims.includes("KTX") && claims.includes("합계"));
await page.screenshot({ path: `${SHOTS}/08-skill1-direct.png` });

// ---- 8. Skill 2-1 앱(:3003) 직접 접속 + 김철수 과제 등록 성공 ----
// (6단계 iframe same-sso 자동 로그인으로 이미 세션 쿠키가 있어 바로 로그인 화면)
await page.goto("http://localhost:3003/");
await page.waitForSelector(".app-header h1", { timeout: 15000 });
await page.waitForTimeout(2000); // React 하이드레이션 대기
await page.fill('input[placeholder="과제명"]', "e2e 테스트 과제");
await page.fill('input[placeholder="절감액(원)"]', "1000000");
await page.click('button:has-text("등록")');
await page.waitForTimeout(1500);
const okMsg = await page.locator(".error-msg").innerText().catch(() => "");
check("[2-1] 김철수(EDIT) 과제 등록 성공", okMsg.includes("등록되었습니다"));

await ctx.close();

// ---- 9. 이영희(VIEW only)로 403 확인 ----
const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const p2 = await ctx2.newPage();
await p2.goto("http://localhost:3003/");
await p2.locator("a.btn", { hasText: "중앙 SSO로 로그인" }).click();
await p2.waitForURL(/localhost:8000\/authorize/);
await p2.click('button[value="user-lee"]');
await p2.waitForSelector(".app-header h1", { timeout: 15000 });
await p2.waitForTimeout(2000); // React 하이드레이션 대기
await p2.fill('input[placeholder="과제명"]', "권한 없는 등록 시도");
await p2.click('button:has-text("등록")');
await p2.waitForTimeout(1500);
const errMsg = await p2.locator(".error-msg").innerText().catch(() => "");
check("[권한] 이영희 등록 시 backend 403", errMsg.includes("403"), errMsg);
await p2.screenshot({ path: `${SHOTS}/09-lee-403.png`, fullPage: true });

await browser.close();
console.log(results.join("\n"));

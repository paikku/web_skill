# Optional Integration Skills 데모

`mother-app-integration-skills.md` / `sub-app-integration-skills.md` 문서의 5가지 Integration Skill을
전부 실제로 체감할 수 있는 최소 구현 데모입니다.

## 구성

| 디렉터리 | 역할 | 포트 |
|---|---|---|
| `sso-backend/` | **FastAPI** — 가짜 중앙 SSO(OIDC 흉내) + 원가절감 업무 API(권한 체크) + Legacy Report 페이지 + Factory KPI 위젯 호스팅 | 8000 |
| `mother-app/` | **Next.js** — Mother App Portal: Manifest Registry, 홈 대시보드(위젯), App Tab(iframe), BFF, Auth Bridge, Skill Matrix | 3000 |
| `sub-app-cost-saving/` | **Next.js** — 원가절감 Sub App: standalone-sso 로그인, iframe same-sso 자동 로그인, LOGIN_REQUIRED postMessage, 인증 위젯 스크립트 제공 | 3001 |

가상의 Sub App 3개가 서로 다른 Skill 조합을 선언합니다 (`mother-app/lib/manifests.ts`).

| Sub App | sso | iframeTab | iframe 인증 통합 | webComponents | WC 인증 통합 |
|---|---|---|---|---|---|
| Legacy Report | — | ✅ | — | — | — |
| 원가절감 | ✅ | ✅ | ✅ same-sso + postMessage | ✅ | ✅ bff + portal-auth-bridge |
| Factory KPI | — | — | — | ✅ | — |

## 실행

```bash
# 1. FastAPI (가짜 SSO + backend)
cd sso-backend
pip install -r requirements.txt
uvicorn main:app --port 8000

# 2. Mother App
cd mother-app
npm install
npm run dev        # http://localhost:3000

# 3. Sub App
cd sub-app-cost-saving
npm install
npm run dev        # http://localhost:3001
```

또는 의존성 설치 후 한 번에:

```bash
./run-all.sh
```

## 데모 사용자

| 사용자 | 권한 | 체감 포인트 |
|---|---|---|
| 김철수 | `COST_SAVING_VIEW` + `COST_SAVING_EDIT` | 과제 조회 + 등록 가능 |
| 이영희 | `COST_SAVING_VIEW` | 조회만 가능 — 등록 시 backend가 **403** 반환 |

토큰에는 identity만 담고, 기능 권한은 Sub App backend(가짜 DB)가 관리합니다 (문서 11장 Token 정책).

## 각 Skill 체감 시나리오

### Skill 1 — SSO 인증 옵션 (standalone-sso)

1. `http://localhost:3001` 에 **직접 접속** → "중앙 SSO로 로그인" 클릭
2. `localhost:8000` 의 가짜 SSO 로그인 화면에서 사용자 선택 → code 발급 → callback 복귀 → 앱 표시
3. 한 번 SSO 세션이 생기면(포털 등에서 로그인) 이후 authorize 요청은 **로그인 화면 없이 즉시 통과**

### Skill 2 — iframe 탭 제공 옵션 (인증 통합 없음)

1. 포털(`localhost:3000`) 상단 **Legacy Report** 탭 클릭
2. 로그인 여부와 무관하게 FastAPI가 서빙하는 옛날 앱 전체 화면이 iframe으로 표시됨

### Skill 2-1 — iframe 인증 통합 (same-sso + post-message-login-required)

1. **포털 로그인 전** 상태에서 **원가절감** 탭 클릭
2. iframe 안의 Sub App이 silent SSO를 시도 → 실패 → 부모에게 `LOGIN_REQUIRED` postMessage → 포털 상단에 경고 배너 표시
3. 배너의 **포털 로그인 시작**으로 SSO 로그인 → 탭 재방문 시 iframe이 **자동 로그인**(same-sso: 중앙 SSO 세션 재사용)
4. "sessionCheckUrl 확인" 버튼으로 Sub App 세션 상태를 CORS + 쿠키로 조회

### Skill 3 — Web Component 제공 옵션 (인증 통합 없음)

1. 포털 홈 대시보드의 **공장 KPI** 위젯 — 로그인 전에도 항상 표시
2. `scriptUrl`(`localhost:8000/widgets/kpi-card.js`)은 allowlist 검증 후에만 로드됨

### Skill 3-1 — Web Component 인증 통합 (bff / portal-auth-bridge)

1. **로그인 전** 홈 대시보드: BFF 위젯은 `401 UNAUTHENTICATED`, Bridge 위젯은 "로그인 필요" 표시
2. SSO 로그인 후:
   - **BFF 위젯**: `fetch("/bff/cost-saving/projects", { credentials: "include" })` → Mother App BFF가 포털 토큰을 붙여 Sub App API 호출 (토큰이 브라우저 JS에 노출되지 않음)
   - **Bridge 위젯**: Mother App이 property로 주입한 `portalAuth.getUser()` / `portalAuth.fetch()` 사용

### 권한(Authorization)은 Sub App 책임

- 이영희로 로그인 → 원가절감 앱에서 과제 등록 시도 → backend가 `403 FORBIDDEN` 반환
- 프론트 권한 체크는 UX용일 뿐, 최종 검증은 항상 backend (문서 9~10장)

## 문서 보안 정책 반영 사항

- `scriptUrl` allowlist 검증 (`mother-app/components/WebComponentRenderer.tsx`)
- postMessage `origin` 검증 + `targetOrigin` 명시 (`"*"` 미사용)
- token/userId를 query string이나 attribute로 전달하지 않음 — httpOnly 쿠키 + BFF/Bridge 경유
- iframe `sandbox` 속성은 manifest 선언값 사용
- `status: "disabled"` 앱/위젯은 렌더링하지 않음

## 참고 (데모 한계)

- SSO는 진짜 OIDC가 아니라 authorization code 흐름만 흉내낸 in-memory 구현입니다 (PKCE, JWT 서명, refresh 없음).
- 브라우저는 `localhost`의 포트만 다른 origin들을 same-site로 취급하므로 iframe 안에서도 쿠키가 동작합니다. 실제 배포에서 도메인이 다르면 same-sso/reverse-proxy 구성이 필요합니다 (문서 8장).
- 서버 재시작 시 세션/토큰/데이터가 모두 초기화됩니다.

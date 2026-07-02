# Optional Integration Skills 데모

루트의 [`mother-app-integration-skills.md`](../mother-app-integration-skills.md) /
[`sub-app-integration-skills.md`](../sub-app-integration-skills.md) 문서의 5가지 Integration Skill을
**옵션별로 분리된 Sub App**으로 체감할 수 있는 최소 구현 데모입니다.

## 구성 — 옵션당 Sub App 1개

| 디렉터리 | Skill | 가상 앱 | 포트 |
|---|---|---|---|
| `sso-backend/` | (공용) 가짜 중앙 SSO — **인증(identity)만** | — | 8000 |
| `mother-app/` | (공용) Mother App Portal + 인증 브릿지(BFF) | — | 3000 |
| `sub-apps/skill1-sso/` | **1. SSO 인증** | 출장경비 | 3001 |
| `sub-apps/skill2-iframe-tab/` | **2. iframe 탭 제공** | Legacy Report | 3002 |
| `sub-apps/skill2-1-iframe-auth/` | **2-1. iframe 인증 통합** (same-sso + postMessage) | 원가절감 | 3003 |
| `sub-apps/skill3-web-component/` | **3. Web Component 제공** | Factory KPI | 3004 |
| `sub-apps/skill3-1-web-component-auth/` | **3-1. Web Component 인증 통합** (bff + bridge) | 원가절감 위젯 | 3005 |

각 Sub App 디렉터리의 `README.md`에 **그 옵션에 필요한 파일 구성**이 정리되어 있습니다.
옵션별 코드량 차이 자체가 데모입니다:

```text
skill2-iframe-tab/          화면 1장, 인증 코드 0줄
skill1-sso/                 + auth/login·callback·logout + 자기 API(/api/expenses)
skill2-1-iframe-auth/       + silent 로그인, LOGIN_REQUIRED postMessage, auth/session,
                             자기 API(/api/projects)와 권한(lib/data)
skill3-web-component/       React 위젯 + 래퍼 + esbuild + 자기 API(/api/kpi), 인증 0줄
skill3-1-web-component-auth/ React 위젯 2개(bff/bridge) + 자기 API(/api/projects) — token 안 만짐
```

Mother App의 `lib/manifests.ts`에 5개 앱의 Manifest가 등록되어 있고,
`/skills` 페이지(Skill Matrix)에서 앱별 선언 Skill을 한눈에 볼 수 있습니다.

### 이번 구조의 핵심 원칙 3가지

1. **SSO는 인증만.** `sso-backend`는 `/authorize /token /userinfo /logout`만 제공합니다.
   업무 데이터(경비/과제/KPI)와 기능별 권한은 각 Sub App이 **자기 API**로 소유·검증합니다.
   Sub App은 발급받은 토큰을 SSO `/userinfo`로 introspection 해 사용자만 확인합니다.
2. **Web Component는 React + 래퍼.** 위젯은 React로 작성하고
   `reactToWebComponent`가 Custom Element(Shadow DOM)로 감쌉니다. esbuild가 React까지
   self-contained 번들로 묶어 Mother App과 런타임을 공유하지 않습니다(강결합 방지).
   위젯 내부를 바꿔도 Mother의 `WebComponentRenderer`는 손대지 않습니다.
3. **Mother App은 인증 브릿지.** 위젯의 데이터 요청은 `/bff/{appId}/...`(제네릭)를 통해
   포털 토큰을 붙여 해당 Sub App의 자기 API로 프록시할 뿐, 데이터는 가공하지 않습니다.

각 앱의 **구현 방식**은 해당 `sub-apps/*/README.md`에 자세히 설명되어 있습니다.

## 실행

Next.js 앱 6개는 npm workspaces로 node_modules를 공유합니다.

```bash
# 1. 의존성 설치 (example/ 에서 한 번)
npm install
pip install -r sso-backend/requirements.txt   # Python 3.9+

# 2. 전체 실행
./run-all.sh        # WSL / macOS / Linux
# Windows PowerShell이라면: .\run-all.ps1  (서버별 새 창 7개)

# 3. 서버 7개가 전부 떴는지 확인
npm run check
```

개별 실행: `npm run dev:mother`, `dev:skill1`, `dev:skill2`, `dev:skill2-1`,
`dev:skill3`, `dev:skill3-1` +
`python -m uvicorn main:app --host 0.0.0.0 --port 8000` (sso-backend에서).

### 안 될 때 (특히 "로그인 눌렀더니 사이트에 연결할 수 없음")

로그인 버튼은 `localhost:8000`(가짜 SSO)으로 redirect합니다. 포털(:3000)은
뜨는데 로그인만 연결 오류가 나면 **:8000이 안 떠 있거나 접근이 안 되는 것**입니다.

1. `npm run check` — 죽어 있는 서버와 실행 명령을 알려줍니다.
2. SSO 서버는 반드시 `--host 0.0.0.0`으로 띄우세요. **WSL2에서 Windows
   브라우저로 접속하는 경우** 127.0.0.1에만 바인딩된 서버는 localhost 포워딩이
   안 될 수 있습니다 (run-all.sh에 이미 반영됨).
3. `uvicorn` 명령을 못 찾으면 `python -m uvicorn ...` 또는 `python3 -m uvicorn ...`.
4. Python 3.9 이하면 `pip install` / import 에러가 날 수 있습니다 — 3.10+ 권장.
5. 그래도 WSL2 localhost 포워딩이 안 되면 `wsl --shutdown` 후 재시작하거나,
   WSL 안에서 `hostname -I`로 나온 IP로 접속해보세요 (이 경우 SSO redirect가
   localhost 기준이라 데모는 localhost 포워딩 복구를 권장).

### 자동 검증 (e2e)

서버 7개를 띄운 뒤 14개 시나리오를 헤드리스 브라우저로 검증할 수 있습니다:

```bash
npm i --no-save playwright && npx playwright install chromium   # 최초 1회
npm run e2e     # 스크린샷: e2e/shots/
```

## 데모 사용자

| 사용자 | 권한 | 체감 포인트 |
|---|---|---|
| 김철수 | `COST_SAVING_VIEW` + `COST_SAVING_EDIT` | 과제 조회 + 등록 가능 |
| 이영희 | `COST_SAVING_VIEW` | 조회만 가능 — 등록 시 backend가 **403** 반환 |

토큰에는 identity만 담고, 기능 권한은 **각 Sub App이 자기 API에서** 관리합니다 (문서 11장 Token 정책).
권한/과제 데이터는 `skill2-1`, `skill3-1`이 각자 `lib/data.ts`에 소유하므로, 두 원가절감
데모 앱의 저장소는 독립적입니다(같은 seed).

## 각 Skill 체감 시나리오

### Skill 1 — SSO 인증 (`sub-apps/skill1-sso`, :3001)

1. `http://localhost:3001` 직접 접속 → "중앙 SSO로 로그인" → 가짜 SSO에서 사용자 선택 → callback 복귀 → identity + **자기 API(/api/expenses) 경비 내역** 표시
2. 포털에서 이미 로그인했다면 SSO 세션이 재사용되어 **로그인 화면 없이 즉시 통과**

### Skill 2 — iframe 탭 (`sub-apps/skill2-iframe-tab`, :3002)

1. 포털 상단 **Legacy Report** 탭 클릭
2. 로그인 여부와 무관하게 항상 표시 — 이 앱에는 인증 코드가 한 줄도 없음

### Skill 2-1 — iframe 인증 통합 (`sub-apps/skill2-1-iframe-auth`, :3003)

1. **포털 로그인 전** **원가절감** 탭 → iframe 안에서 silent SSO 시도 → 실패 → `LOGIN_REQUIRED` postMessage → 포털 상단 경고 배너
2. 포털 로그인 후 탭 재방문 → iframe **자동 로그인** (same-sso: 중앙 SSO 세션 재사용)
3. "sessionCheckUrl 확인" 버튼 → Sub App 세션 상태를 CORS + 쿠키로 조회
4. 이영희로 과제 등록 시도 → backend `403`

### Skill 3 — Web Component (`sub-apps/skill3-web-component`, :3004)

1. 포털 홈 대시보드의 **공장 KPI** 위젯(React) — 로그인 전에도 항상 표시
2. 위젯은 자기 API `/api/kpi`에서 데이터를 그림. `scriptUrl`은 Mother App allowlist 검증 후 로드
3. Shadow DOM + esbuild 번들이라 Mother App과 스타일/React 런타임을 공유하지 않음

### Skill 3-1 — Web Component 인증 통합 (`sub-apps/skill3-1-web-component-auth`, :3005)

1. **로그인 전**: BFF 위젯 `401`, Bridge 위젯 "로그인 필요"
2. 로그인 후 (데이터 출처는 :3005의 자기 API `/api/projects`):
   - **BFF 위젯**: `fetch("/bff/cost-saving/projects", { credentials: "include" })` → Mother App BFF가 포털 토큰을 붙여 :3005 자기 API로 프록시 (토큰이 브라우저 JS에 노출되지 않음)
   - **Bridge 위젯**: Mother App이 property로 주입한 `portalAuth.getUser()` / `portalAuth.fetch()` 사용

## 문서 보안 정책 반영 사항

- `scriptUrl` allowlist 검증 (`mother-app/components/WebComponentRenderer.tsx`)
- postMessage `origin` 검증 + `targetOrigin` 명시 (`"*"` 미사용)
- token/userId를 query string이나 attribute로 전달하지 않음 — httpOnly 쿠키 + BFF/Bridge 경유
- iframe `sandbox` 속성은 manifest 선언값 사용
- `status: "disabled"` 앱/위젯은 렌더링하지 않음
- 기능별 권한(403)은 항상 Sub App의 자기 API가 최종 검증
- Web Component는 Shadow DOM으로 전역 CSS 오염 방지, React 런타임은 위젯 번들에 격리

## 참고 (데모 한계)

- SSO는 진짜 OIDC가 아니라 authorization code 흐름만 흉내낸 in-memory 구현입니다 (PKCE, JWT 서명, refresh 없음).
- 브라우저는 `localhost`의 포트만 다른 origin들을 same-site로 취급하므로 iframe 안에서도 쿠키가 동작합니다. 실제 배포에서 도메인이 다르면 same-sso/reverse-proxy 구성이 필요합니다 (문서 8장).
- 서버 재시작 시 세션/토큰/데이터가 모두 초기화됩니다.

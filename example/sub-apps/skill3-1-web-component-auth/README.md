# Skill 3-1 — Web Component 인증 통합 옵션 (bff / portal-auth-bridge)

포트 3005, 가상 앱 "원가절감 위젯". 로그인 사용자 기준 데이터를 보여주는 위젯 2개와,
그 데이터를 소유·검증하는 자기 API를 제공한다. 두 위젯 모두 **token을 직접 만지지 않는다**.

## 파일 구성

```text
widget-src/                         ← 위젯 소스(React). esbuild가 번들.
├─ CostSavingWidget.tsx             bff mode 위젯 (React)
├─ CostSavingBridgeWidget.tsx       portal-auth-bridge mode 위젯 (React)
├─ Shell.tsx                        두 위젯 공용 카드 UI
├─ reactToWebComponent.tsx          React → Custom Element 래퍼 (Shadow DOM)
└─ entry-widgets.tsx                두 태그를 등록
build-widgets.mjs                   esbuild → public/widgets/*.js (self-contained ESM)
public/widgets/*.js                 ← 생성물 (gitignore, predev/prebuild가 빌드)
lib/
├─ config.ts                        SSO_BASE_URL
└─ data.ts                          이 앱이 소유한 과제 데이터 + 권한 + Bearer 검증
app/api/projects/route.ts           자기 API (Bearer introspection + 권한 검증)
next.config.ts                      /widgets/* CORS 헤더
app/page.tsx                        안내 페이지 (데모용)
```

## 구현 방식

### 1) React 컴포넌트 + 래퍼 (Skill 3과 동일한 방식)

- 위젯을 React로 작성하고 `reactToWebComponent.tsx`가 Custom Element로 감싼다
  (Shadow DOM 격리, esbuild로 React까지 self-contained 번들 → Mother와 강결합 없음).
- 래퍼는 attribute뿐 아니라 **property 주입**도 지원한다. bridge 위젯은
  `properties: ["portalAuth"]`로 등록해 Mother가 주입한 객체를 React prop으로 받는다.

### 2) 두 가지 인증 통합 모드 — 둘 다 token을 안 만짐

- **bff mode** (`CostSavingWidget`):
  `fetch("/bff/cost-saving/projects", { credentials: "include" })`.
  Mother App BFF가 포털 쿠키의 토큰을 붙여 이 앱의 자기 API로 프록시한다.
  토큰은 브라우저 JS에 노출되지 않는다.
- **portal-auth-bridge mode** (`CostSavingBridgeWidget`):
  Mother가 property로 주입한 `portalAuth.getUser()` / `portalAuth.fetch("/projects")`만
  사용한다. 위젯은 인증 경로(토큰/쿠키/URL)를 전혀 모른다 → Mother와 느슨한 결합.

### 3) 데이터 소유·검증은 이 앱 (SSO 아님)

- `app/api/projects/route.ts`가 데이터의 소유자다.
- 이 API는 Mother BFF가 **서버-투-서버**로 붙여준 `Authorization: Bearer`를
  SSO `/userinfo`로 **introspection**(`lib/data.ts`의 `verifyBearer`)해 사용자를 확인하고,
  자기 `PERMISSIONS`로 `COST_SAVING_VIEW`를 검증한 뒤 자기 데이터를 돌려준다.
- 브라우저가 직접 호출하지 않으므로 이 API에는 CORS가 필요 없다(위젯 스크립트에만 CORS).

Manifest(요약):

```ts
webComponents: [
  { tagName: "cost-saving-secure-widget",  authIntegration: { mode: "bff",
      apiBaseUrl: "/bff/cost-saving", requiredPermissions: ["COST_SAVING_VIEW"] } },
  { tagName: "cost-saving-bridge-widget",  authIntegration: { mode: "portal-auth-bridge" } },
]
```

## 체감 포인트

1. 포털 로그인 전 → bff 위젯 401, bridge 위젯 "로그인 필요"
2. 로그인 후 → 사용자 기준 데이터 표시 (데이터 출처는 :3005 자기 API)
3. 위젯 attribute 어디에도 token/userId가 없다

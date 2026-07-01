# Mother App Guide - Optional Integration Skills

## 1. 목적

이 문서는 여러 Sub App을 하나의 Mother App 안에서 선택적으로 수용하기 위한 Mother App 전용 설계 문서이다.

핵심 전제는 다음과 같다.

```text
Mother App은 Sub App에게 모든 통합 방식을 강제하지 않는다.
Sub App은 필요한 Integration Skill만 선택해서 제공한다.
Mother App은 선언된 Skill만 해석하고 실행한다.
```

따라서 이 구조는 “플랫폼 종속형 앱”이 아니라 **선택형 Skill 기반 통합 플랫폼**이다.

---

## 2. Integration Skill 모델

Sub App이 Mother App에 제공할 수 있는 Skill은 다음과 같이 나눈다.

```text
1. SSO 인증 옵션

2. iframe 탭 제공 옵션
   2-1. iframe 인증 통합 옵션

3. Web Component 제공 옵션
   3-1. Web Component 인증 통합 옵션
```

각 옵션은 독립적으로 켜고 끌 수 있다.

| 원하는 연동 | 필요한 Skill |
|---|---|
| 중앙 SSO만 사용 | `sso` |
| 탭에 전체 앱만 표시 | `iframeTab` |
| 탭에 전체 앱 표시 + 자동 로그인 | `iframeTab` + `iframeTab.authIntegration` |
| 홈에 위젯만 제공 | `webComponents` |
| 홈 위젯 + 인증 데이터/CRUD | `webComponents` + `webComponents[].authIntegration` |
| 탭과 위젯 모두 제공 | `iframeTab` + `webComponents` |

---

## 3. Mother App의 책임

Mother App은 Sub App의 모든 인증/권한/비즈니스 로직을 흡수하지 않는다. Mother App은 다음만 책임진다.

| 영역 | Mother App 책임 |
|---|---|
| Manifest 해석 | Sub App이 제공한 Skill 확인 |
| App Tab | `iframeTab` Skill이 있는 앱만 탭으로 렌더링 |
| Home Dashboard | `webComponents` Skill이 있는 위젯만 배치 가능하게 제공 |
| SSO 진입점 | Mother App 자체 로그인과 세션 유지 |
| iframe 보안 | `allowedOrigin`, `sandbox`, `postMessage` 검증 |
| Web Component 보안 | `scriptUrl` allowlist, 로딩 실패 처리 |
| 인증 브릿지 | 인증 통합 옵션이 켜진 경우에만 제공 |
| BFF | `authIntegration.mode = "bff"`인 경우에만 사용 |
| 개인화 | 사용자별 위젯 위치/크기/속성 저장 |

Mother App이 책임지지 않는 것:

```text
- Sub App의 기능별 권한 관리
- Sub App의 업무 API 최종 검증
- Sub App 내부 로그인 정책
- Sub App 비즈니스 로직
- Web Component 내부 구현
- iframe 내부 화면 구성
```

---

## 4. 전체 구조

```text
Mother App
│
├─ Central Login / Session
│
├─ Sub App Manifest Registry
│  ├─ sso
│  ├─ iframeTab
│  └─ webComponents
│
├─ App Tabs
│  └─ iframeTab Skill이 있는 앱만 표시
│
├─ Home Dashboard
│  └─ webComponents Skill이 있는 위젯만 표시
│
├─ Optional Auth Integration
│  ├─ iframeTab.authIntegration
│  └─ webComponents[].authIntegration
│
├─ Optional BFF
│  └─ mode = "bff"인 위젯/앱만 사용
│
└─ Security Layer
   ├─ allowedOrigin
   ├─ sandbox
   ├─ scriptUrl allowlist
   └─ postMessage origin check
```

---

## 5. Sub App Manifest Schema

```ts
export type SubAppManifest = {
  appId: string;
  appName: string;
  description?: string;

  ownerTeam: string;
  supportContact?: string;

  status: "active" | "beta" | "deprecated" | "disabled";

  sso?: SsoSkill;

  iframeTab?: IframeTabSkill;

  webComponents?: WebComponentSkill[];
};
```

`sso`, `iframeTab`, `webComponents`는 모두 optional이다.

---

## 6. Skill 1: SSO 인증 옵션

Sub App이 중앙 SSO를 직접 사용할 수 있음을 선언한다.

```ts
export type SsoSkill = {
  enabled: boolean;
  provider: "oidc" | "saml";
  issuer?: string;
  clientId?: string;
  redirectUris?: string[];
  logoutUri?: string;
  mode: "standalone-sso";
};
```

예시:

```ts
sso: {
  enabled: true,
  provider: "oidc",
  issuer: "https://sso.company.com",
  clientId: "cost-saving-app",
  redirectUris: [
    "https://cost-saving.company.com/auth/callback",
    "http://localhost:5173/auth/callback"
  ],
  logoutUri: "https://cost-saving.company.com/logout",
  mode: "standalone-sso"
}
```

Mother App은 이 Skill을 보고 다음을 알 수 있다.

```text
이 앱은 직접 접속해도 중앙 SSO 로그인을 사용할 수 있다.
단, 이 앱의 기능별 권한은 여전히 Sub App이 관리한다.
```

---

## 7. Skill 2: iframe 탭 제공 옵션

Sub App 전체 화면을 Mother App 탭 안에 iframe으로 표시한다.

```ts
export type IframeTabSkill = {
  enabled: boolean;
  url: string;
  allowedOrigin: string;
  title?: string;
  sandbox?: Array<
    | "allow-scripts"
    | "allow-same-origin"
    | "allow-forms"
    | "allow-popups"
    | "allow-downloads"
  >;
  authIntegration?: IframeAuthIntegrationSkill;
};
```

인증 통합 없는 iframe 탭 예시:

```ts
iframeTab: {
  enabled: true,
  url: "https://legacy-report.company.com",
  allowedOrigin: "https://legacy-report.company.com",
  sandbox: ["allow-scripts", "allow-same-origin", "allow-forms"]
}
```

Mother App 렌더러:

```tsx
function IframeTabRenderer({ app }: { app: SubAppManifest }) {
  if (!app.iframeTab?.enabled) return null;

  return (
    <iframe
      src={app.iframeTab.url}
      title={app.iframeTab.title ?? app.appName}
      style={{ width: "100%", height: "100%", border: "none" }}
      sandbox={app.iframeTab.sandbox?.join(" ")}
    />
  );
}
```

---

## 8. Skill 2-1: iframe 인증 통합 옵션

iframe 탭을 제공하는 앱 중에서 Mother App 로그인 상태와 인증을 연결하고 싶은 경우에만 사용한다.

```ts
export type IframeAuthIntegrationSkill = {
  enabled: boolean;
  mode:
    | "same-sso"
    | "same-origin-cookie"
    | "reverse-proxy-session"
    | "post-message-login-required";
  sessionCheckUrl?: string;
  loginRequiredMessage?: boolean;
};
```

### 8.1 same-sso

Sub App과 Mother App이 같은 중앙 SSO를 사용한다.

```ts
iframeTab: {
  enabled: true,
  url: "https://cost-saving.company.com",
  allowedOrigin: "https://cost-saving.company.com",
  authIntegration: {
    enabled: true,
    mode: "same-sso",
    sessionCheckUrl: "https://cost-saving.company.com/auth/session"
  }
}
```

### 8.2 reverse-proxy-session

Sub App을 Mother App과 같은 도메인 아래 노출한다.

```text
https://portal.company.com/apps/cost-saving
```

```ts
iframeTab: {
  enabled: true,
  url: "https://portal.company.com/apps/cost-saving",
  allowedOrigin: "https://portal.company.com",
  authIntegration: {
    enabled: true,
    mode: "reverse-proxy-session",
    sessionCheckUrl: "/apps/cost-saving/auth/session"
  }
}
```

이 방식은 “하나의 홈페이지처럼 보이는 UX”에 가장 적합하다.

### 8.3 post-message-login-required

iframe 내부에서 로그인이 필요하면 Mother App에게 알려준다.

```ts
window.addEventListener("message", (event) => {
  if (event.origin !== "https://cost-saving.company.com") return;

  if (event.data?.type === "LOGIN_REQUIRED") {
    startPortalLoginFlow();
  }
});
```

---

## 9. Skill 3: Web Component 제공 옵션

Sub App이 Mother App 홈 대시보드에 배치할 수 있는 Web Component 위젯을 제공한다.

```ts
export type WebComponentSkill = {
  widgetId: string;
  title: string;
  description?: string;
  tagName: string;
  scriptUrl: string;
  size: {
    defaultW: number;
    defaultH: number;
    minW: number;
    minH: number;
    maxW?: number;
    maxH?: number;
  };
  attributes?: Record<string, string>;
  events?: Array<{
    name: string;
    description: string;
  }>;
  authIntegration?: WebComponentAuthIntegrationSkill;
  status?: "active" | "beta" | "deprecated" | "disabled";
};
```

예시:

```ts
webComponents: [
  {
    widgetId: "factory-kpi-card",
    title: "공장 KPI",
    tagName: "factory-kpi-card",
    scriptUrl: "https://factory-kpi.company.com/widgets/kpi-card.js",
    size: {
      defaultW: 2,
      defaultH: 1,
      minW: 2,
      minH: 1
    },
    attributes: {
      plant: "KR01"
    }
  }
]
```

Mother App 렌더러:

```tsx
function WebComponentRenderer({ widget }: { widget: WebComponentSkill }) {
  useEffect(() => {
    const exists = document.querySelector(`script[src="${widget.scriptUrl}"]`);
    if (exists) return;

    const script = document.createElement("script");
    script.type = "module";
    script.src = widget.scriptUrl;
    script.async = true;
    document.head.appendChild(script);
  }, [widget.scriptUrl]);

  return React.createElement(widget.tagName, widget.attributes);
}
```

---

## 10. Skill 3-1: Web Component 인증 통합 옵션

Web Component가 현재 로그인 사용자 기준으로 데이터를 조회하거나 CRUD를 해야 할 때 사용한다.

```ts
export type WebComponentAuthIntegrationSkill = {
  enabled: boolean;
  mode:
    | "bff"
    | "portal-auth-bridge"
    | "same-origin-cookie"
    | "own-sso";
  requiredPermissions?: string[];
  apiBaseUrl?: string;
};
```

### 10.1 bff

```ts
authIntegration: {
  enabled: true,
  mode: "bff",
  apiBaseUrl: "/bff/cost-saving",
  requiredPermissions: ["COST_SAVING_VIEW", "COST_SAVING_EDIT"]
}
```

Web Component는 다음처럼 호출한다.

```ts
const response = await fetch("/bff/cost-saving/projects", {
  credentials: "include"
});
```

### 10.2 portal-auth-bridge

Mother App이 Web Component에 인증 브릿지를 property로 주입한다.

```ts
export type PortalAuthBridge = {
  getUser: () => Promise<{
    userId: string;
    email: string;
    name: string;
  }>;
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};
```

```tsx
(ref.current as any).portalAuth = portalAuthBridge;
```

### 10.3 same-origin-cookie

```ts
authIntegration: {
  enabled: true,
  mode: "same-origin-cookie",
  apiBaseUrl: "/apps/cost-saving/api"
}
```

### 10.4 own-sso

Web Component 제공 앱이 자체 SSO를 사용한다. 가능은 하지만 위젯 내부 로그인 redirect가 발생할 수 있으므로 기본 권장은 아니다.

---

## 11. Manifest 해석 함수

```ts
export function getIntegrationSkills(manifest: SubAppManifest) {
  return {
    hasSso: !!manifest.sso?.enabled,
    hasIframeTab: !!manifest.iframeTab?.enabled,
    hasIframeAuthIntegration: !!manifest.iframeTab?.authIntegration?.enabled,
    hasWebComponents: !!manifest.webComponents?.length,
    hasWebComponentAuthIntegration:
      manifest.webComponents?.some((w) => w.authIntegration?.enabled) ?? false
  };
}
```

---

## 12. 사용자별 Dashboard Layout

```ts
export type UserDashboardLayout = {
  userId: string;
  dashboardId: string;
  dashboardName: string;
  widgets: Array<{
    instanceId: string;
    appId: string;
    widgetId: string;
    x: number;
    y: number;
    w: number;
    h: number;
    attributes?: Record<string, string>;
  }>;
  updatedAt: string;
};
```

---

## 13. 보안 정책

```text
1. Manifest는 승인된 Sub App에서만 등록한다.
2. scriptUrl은 allowlist 도메인만 허용한다.
3. iframe allowedOrigin은 필수로 관리한다.
4. postMessage는 origin 검증 후 처리한다.
5. userId나 token을 query string/attribute로 넘기지 않는다.
6. status가 disabled인 앱/위젯은 렌더링하지 않는다.
7. Mother App의 프론트 권한 체크를 실제 보안으로 간주하지 않는다.
```

금지 예시:

```tsx
<iframe src="https://cost-saving.company.com?userId=user-12345" />
```

```html
<cost-saving-widget user-id="user-12345" token="abc123"></cost-saving-widget>
```

---

## 14. Mother App MVP

```text
Phase 1
- SubAppManifest schema
- iframeTab 렌더링
- webComponents 렌더링
- scriptUrl allowlist
- allowedOrigin 검증

Phase 2
- Home Dashboard
- 위젯 추가/삭제/이동/크기 조정
- 사용자별 layout 저장

Phase 3
- iframe authIntegration
- same-sso
- reverse-proxy-session
- LOGIN_REQUIRED postMessage

Phase 4
- Web Component authIntegration
- bff mode
- portal-auth-bridge mode
- same-origin-cookie mode

Phase 5
- 운영 상태 관리
- ownerTeam
- deprecated/disabled 정책
```

---

## 15. 최종 원칙

```text
Mother App은 Sub App을 종속시키지 않는다.
Mother App은 Sub App이 제공하는 선택형 Skill을 수용한다.

1. SSO 인증
2. iframe 탭 제공
2-1. iframe 인증 통합
3. Web Component 제공
3-1. Web Component 인증 통합
```

한 문장으로 정리하면:

```text
Mother App은 강제 표준 플랫폼이 아니라,
Sub App의 선택적 Integration Skill을 안전하게 실행하는 컨테이너다.
```

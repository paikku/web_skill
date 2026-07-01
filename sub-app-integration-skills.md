# Sub App Guide - Optional Integration Skills

## 1. 문서 목적

이 문서는 Mother App 플랫폼에 연결되는 Sub App 개발팀 전용 설계 문서이다.

핵심 전제는 다음이다.

```text
Sub App은 Mother App에 종속될 필요가 없다.
Sub App은 필요한 Integration Skill만 선택해서 제공하면 된다.
```

지원하는 Skill은 다음과 같다.

```text
1. SSO 인증 옵션

2. iframe 탭 제공 옵션
   2-1. iframe 인증 통합 옵션

3. Web Component 제공 옵션
   3-1. Web Component 인증 통합 옵션
```

---

## 2. 가능한 Sub App 형태

| 형태 | 설명 | 제공 Skill |
|---|---|---|
| SSO만 사용하는 앱 | 직접 접속 시 중앙 SSO 사용 | `sso` |
| iframe 탭만 제공 | Mother App 탭에 전체 앱 표시 | `iframeTab` |
| iframe 탭 + 인증 통합 | 탭 안에서 자동 로그인 | `iframeTab.authIntegration` |
| Web Component만 제공 | 홈 대시보드에 위젯 제공 | `webComponents` |
| Web Component + 인증 통합 | 로그인 사용자 기준 데이터/CRUD | `webComponents[].authIntegration` |
| 탭과 위젯 모두 제공 | 전체 앱과 위젯 모두 제공 | `iframeTab` + `webComponents` |

---

## 3. Sub App Manifest

Sub App은 자신이 제공하는 Skill만 Manifest로 선언한다.

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

## 4. Skill 1: SSO 인증 옵션

Sub App이 중앙 SSO를 직접 사용하는 경우 선언한다.

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
export const manifest: SubAppManifest = {
  appId: "cost-saving",
  appName: "원가절감",
  ownerTeam: "Manufacturing Innovation",
  status: "active",

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
};
```

직접 접속 흐름:

```text
1. 사용자가 Sub App 직접 접속
2. Sub App이 로그인 상태 확인
3. 로그인 안 되어 있으면 중앙 SSO로 redirect
4. 로그인 성공 후 Sub App callback으로 복귀
5. Sub App session 또는 token 확보
6. 앱 화면 표시
```

---

## 5. Skill 2: iframe 탭 제공 옵션

Sub App 전체 화면을 Mother App 탭 안에 iframe으로 제공한다.

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

예시: 인증 통합 없는 iframe 탭

```ts
export const manifest: SubAppManifest = {
  appId: "legacy-report",
  appName: "Legacy Report",
  ownerTeam: "Report Team",
  status: "active",

  iframeTab: {
    enabled: true,
    url: "https://legacy-report.company.com",
    allowedOrigin: "https://legacy-report.company.com",
    sandbox: ["allow-scripts", "allow-same-origin", "allow-forms"]
  }
};
```

이 경우 Sub App은 Mother App 인증과 통합하지 않아도 된다.

---

## 6. Skill 2-1: iframe 인증 통합 옵션

iframe 탭 안에서 Mother App 로그인 상태 또는 중앙 SSO와 인증을 연결하고 싶은 경우에만 선언한다.

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

### 6.1 same-sso

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

### 6.2 reverse-proxy-session

Sub App을 Mother App과 같은 도메인 아래에서 서비스한다.

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

주의:

```text
- Sub App은 base path를 /apps/{appId} 형태로 대응해야 한다.
- 정적 파일 경로, 라우팅, API path를 조정해야 할 수 있다.
```

### 6.3 post-message-login-required

iframe 내부에서 로그인이 필요할 때 Mother App에 알려준다.

```ts
window.parent.postMessage(
  {
    type: "LOGIN_REQUIRED",
    payload: {
      appId: "cost-saving"
    }
  },
  "https://portal.company.com"
);
```

targetOrigin은 명확히 지정해야 한다. `"*"` 사용은 피한다.

---

## 7. Skill 3: Web Component 제공 옵션

Sub App이 Mother App 홈 대시보드에 꽂을 수 있는 위젯을 제공한다.

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
export const manifest: SubAppManifest = {
  appId: "factory-kpi",
  appName: "Factory KPI",
  ownerTeam: "Factory Data Team",
  status: "active",

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
};
```

Web Component 예시:

```ts
class FactoryKpiCard extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const plant = this.getAttribute("plant") ?? "KR01";

    this.innerHTML = `
      <section class="factory-kpi-card">
        <h3>Factory KPI - ${plant}</h3>
        <div>가동률: 92%</div>
      </section>
    `;
  }
}

customElements.define("factory-kpi-card", FactoryKpiCard);
```

---

## 8. Skill 3-1: Web Component 인증 통합 옵션

Web Component가 로그인 사용자 기준 데이터를 조회하거나 CRUD/action을 수행해야 할 때 선언한다.

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

### 8.1 bff mode

Mother App BFF를 호출한다.

```ts
authIntegration: {
  enabled: true,
  mode: "bff",
  apiBaseUrl: "/bff/cost-saving",
  requiredPermissions: ["COST_SAVING_VIEW", "COST_SAVING_EDIT"]
}
```

Web Component 내부:

```ts
const response = await fetch("/bff/cost-saving/projects", {
  credentials: "include"
});
```

### 8.2 portal-auth-bridge mode

Mother App이 Web Component에 인증 브릿지를 property로 주입한다.

```ts
type PortalAuthBridge = {
  getUser: () => Promise<{
    userId: string;
    email: string;
    name: string;
  }>;
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

class CostSavingSecureWidget extends HTMLElement {
  portalAuth?: PortalAuthBridge;

  async connectedCallback() {
    if (!this.portalAuth) {
      this.innerHTML = "Portal auth bridge가 없습니다.";
      return;
    }

    const user = await this.portalAuth.getUser();
    const response = await this.portalAuth.fetch("/api/cost-saving/projects");
    const projects = await response.json();

    this.innerHTML = `
      <section>
        <h3>${user.name}님의 원가절감 과제</h3>
        <div>${projects.length}건</div>
      </section>
    `;
  }
}

customElements.define("cost-saving-secure-widget", CostSavingSecureWidget);
```

### 8.3 same-origin-cookie mode

```ts
authIntegration: {
  enabled: true,
  mode: "same-origin-cookie",
  apiBaseUrl: "/apps/cost-saving/api"
}
```

```ts
const response = await fetch("/apps/cost-saving/api/projects", {
  credentials: "include"
});
```

### 8.4 own-sso mode

Web Component 제공 앱이 자체 SSO를 사용한다.

```ts
authIntegration: {
  enabled: true,
  mode: "own-sso"
}
```

주의:

```text
위젯 내부에서 로그인 redirect가 발생하면 사용자 경험이 좋지 않을 수 있다.
가능하면 bff 또는 same-origin-cookie를 우선 검토한다.
```

---

## 9. 기능별 권한은 Sub App에서 관리

SSO나 Mother App 인증 통합을 사용하더라도, 기능별 권한은 Sub App에서 관리한다.

```text
Authentication = 이 사용자가 누구인가?
Authorization  = 이 사용자가 이 앱에서 이 기능을 할 수 있는가?
```

예시 권한:

```text
COST_SAVING_VIEW
COST_SAVING_EDIT
COST_SAVING_DELETE
COST_SAVING_APPROVE
```

Backend 권한 체크:

```ts
function requirePermission(permission: string) {
  return async function (req, res, next) {
    const hasPermission = await permissionService.hasPermission(
      req.user.userId,
      permission
    );

    if (!hasPermission) {
      return res.status(403).json({
        code: "FORBIDDEN",
        message: "권한이 없습니다."
      });
    }

    next();
  };
}
```

---

## 10. Backend 인증 검증

Sub App Backend는 token/session을 검증해야 한다.

```ts
async function authMiddleware(req, res, next) {
  const token = extractBearerToken(req) ?? extractCookieToken(req);

  if (!token) {
    return res.status(401).json({
      code: "UNAUTHENTICATED",
      message: "로그인이 필요합니다."
    });
  }

  const claims = await verifyTokenWithSso(token);

  req.user = {
    userId: claims.sub,
    email: claims.email,
    name: claims.name,
    department: claims.department
  };

  next();
}
```

CRUD API 예시:

```ts
app.post(
  "/api/cost-saving/projects",
  authMiddleware,
  requirePermission("COST_SAVING_EDIT"),
  async (req, res) => {
    const result = await projectService.create(req.body, req.user.userId);
    res.json(result);
  }
);
```

---

## 11. Token 정책

Token에는 기능 권한을 과도하게 담지 않는다.

권장 token:

```json
{
  "sub": "user-12345",
  "email": "user@company.com",
  "name": "User Name",
  "department": "Manufacturing",
  "employeeNo": "E12345"
}
```

앱 권한은 Sub App DB에서 조회한다.

```sql
SELECT permission_code
FROM app_user_permissions
WHERE app_id = 'cost-saving'
AND user_id = 'user-12345';
```

정책:

```text
Token = 사용자 identity
Sub App DB = 기능 권한
```

---

## 12. Local Development

### 12.1 SSO Skill 개발

```env
VITE_AUTH_MODE=standalone-sso
VITE_OIDC_ISSUER=https://sso-dev.company.com
VITE_OIDC_CLIENT_ID=cost-saving-local-dev
VITE_OIDC_REDIRECT_URI=http://localhost:5173/auth/callback
```

### 12.2 iframe Tab Skill 개발

```text
http://localhost:3000  → Mother App Dev
http://localhost:5173  → Sub App Dev
```

Mother App dev shell:

```tsx
<iframe src="http://localhost:5173" />
```

### 12.3 Web Component Skill 개발

```text
http://localhost:5173/widgets/kpi-card.js
```

local manifest override:

```ts
webComponents: [
  {
    widgetId: "factory-kpi-card",
    title: "공장 KPI",
    tagName: "factory-kpi-card",
    scriptUrl: "http://localhost:5173/widgets/kpi-card.js",
    size: {
      defaultW: 2,
      defaultH: 1,
      minW: 2,
      minH: 1
    }
  }
]
```

### 12.4 인증 통합 Web Component 개발

선택지:

```text
1. Mother App dev shell + BFF mock
2. dev SSO
3. local mock user
```

local mock은 운영에서 절대 허용하지 않는다.

```ts
if (
  import.meta.env.VITE_AUTH_MODE === "local-mock" &&
  import.meta.env.PROD
) {
  throw new Error("local-mock auth is not allowed in production");
}
```

---

## 13. 보안 금지 사항

```text
1. userId를 query string으로 받아서 신뢰하지 않는다.
2. access token을 Web Component attribute로 전달하지 않는다.
3. frontend 권한 체크만으로 CRUD를 허용하지 않는다.
4. local mock token을 운영에서 허용하지 않는다.
5. postMessage를 origin 검증 없이 처리하지 않는다.
6. targetOrigin="*" 사용을 피한다.
7. scriptUrl을 임의 도메인으로 제공하지 않는다.
```

나쁜 예:

```html
<cost-saving-widget user-id="user-12345" token="abc123"></cost-saving-widget>
```

```tsx
<iframe src="https://cost-saving.company.com?userId=user-12345" />
```

---

## 14. Sub App 개발 체크리스트

### 공통

```text
[ ] appId 정의
[ ] appName 정의
[ ] ownerTeam 정의
[ ] supportContact 정의
[ ] status 정의
[ ] Manifest 제공
```

### SSO Skill

```text
[ ] 중앙 SSO client 등록
[ ] redirect URI 등록
[ ] logout URI 등록
[ ] 직접 접속 login flow 구현
[ ] local dev SSO callback 구성
```

### iframe Tab Skill

```text
[ ] iframe으로 표시 가능한 전체 앱 URL 제공
[ ] allowedOrigin 정의
[ ] sandbox 요구사항 정의
[ ] base path 대응 여부 확인
[ ] iframe 내부 redirect UX 확인
```

### iframe Auth Integration Skill

```text
[ ] same-sso / reverse-proxy-session / post-message-login-required 중 선택
[ ] sessionCheckUrl 제공
[ ] LOGIN_REQUIRED message 구현 여부 확인
[ ] postMessage targetOrigin 명시
```

### Web Component Skill

```text
[ ] Custom Element tagName 정의
[ ] scriptUrl 제공
[ ] size 정의
[ ] attributes 정의
[ ] events 정의
[ ] global CSS 오염 방지
[ ] Mother App 대시보드에서 렌더링 테스트
```

### Web Component Auth Integration Skill

```text
[ ] bff / portal-auth-bridge / same-origin-cookie / own-sso 중 선택
[ ] apiBaseUrl 정의
[ ] requiredPermissions 정의
[ ] token을 attribute로 받지 않도록 설계
[ ] 401/403 처리
[ ] CRUD API backend 권한 검증
```

---

## 15. 최종 원칙

```text
Sub App은 Mother App에 종속될 필요가 없다.
Sub App은 필요한 Skill만 제공하면 된다.

1. SSO 인증
2. iframe 탭 제공
2-1. iframe 인증 통합
3. Web Component 제공
3-1. Web Component 인증 통합
```

한 문장으로 정리하면:

```text
Sub App은 독립성을 유지한 채,
Mother App에 필요한 Integration Skill만 선택적으로 제공하는 공급자다.
```

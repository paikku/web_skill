import type { SubAppManifest } from "./types";

// Sub App Manifest Registry.
// 옵션(Skill)별로 Sub App을 하나씩 분리했다 — 각 앱은 자신이 제공하는 Skill만 선언한다.
// 파일 구성 비교는 sub-apps/skill*/README.md 참고.
export const MANIFESTS: SubAppManifest[] = [
  // Skill 1: SSO 인증 옵션만 — 화면 통합 없음, 직접 접속 시 중앙 SSO 사용
  {
    appId: "expense",
    appName: "출장경비",
    description: "중앙 SSO만 사용하는 앱 (sub-apps/skill1-sso, :3001)",
    ownerTeam: "Finance IT",
    status: "active",
    sso: {
      enabled: true,
      provider: "oidc",
      issuer: "http://localhost:8000",
      clientId: "expense-app",
      redirectUris: ["http://localhost:3001/auth/callback"],
      logoutUri: "http://localhost:3001/auth/logout",
      mode: "standalone-sso",
    },
  },

  // Skill 2: iframe 탭 제공 옵션만 — 인증 통합 없음
  {
    appId: "legacy-report",
    appName: "Legacy Report",
    description:
      "전체 화면만 탭으로 제공하는 앱 (sub-apps/skill2-iframe-tab, :3002)",
    ownerTeam: "Report Team",
    status: "active",
    iframeTab: {
      enabled: true,
      url: "http://localhost:3002",
      allowedOrigin: "http://localhost:3002",
      title: "Legacy Report",
      sandbox: ["allow-scripts", "allow-same-origin", "allow-forms"],
    },
  },

  // Skill 2-1: iframe 탭 + 인증 통합 (same-sso + LOGIN_REQUIRED postMessage)
  {
    appId: "cost-saving",
    appName: "원가절감",
    description:
      "탭 안에서 자동 로그인되는 앱 (sub-apps/skill2-1-iframe-auth, :3003)",
    ownerTeam: "Manufacturing Innovation",
    status: "active",
    iframeTab: {
      enabled: true,
      url: "http://localhost:3003",
      allowedOrigin: "http://localhost:3003",
      title: "원가절감",
      sandbox: ["allow-scripts", "allow-same-origin", "allow-forms"],
      authIntegration: {
        enabled: true,
        mode: "same-sso",
        sessionCheckUrl: "http://localhost:3003/auth/session",
        loginRequiredMessage: true,
      },
    },
  },

  // Skill 3: Web Component 제공 옵션만 — 인증 통합 없음
  {
    appId: "factory-kpi",
    appName: "Factory KPI",
    description:
      "공개 위젯만 제공하는 앱 (sub-apps/skill3-web-component, :3004)",
    ownerTeam: "Factory Data Team",
    status: "active",
    webComponents: [
      {
        widgetId: "factory-kpi-card",
        title: "공장 KPI",
        tagName: "factory-kpi-card",
        scriptUrl: "http://localhost:3004/widgets/kpi-card.js",
        size: { defaultW: 2, defaultH: 1, minW: 2, minH: 1 },
        attributes: { plant: "KR01" },
      },
    ],
  },

  // Skill 3-1: Web Component + 인증 통합 (bff / portal-auth-bridge)
  {
    appId: "cost-saving-widgets",
    appName: "원가절감 위젯",
    description:
      "인증 통합 위젯을 제공하는 앱 (sub-apps/skill3-1-web-component-auth, :3005)",
    ownerTeam: "Manufacturing Innovation",
    status: "active",
    webComponents: [
      {
        widgetId: "cost-saving-secure-widget",
        title: "내 원가절감 과제 (BFF)",
        description: "Mother App BFF(/bff/cost-saving)를 쿠키 인증으로 호출",
        tagName: "cost-saving-secure-widget",
        scriptUrl: "http://localhost:3005/widgets/cost-saving-widget.js",
        size: { defaultW: 2, defaultH: 2, minW: 2, minH: 1 },
        authIntegration: {
          enabled: true,
          mode: "bff",
          apiBaseUrl: "/bff/cost-saving",
          requiredPermissions: ["COST_SAVING_VIEW"],
        },
      },
      {
        widgetId: "cost-saving-bridge-widget",
        title: "원가절감 요약 (Auth Bridge)",
        description: "Mother App이 property로 주입한 portalAuth 브릿지 사용",
        tagName: "cost-saving-bridge-widget",
        scriptUrl: "http://localhost:3005/widgets/cost-saving-bridge-widget.js",
        size: { defaultW: 2, defaultH: 1, minW: 2, minH: 1 },
        authIntegration: {
          enabled: true,
          mode: "portal-auth-bridge",
        },
      },
    ],
  },
];

export function getManifest(appId: string) {
  return MANIFESTS.find((m) => m.appId === appId);
}

export function getIntegrationSkills(manifest: SubAppManifest) {
  return {
    hasSso: !!manifest.sso?.enabled,
    hasIframeTab: !!manifest.iframeTab?.enabled,
    hasIframeAuthIntegration: !!manifest.iframeTab?.authIntegration?.enabled,
    hasWebComponents: !!manifest.webComponents?.length,
    hasWebComponentAuthIntegration:
      manifest.webComponents?.some((w) => w.authIntegration?.enabled) ?? false,
  };
}

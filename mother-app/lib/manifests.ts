import type { SubAppManifest } from "./types";

// Sub App Manifest Registry.
// 각 앱은 자신이 제공하는 Skill만 선언한다 — 세 앱이 서로 다른 조합을 보여준다.
export const MANIFESTS: SubAppManifest[] = [
  // 케이스 1: iframeTab만 제공 (인증 통합 없음)
  {
    appId: "legacy-report",
    appName: "Legacy Report",
    description: "인증 통합 없이 전체 화면만 탭으로 제공하는 옛날 앱",
    ownerTeam: "Report Team",
    status: "active",
    iframeTab: {
      enabled: true,
      url: "http://localhost:8000/legacy-report",
      allowedOrigin: "http://localhost:8000",
      title: "Legacy Report",
      sandbox: ["allow-scripts", "allow-same-origin", "allow-forms"],
    },
  },

  // 케이스 2: sso + iframeTab(same-sso 인증 통합) + webComponents(인증 통합) 풀 옵션
  {
    appId: "cost-saving",
    appName: "원가절감",
    description: "SSO + iframe 자동 로그인 + 인증 위젯까지 모든 Skill을 켠 앱",
    ownerTeam: "Manufacturing Innovation",
    status: "active",
    sso: {
      enabled: true,
      provider: "oidc",
      issuer: "http://localhost:8000",
      clientId: "cost-saving-app",
      redirectUris: ["http://localhost:3001/auth/callback"],
      logoutUri: "http://localhost:3001/auth/logout",
      mode: "standalone-sso",
    },
    iframeTab: {
      enabled: true,
      url: "http://localhost:3001",
      allowedOrigin: "http://localhost:3001",
      title: "원가절감",
      sandbox: ["allow-scripts", "allow-same-origin", "allow-forms"],
      authIntegration: {
        enabled: true,
        mode: "same-sso",
        sessionCheckUrl: "http://localhost:3001/auth/session",
        loginRequiredMessage: true,
      },
    },
    webComponents: [
      {
        widgetId: "cost-saving-secure-widget",
        title: "내 원가절감 과제 (BFF)",
        description: "Mother App BFF(/bff/cost-saving)를 쿠키 인증으로 호출",
        tagName: "cost-saving-secure-widget",
        scriptUrl: "http://localhost:3001/widgets/cost-saving-widget.js",
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
        scriptUrl: "http://localhost:3001/widgets/cost-saving-bridge-widget.js",
        size: { defaultW: 2, defaultH: 1, minW: 2, minH: 1 },
        authIntegration: {
          enabled: true,
          mode: "portal-auth-bridge",
        },
      },
    ],
  },

  // 케이스 3: webComponents만 제공 (인증 통합 없음)
  {
    appId: "factory-kpi",
    appName: "Factory KPI",
    description: "홈 대시보드 위젯만 제공하는 앱",
    ownerTeam: "Factory Data Team",
    status: "active",
    webComponents: [
      {
        widgetId: "factory-kpi-card",
        title: "공장 KPI",
        tagName: "factory-kpi-card",
        scriptUrl: "http://localhost:8000/widgets/kpi-card.js",
        size: { defaultW: 2, defaultH: 1, minW: 2, minH: 1 },
        attributes: { plant: "KR01" },
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

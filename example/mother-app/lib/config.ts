export const SSO_BASE_URL = "http://localhost:8000";
export const PORTAL_ORIGIN = "http://localhost:3000";
export const PORTAL_CLIENT_ID = "mother-portal";
export const PORTAL_REDIRECT_URI = `${PORTAL_ORIGIN}/auth/callback`;

// Web Component scriptUrl allowlist (보안 정책 2번)
export const ALLOWED_SCRIPT_ORIGINS = [
  "http://localhost:3004", // skill3-web-component
  "http://localhost:3005", // skill3-1-web-component-auth
];

// BFF 업스트림 레지스트리 (강결합 방지).
// 위젯이 /bff/{appId}/... 를 호출하면 Mother App이 포털 토큰을 붙여
// 해당 Sub App의 "자기 API"로 서버-투-서버 프록시한다. 데이터 소유자는 Sub App.
export const BFF_UPSTREAMS: Record<string, string> = {
  "cost-saving": "http://localhost:3005/api", // skill3-1-web-component-auth 의 자체 API
};

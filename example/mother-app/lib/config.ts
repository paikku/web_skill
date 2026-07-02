export const SSO_BASE_URL = "http://localhost:8000";
export const PORTAL_ORIGIN = "http://localhost:3000";
export const PORTAL_CLIENT_ID = "mother-portal";
export const PORTAL_REDIRECT_URI = `${PORTAL_ORIGIN}/auth/callback`;

// Web Component scriptUrl allowlist (보안 정책 2번)
export const ALLOWED_SCRIPT_ORIGINS = [
  "http://localhost:3004", // skill3-web-component
  "http://localhost:3005", // skill3-1-web-component-auth
];

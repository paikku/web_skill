// mother-app-integration-skills.md 5~10장의 Skill schema 그대로.

export type SsoSkill = {
  enabled: boolean;
  provider: "oidc" | "saml";
  issuer?: string;
  clientId?: string;
  redirectUris?: string[];
  logoutUri?: string;
  mode: "standalone-sso";
};

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

export type WebComponentAuthIntegrationSkill = {
  enabled: boolean;
  mode: "bff" | "portal-auth-bridge" | "same-origin-cookie" | "own-sso";
  requiredPermissions?: string[];
  apiBaseUrl?: string;
};

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
  events?: Array<{ name: string; description: string }>;
  authIntegration?: WebComponentAuthIntegrationSkill;
  status?: "active" | "beta" | "deprecated" | "disabled";
};

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

export type PortalUser = {
  userId: string;
  email: string;
  name: string;
  department?: string;
};

export type PortalAuthBridge = {
  getUser: () => Promise<PortalUser>;
  fetch: (input: string, init?: RequestInit) => Promise<Response>;
};

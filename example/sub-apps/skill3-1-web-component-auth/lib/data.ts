import { SSO_BASE_URL } from "./config";

// 인증 통합 위젯이 그리는 데이터의 "소유자"는 이 앱이다 (SSO 아님).
// 위젯 → Mother App BFF → (이 API) 로 오며, BFF가 Authorization: Bearer <token> 을 붙여준다.
// 이 API는 그 토큰을 SSO /userinfo 로 introspection 하여 사용자를 확인한 뒤,
// 자기 저장소에서 데이터를 돌려준다.
export type Project = {
  id: number;
  title: string;
  saving: number;
  owner: string;
};

const PROJECTS: Project[] = [
  { id: 1, title: "라인 A 전력 절감", saving: 12000000, owner: "user-kim" },
  { id: 2, title: "포장재 단가 협상", saving: 8500000, owner: "user-lee" },
  { id: 3, title: "물류 경로 최적화", saving: 4300000, owner: "user-kim" },
];

const PERMISSIONS: Record<string, string[]> = {
  "user-kim": ["COST_SAVING_VIEW", "COST_SAVING_EDIT"],
  "user-lee": ["COST_SAVING_VIEW"],
};

export type VerifiedUser = { userId: string; name: string; email: string };

// Authorization 헤더의 Bearer 토큰을 SSO에 물어봐서 사용자를 확인한다.
export async function verifyBearer(
  authorization: string | null
): Promise<VerifiedUser | null> {
  if (!authorization?.toLowerCase().startsWith("bearer ")) return null;
  try {
    const res = await fetch(`${SSO_BASE_URL}/userinfo`, {
      headers: { Authorization: authorization },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const claims = await res.json();
    return { userId: claims.sub, name: claims.name, email: claims.email };
  } catch {
    return null;
  }
}

export function hasPermission(userId: string, permission: string): boolean {
  return (PERMISSIONS[userId] ?? []).includes(permission);
}

export function listProjects(): Project[] {
  return PROJECTS;
}

// 원가절감(iframe 앱)의 "자기 데이터"와 "기능별 권한".
// SSO 서버가 아니라 이 앱이 소유·검증한다.
//   - Authentication(누구인가) = SSO 담당
//   - Authorization(이 기능을 쓸 수 있는가) = 이 앱 담당 (아래 PERMISSIONS)
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

// 기능별 권한 (문서 원칙: Token=identity, 권한은 Sub App DB)
const PERMISSIONS: Record<string, string[]> = {
  "user-kim": ["COST_SAVING_VIEW", "COST_SAVING_EDIT"],
  "user-lee": ["COST_SAVING_VIEW"],
};

export function getPermissions(userId: string): string[] {
  return PERMISSIONS[userId] ?? [];
}

export function hasPermission(userId: string, permission: string): boolean {
  return getPermissions(userId).includes(permission);
}

export function listProjects(): Project[] {
  return PROJECTS;
}

export function createProject(input: {
  title: string;
  saving: number;
  owner: string;
}): Project {
  const project: Project = {
    id: Math.max(0, ...PROJECTS.map((p) => p.id)) + 1,
    title: input.title.trim() || "제목 없음",
    saving: Number.isFinite(input.saving) ? input.saving : 0,
    owner: input.owner,
  };
  PROJECTS.push(project);
  return project;
}

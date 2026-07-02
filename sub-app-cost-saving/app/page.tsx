import { getToken, getUser } from "@/lib/auth";
import { SSO_BASE_URL } from "@/lib/config";
import { LoginGate } from "@/components/LoginGate";
import { ProjectsApp } from "@/components/ProjectsApp";

type Project = { id: number; title: string; saving: number; owner: string };

// 직접 접속 흐름 (standalone-sso):
// 1. 로그인 상태 확인 → 2. 없으면 중앙 SSO redirect → 3. callback 복귀 → 4. 화면 표시
export default async function Page() {
  const user = await getUser();

  if (!user) {
    return <LoginGate />;
  }

  const token = await getToken();
  const [projectsRes, permsRes] = await Promise.all([
    fetch(`${SSO_BASE_URL}/api/cost-saving/projects`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
    fetch(`${SSO_BASE_URL}/api/cost-saving/my-permissions`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
  ]);

  const projects: Project[] = projectsRes.ok ? await projectsRes.json() : [];
  const permissions: string[] = permsRes.ok
    ? (await permsRes.json()).permissions
    : [];

  return (
    <ProjectsApp user={user} projects={projects} permissions={permissions} />
  );
}

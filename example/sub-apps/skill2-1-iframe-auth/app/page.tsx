import { getUser } from "@/lib/auth";
import { getPermissions, listProjects } from "@/lib/data";
import { LoginGate } from "@/components/LoginGate";
import { ProjectsApp } from "@/components/ProjectsApp";

export default async function Page() {
  const user = await getUser();

  if (!user) {
    return <LoginGate />;
  }

  // 데이터/권한은 SSO가 아니라 이 앱의 자기 저장소에서 읽는다 (lib/data).
  const permissions = getPermissions(user.userId);
  const projects = permissions.includes("COST_SAVING_VIEW") ? listProjects() : [];

  return (
    <ProjectsApp user={user} projects={projects} permissions={permissions} />
  );
}

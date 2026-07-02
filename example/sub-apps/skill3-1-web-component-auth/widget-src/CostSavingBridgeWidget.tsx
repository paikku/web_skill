import { useEffect, useState } from "react";
import { Shell } from "./Shell";

type PortalUser = { userId: string; name: string; email: string };
type PortalAuthBridge = {
  getUser: () => Promise<PortalUser>;
  fetch: (path: string, init?: RequestInit) => Promise<Response>;
};
type Project = { id: number };

// portal-auth-bridge mode (React 위젯):
// Mother App이 property로 주입한 portalAuth = { getUser, fetch } 만 사용한다.
// 위젯은 어떤 인증 정보(토큰/쿠키 경로)도 직접 알지 못한다 → Mother와 느슨하게 결합.
export function CostSavingBridgeWidget({
  portalAuth,
}: {
  portalAuth?: PortalAuthBridge;
}) {
  const [text, setText] = useState("포털 인증 브릿지 주입 대기 중...");

  useEffect(() => {
    if (!portalAuth) return;
    (async () => {
      try {
        const user = await portalAuth.getUser();
        const res = await portalAuth.fetch("/projects");
        if (!res.ok) return setText(`⛔ API 응답 ${res.status}`);
        const projects: Project[] = await res.json();
        setText(`${user.name}님의 조회 가능한 과제: ${projects.length}건`);
      } catch {
        setText("🔒 로그인이 필요합니다 (getUser 실패)");
      }
    })();
  }, [portalAuth]);

  const accent = { border: "#fcd34d", bg: "#fffbeb", fg: "#92400e", sub: "#d97706" };
  return (
    <Shell
      title="🌉 원가절감 요약 (Auth Bridge)"
      accent={accent}
      note='portalAuth.getUser() / portalAuth.fetch("/projects")'
    >
      {text}
    </Shell>
  );
}

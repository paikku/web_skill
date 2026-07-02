import { useEffect, useState } from "react";
import { Shell } from "./Shell";

type Project = { id: number; title: string; saving: number };

// bff mode (React 위젯):
// Mother App 안에서 실행되며 Mother 쿠키로 /bff/cost-saving/projects 를 호출한다.
// 토큰은 직접 만지지 않는다 — Mother BFF가 붙여 이 앱의 자기 API로 프록시하고,
// 데이터의 소유/검증은 그 자기 API(:3005)가 한다.
export function CostSavingWidget() {
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "error"; msg: string }
    | { kind: "ok"; projects: Project[] }
  >({ kind: "loading" });

  useEffect(() => {
    fetch("/bff/cost-saving/projects", { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401) return setState({ kind: "error", msg: "🔒 401 UNAUTHENTICATED — 포털 로그인이 필요합니다." });
        if (res.status === 403) return setState({ kind: "error", msg: "⛔ 403 FORBIDDEN — COST_SAVING_VIEW 권한이 없습니다." });
        if (!res.ok) return setState({ kind: "error", msg: `API 응답 ${res.status}` });
        setState({ kind: "ok", projects: await res.json() });
      })
      .catch((e) => setState({ kind: "error", msg: `위젯 오류: ${String(e)}` }));
  }, []);

  const accent = { border: "#a7f3d0", bg: "#ecfdf5", fg: "#047857", sub: "#6ee7b7" };
  const note = 'fetch("/bff/cost-saving/projects", { credentials: "include" })';

  return (
    <Shell title="💰 내 원가절감 과제 (BFF)" accent={accent} note={note}>
      {state.kind === "loading" && "불러오는 중..."}
      {state.kind === "error" && state.msg}
      {state.kind === "ok" && (
        <>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            {state.projects.length}건 /{" "}
            {state.projects.reduce((s, p) => s + p.saving, 0).toLocaleString()}원
          </div>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
            {state.projects.map((p) => (
              <li key={p.id}>
                {p.title} — {p.saving.toLocaleString()}원
              </li>
            ))}
          </ul>
        </>
      )}
    </Shell>
  );
}

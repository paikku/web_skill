import { getPortalUser } from "@/lib/auth";
import { MANIFESTS } from "@/lib/manifests";
import { WidgetCard } from "@/components/WidgetCard";

// Home Dashboard: webComponents Skill이 있는 앱의 위젯만 배치한다.
export default async function HomePage() {
  const user = await getPortalUser();

  const widgets = MANIFESTS.filter((m) => m.status !== "disabled").flatMap(
    (m) =>
      (m.webComponents ?? [])
        .filter((w) => w.status !== "disabled")
        .map((w) => ({ app: m, widget: w }))
  );

  return (
    <div>
      <h1 className="page-title">홈 대시보드</h1>
      <div className="notice">
        {user ? (
          <>
            <b>{user.name}</b>님으로 로그인됨 — 인증 통합 위젯(BFF / Auth
            Bridge)이 사용자 데이터를 표시합니다.
          </>
        ) : (
          <>
            로그인 전 — <b>공개 위젯(Factory KPI)</b>은 보이지만, 인증 통합
            위젯은 401을 표시합니다. 우측 상단 <b>SSO 로그인</b> 후 다시
            비교해보세요.
          </>
        )}
      </div>
      <div className="grid">
        {widgets.map(({ app, widget }) => (
          <WidgetCard key={widget.widgetId} app={app} widget={widget} />
        ))}
      </div>
    </div>
  );
}

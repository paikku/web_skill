import Link from "next/link";
import { getPortalUser } from "@/lib/auth";
import { MANIFESTS } from "@/lib/manifests";
import "./globals.css";

export const metadata = { title: "Mother App Portal" };

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getPortalUser();
  // App Tab: iframeTab Skill이 있는 앱만 탭으로 렌더링
  const tabApps = MANIFESTS.filter(
    (m) => m.iframeTab?.enabled && m.status !== "disabled"
  );
  // sso Skill만 있는 앱은 탭이 아니라 직접 접속 링크로만 노출한다
  const ssoOnlyApps = MANIFESTS.filter(
    (m) =>
      m.sso?.enabled &&
      !m.iframeTab?.enabled &&
      m.status !== "disabled" &&
      m.sso.redirectUris?.length
  );

  return (
    <html lang="ko">
      <body>
        <header className="topbar">
          <span className="logo">🏠 Mother App Portal</span>
          <nav>
            <Link href="/">홈 대시보드</Link>
            {tabApps.map((app) => (
              <Link key={app.appId} href={`/apps/${app.appId}`}>
                {app.iframeTab?.title ?? app.appName}
              </Link>
            ))}
            {ssoOnlyApps.map((app) => (
              <a
                key={app.appId}
                href={new URL(app.sso!.redirectUris![0]).origin}
                target="_blank"
                rel="noreferrer"
              >
                {app.appName} ↗
              </a>
            ))}
            <Link href="/skills">Skill Matrix</Link>
          </nav>
          <div className="user-box">
            {user ? (
              <>
                <span>
                  👤 {user.name} <small>({user.department})</small>
                </span>
                <a className="btn" href="/auth/logout">
                  로그아웃
                </a>
              </>
            ) : (
              <a className="btn primary" href="/auth/login">
                SSO 로그인
              </a>
            )}
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

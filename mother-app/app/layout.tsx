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

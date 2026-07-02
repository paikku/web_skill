import "./globals.css";

export const metadata = { title: "출장경비 (Skill 1: SSO)" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

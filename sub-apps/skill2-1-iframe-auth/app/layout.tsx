import "./globals.css";

export const metadata = { title: "원가절감 (Skill 2-1: iframe 인증 통합)" };

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

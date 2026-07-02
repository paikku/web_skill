export const metadata = { title: "원가절감 위젯 (Skill 3-1: 인증 통합)" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body style={{ fontFamily: "sans-serif", padding: 24 }}>{children}</body>
    </html>
  );
}

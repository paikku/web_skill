export const metadata = { title: "Factory KPI (Skill 3: Web Component)" };

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

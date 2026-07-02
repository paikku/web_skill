import "./globals.css";

export const metadata = { title: "Legacy Report (Skill 2: iframe 탭)" };

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

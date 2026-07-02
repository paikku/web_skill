import type { ReactNode } from "react";

// 두 위젯이 공유하는 카드 셸 (색상만 다름).
export function Shell({
  title,
  accent,
  children,
  note,
}: {
  title: string;
  accent: { border: string; bg: string; fg: string; sub: string };
  children: ReactNode;
  note: string;
}) {
  return (
    <section
      style={{
        fontFamily: "sans-serif",
        border: `1px solid ${accent.border}`,
        borderRadius: 10,
        padding: "14px 16px",
        background: accent.bg,
      }}
    >
      <div style={{ fontSize: 13, color: accent.fg, fontWeight: 600 }}>{title}</div>
      <div style={{ marginTop: 8, fontSize: 13, color: accent.fg }}>{children}</div>
      <div style={{ fontSize: 11, color: accent.sub, marginTop: 8 }}>{note}</div>
    </section>
  );
}

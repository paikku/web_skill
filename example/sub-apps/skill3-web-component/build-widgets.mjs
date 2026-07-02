// widget-src/ 의 React 위젯을 self-contained ESM 번들로 빌드해 public/widgets/ 에 출력.
// React 런타임이 번들 안에 포함되므로 Mother App과 공유/충돌하지 않는다(강결합 방지).
import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: { "kpi-card": "widget-src/entry-kpi-card.tsx" },
  outdir: "public/widgets",
  bundle: true,
  format: "esm",
  jsx: "automatic",
  minify: true,
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "info",
});

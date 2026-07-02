// widget-src/ 의 React 위젯을 self-contained ESM 번들로 빌드해 public/widgets/ 에 출력.
// React 런타임이 번들 안에 포함되므로 Mother App과 공유/충돌하지 않는다(강결합 방지).
// 두 위젯을 하나의 진입점에서 등록하고, 두 파일명으로 각각 내보낸다
// (manifest의 scriptUrl 두 개가 같은 번들을 가리켜도 customElements.get 가드로 중복 정의 안 됨).
import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: {
    "cost-saving-widget": "widget-src/entry-widgets.tsx",
    "cost-saving-bridge-widget": "widget-src/entry-widgets.tsx",
  },
  outdir: "public/widgets",
  bundle: true,
  format: "esm",
  jsx: "automatic",
  minify: true,
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "info",
});

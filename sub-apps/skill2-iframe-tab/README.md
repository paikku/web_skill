# Skill 2 — iframe 탭 제공 옵션 (인증 통합 없음)

**이 옵션만을 위해 필요한 것들만 들어있는 앱** (포트 3002, 가상 앱 "Legacy Report").

로그인도, postMessage도, 위젯도 없다. Mother App 탭 안에 iframe으로 표시될
전체 화면 URL 하나만 제공하면 끝이다.

```text
app/
├─ page.tsx     iframe에 그대로 노출될 전체 화면 (인증 코드 0줄)
├─ layout.tsx
└─ globals.css
```

Sub App이 할 일은 Manifest에 아래만 선언하는 것:

```ts
iframeTab: {
  enabled: true,
  url: "http://localhost:3002",
  allowedOrigin: "http://localhost:3002",
  sandbox: ["allow-scripts", "allow-same-origin"]
}
```

체감 포인트: Mother App 로그인 여부와 무관하게 탭 내용이 항상 보인다.

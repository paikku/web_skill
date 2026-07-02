# Skill 3-1 — Web Component 인증 통합 옵션 (bff / portal-auth-bridge)

**이 옵션만을 위해 필요한 것들만 들어있는 앱** (포트 3005, 가상 앱 "원가절감 위젯").

로그인 사용자 기준 데이터를 보여주는 위젯 2개를 서빙한다. 두 위젯 모두
**token을 직접 만지지 않는다** — 그것이 이 옵션의 핵심이다.

```text
public/widgets/
├─ cost-saving-widget.js         bff mode:
│                                fetch("/bff/cost-saving/projects", { credentials: "include" })
│                                Mother App BFF가 포털 세션의 token을 대신 붙인다
└─ cost-saving-bridge-widget.js  portal-auth-bridge mode:
                                 Mother App이 property로 주입한
                                 this.portalAuth.getUser() / .fetch() 만 사용
next.config.ts                   /widgets/* CORS 헤더
app/page.tsx                     안내 페이지 (데모용, 필수 아님)
```

Manifest 선언 (bff 쪽):

```ts
authIntegration: {
  enabled: true,
  mode: "bff",
  apiBaseUrl: "/bff/cost-saving",
  requiredPermissions: ["COST_SAVING_VIEW"]
}
```

체감 포인트:

1. 포털 로그인 전 → bff 위젯이 401, bridge 위젯이 "로그인 필요" 표시
2. 로그인 후 → 사용자 기준 데이터 표시
3. 위젯 attribute 어디에도 token/userId가 없다 (보안 금지 사항 준수)

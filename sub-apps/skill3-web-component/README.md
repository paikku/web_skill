# Skill 3 — Web Component 제공 옵션 (인증 통합 없음)

**이 옵션만을 위해 필요한 것들만 들어있는 앱** (포트 3004, 가상 앱 "Factory KPI").

로그인 코드가 전혀 없다. Mother App 홈 대시보드에 꽂힐 Custom Element
스크립트 하나를 정적으로 서빙하는 것이 전부다.

```text
public/widgets/kpi-card.js   <factory-kpi-card> Custom Element (자급자족 위젯)
next.config.ts               /widgets/* CORS 헤더 (module script는 CORS 필수)
app/page.tsx                 위젯 소개 페이지 (데모용, 필수 아님)
```

Manifest 선언:

```ts
webComponents: [{
  widgetId: "factory-kpi-card",
  tagName: "factory-kpi-card",
  scriptUrl: "http://localhost:3004/widgets/kpi-card.js",
  size: { defaultW: 2, defaultH: 1, minW: 2, minH: 1 },
  attributes: { plant: "KR01" }
}]
```

체감 포인트: 포털 로그인 여부와 무관하게 대시보드에서 항상 렌더링된다.
`plant` attribute로 표시 데이터가 바뀐다 (userId/token은 attribute 금지).

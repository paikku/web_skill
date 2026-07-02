# Skill 3 — Web Component 제공 옵션 (인증 통합 없음)

포트 3004, 가상 앱 "Factory KPI". 로그인 코드가 없다. Mother App 홈 대시보드에 꽂힐
Custom Element 위젯 하나와, 그 위젯이 데이터를 가져올 자기 API를 제공한다.

## 파일 구성

```text
widget-src/                    ← 위젯 "소스"(React). Next 앱이 아니라 esbuild가 번들.
├─ KpiCard.tsx                 React 컴포넌트 (자기 API /api/kpi에서 데이터 fetch)
├─ reactToWebComponent.tsx     React → Custom Element 래퍼 (Shadow DOM 마운트)
└─ entry-kpi-card.tsx          <factory-kpi-card> 로 등록
build-widgets.mjs              esbuild: widget-src → public/widgets/*.js (self-contained ESM)
public/widgets/kpi-card.js     ← 생성물 (gitignore, predev/prebuild가 빌드)
app/api/kpi/route.ts           이 앱의 자기 API (KPI 데이터, CORS 허용)
lib/data.ts                    KPI 데이터 소유
next.config.ts                 /widgets/*, /api/* CORS 헤더
app/page.tsx                   위젯 미리보기 페이지 (데모용)
```

## 구현 방식

### 1) React 컴포넌트 + 래퍼로 Web Component 만들기 (강결합 방지)

- 위젯을 **React 컴포넌트**(`KpiCard.tsx`)로 작성한다 — 이 팀의 평소 stack.
- `reactToWebComponent.tsx`가 그 컴포넌트를 **Custom Element**로 감싼다:
  - `attachShadow`로 **Shadow DOM**에 `createRoot` 마운트 → 스타일/DOM 격리
    (Mother App의 전역 CSS와 서로 오염되지 않음).
  - HTML attribute(`plant`) → React prop 매핑, `observedAttributes`로 변경 반영.
- `build-widgets.mjs`(esbuild)가 React 런타임까지 **한 파일에 번들**한다.
  - 결과: Mother App은 React를 몰라도 되고, 위젯의 React와 Mother의 React가
    공유/충돌하지 않는다. Mother는 `<script type="module">`로 불러
    `<factory-kpi-card>`만 쓰면 된다.
  - `predev`/`prebuild`에서 자동 빌드하므로 `npm run dev`만으로 생성된다.

### 2) 데이터는 자기 API에서 (import.meta.url로 origin 유도)

- `KpiCard`는 `/api/kpi?plant=...`를 fetch 한다. 이 API origin은
  `import.meta.url`(스크립트가 서빙된 :3004)에서 유도해 **호스트를 하드코딩하지 않는다**.
- 위젯은 Mother(:3000) 안에서 실행되며 :3004의 자기 API를 부르므로
  `next.config.ts`에서 `/widgets/*`와 `/api/*`에 CORS를 허용한다.

### 소비 측이 안 바뀐다는 점 (결합도 확인)

위젯 내부를 바닐라 JS → React로 바꿨지만 Mother App의 `WebComponentRenderer`는
전혀 수정하지 않았다. 태그 이름/attribute 계약만 지키면 되는 구조.

## 체감 포인트

포털 로그인 여부와 무관하게 항상 렌더링된다. `plant` attribute로 표시 데이터가
바뀐다 (userId/token은 attribute로 넘기지 않는다).

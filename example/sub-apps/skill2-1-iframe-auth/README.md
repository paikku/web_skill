# Skill 2-1 — iframe 인증 통합 옵션 (same-sso + post-message-login-required)

포트 3003, 가상 앱 "원가절감". Skill 2(iframe 탭)에 더해, iframe 안에서 Mother App
로그인 상태와 인증을 연결하는 코드가 추가된다. Skill 1의 SSO 로그인 코드도 갖되,
차이는 **iframe 안에서의 동작**과 **자기 데이터 API/권한**이다.

## 파일 구성

```text
app/
├─ page.tsx               로그인 상태 확인 → 과제 화면 or LoginGate (데이터는 lib/data에서)
├─ auth/login/route.ts    /authorize redirect (+ silent=1 지원 ← Skill 1과의 차이)
├─ auth/callback/route.ts token 교환 (+ error=login_required 처리 ← 차이)
├─ auth/logout/route.ts
├─ auth/session/route.ts  sessionCheckUrl — Mother App이 CORS+쿠키로 세션 조회 (2-1 전용)
└─ api/projects/route.ts  이 앱의 자기 API (과제 CRUD + 권한 검증)
lib/
├─ auth.ts                쿠키 token → SSO /userinfo (identity)
└─ data.ts                이 앱이 소유한 과제 데이터 + 기능별 권한(PERMISSIONS)
components/
├─ LoginGate.tsx          iframe이면 silent SSO 자동 시도 → 실패 시
│                         부모에게 LOGIN_REQUIRED postMessage (targetOrigin 명시)
└─ ProjectsApp.tsx        과제 목록/등록 — 버튼을 숨겨도 최종 권한 검증은 API가
```

## 구현 방식

### 1) iframe 안에서의 자동 로그인 (same-sso)

- `LoginGate`는 `window.self !== window.top`으로 **iframe 여부**를 감지한다.
- iframe이면 사용자 개입 없이 `/auth/login?silent=1`로 이동 → 중앙 SSO
  `/authorize?silent=1` 호출. SSO 세션이 있으면 화면 없이 code가 떨어져 자동 로그인.

### 2) 세션이 없을 때: LOGIN_REQUIRED postMessage

- SSO 세션이 없으면 `/authorize`가 `error=login_required`로 되돌리고,
  callback이 `/?login=required`로 보낸다.
- `LoginGate`가 이를 감지해 **부모(Mother App)** 에게 postMessage를 보낸다.
  `targetOrigin`을 포털 origin으로 명시(`"*"` 금지):

  ```ts
  window.parent.postMessage({ type: "LOGIN_REQUIRED", payload: { appId: "cost-saving" } },
    "http://localhost:3000");
  ```

### 3) sessionCheckUrl (Mother App이 세션을 조회)

- `GET /auth/session`은 현재 로그인 사용자를 JSON으로 돌려준다.
- Mother App(다른 origin)이 `credentials: include`로 부르므로
  `Access-Control-Allow-Origin` + `Allow-Credentials` CORS 헤더와 `OPTIONS`를 준다.

### 4) 데이터/권한은 SSO가 아니라 "자기 것"

- `lib/data.ts`가 과제 데이터와 `PERMISSIONS`(user별 권한)를 소유한다.
- `page.tsx`(서버 컴포넌트)는 SSO가 아니라 `lib/data`에서 직접 읽어 그린다.
- 등록은 `POST /api/projects`가 처리하며 `COST_SAVING_EDIT`를 검증한다.
  프론트에서 버튼을 숨겨도 **최종 검증은 이 API**가 한다.

## 체감 포인트

1. 포털 로그인 전 원가절감 탭 → silent 실패 → `LOGIN_REQUIRED` → 포털에 배너
2. 포털 로그인 후 탭 재방문 → **자동 로그인** (same-sso)
3. `sessionCheckUrl` 버튼으로 세션 상태 조회
4. 이영희(VIEW만)로 등록 시도 → 자기 API가 **403**

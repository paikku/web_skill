# Skill 2-1 — iframe 인증 통합 옵션 (same-sso + post-message-login-required)

**이 옵션만을 위해 필요한 것들만 들어있는 앱** (포트 3003, 가상 앱 "원가절감").

Skill 2(iframe 탭)에 더해, iframe 안에서 Mother App 로그인 상태와 인증을
연결하기 위한 코드가 추가된다. Skill 1과 같은 SSO 로그인 코드도 갖지만,
차이는 **iframe 안에서의 동작**이다.

```text
app/
├─ page.tsx               로그인 상태 확인 → 과제 CRUD 화면 or LoginGate
├─ auth/login/route.ts    /authorize redirect (+ silent=1 지원 ← Skill 1과의 차이)
├─ auth/callback/route.ts token 교환 (+ error=login_required 처리 ← 차이)
├─ auth/logout/route.ts
├─ auth/session/route.ts  sessionCheckUrl — Mother App이 CORS+쿠키로 세션 조회 (2-1 전용)
└─ api/projects/route.ts  업무 API 프록시 (쿠키 token → Bearer)
components/
├─ LoginGate.tsx          iframe이면 silent SSO 자동 시도 → 실패 시
│                         부모에게 LOGIN_REQUIRED postMessage (targetOrigin 명시)
└─ ProjectsApp.tsx        과제 목록/등록 — 권한(EDIT)은 backend가 최종 검증
```

체감 포인트:

1. 포털 로그인 전 원가절감 탭 → silent 실패 → `LOGIN_REQUIRED` → 포털에 배너
2. 포털 로그인 후 탭 재방문 → **자동 로그인** (same-sso: 중앙 SSO 세션 재사용)
3. `sessionCheckUrl` 버튼으로 Mother App이 iframe 세션 상태를 조회
4. 이영희(VIEW만)로 과제 등록 시 backend가 403

# Skill 1 — SSO 인증 옵션 (standalone-sso)

포트 3001, 가상 앱 "출장경비". Mother App과 화면 통합은 없고, 직접 접속 시 중앙 SSO로 로그인만 한다.

## 파일 구성

```text
app/
├─ page.tsx               로그인 상태 확인 → 없으면 로그인 버튼, 있으면 identity + 경비 목록
├─ auth/login/route.ts    중앙 SSO /authorize 로 redirect (state 쿠키 발급)
├─ auth/callback/route.ts code → token 교환 → httpOnly 세션 쿠키 설정
├─ auth/logout/route.ts   세션 쿠키 삭제 + 중앙 SSO 세션 종료
└─ api/expenses/route.ts  이 앱의 자기 API (경비 데이터 제공)
lib/
├─ config.ts              issuer / clientId / redirectUri (manifest sso 항목과 일치)
├─ auth.ts                쿠키의 token으로 SSO /userinfo 조회 (identity)
└─ data.ts                이 앱이 소유한 경비 데이터(in-memory)
components/ExpenseList.tsx 자기 API에서 데이터를 그리는 클라이언트 컴포넌트
```

## 구현 방식

### 1) SSO 로그인 (Authorization Code 흐름)

- `GET /auth/login` — `state`를 만들어 httpOnly 쿠키에 저장하고 중앙 SSO
  `/authorize?client_id=expense-app&redirect_uri=...&state=...` 로 302 redirect.
- 중앙 SSO가 로그인 후 `/auth/callback?code=...&state=...` 로 되돌린다.
- `GET /auth/callback` — 쿠키의 `state`와 대조(CSRF 방지)한 뒤 `code`를 SSO
  `/token` 에 POST 해 `access_token`을 받고 `expense_token` httpOnly 쿠키에 저장.
- 화면/서버는 토큰을 파싱하지 않고 SSO `/userinfo` 로 **introspection** 하여
  사용자를 확인한다(`lib/auth.ts`의 `getUser`).

### 2) 데이터는 SSO가 아니라 "자기 API"에서

- SSO는 **identity만** 준다. 경비 같은 업무 데이터는 이 앱이 소유한다.
- `lib/data.ts`에 경비 데이터를 두고, `GET /api/expenses`가 쿠키 토큰을
  검증(`getUser`)한 뒤 **본인 경비만** 필터링해 돌려준다.
- `components/ExpenseList.tsx`(클라이언트)가 `/api/expenses`를 fetch 해서 그린다
  → "각 앱은 자기 API로 데이터를 그린다".

### 체감 포인트

포털에서 이미 로그인했다면(SSO 세션 존재) "중앙 SSO로 로그인"을 눌러도
로그인 화면 없이 즉시 callback으로 복귀한다(중앙 SSO 세션 재사용).

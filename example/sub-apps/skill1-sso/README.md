# Skill 1 — SSO 인증 옵션 (standalone-sso)

**이 옵션만을 위해 필요한 것들만 들어있는 앱** (포트 3001, 가상 앱 "출장경비").

Mother App과의 통합은 전혀 없다. 직접 접속 시 중앙 SSO로 로그인할 뿐이다.

```text
app/
├─ page.tsx               로그인 상태 확인 → 없으면 LoginGate, 있으면 사용자 정보 표시
├─ auth/login/route.ts    중앙 SSO /authorize 로 redirect (state 쿠키 발급)
├─ auth/callback/route.ts code → token 교환 → httpOnly 세션 쿠키 설정
└─ auth/logout/route.ts   세션 쿠키 삭제 + 중앙 SSO 세션 종료
lib/
├─ config.ts              issuer / clientId / redirectUri (manifest sso 항목과 일치)
└─ auth.ts                쿠키의 token으로 /userinfo 조회
```

체감 포인트: 포털에서 이미 로그인했다면(SSO 세션 존재) 이 앱의 "중앙 SSO로 로그인"
버튼을 눌러도 **로그인 화면 없이 즉시** callback으로 복귀한다.

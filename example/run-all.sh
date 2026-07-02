#!/usr/bin/env bash
# 데모 서버 7개를 한 번에 실행한다.
#   :8000  가짜 중앙 SSO + 원가절감 업무 API (FastAPI)
#   :3000  Mother App Portal
#   :3001  skill1-sso                 (SSO 인증만)
#   :3002  skill2-iframe-tab          (iframe 탭만)
#   :3003  skill2-1-iframe-auth       (iframe + same-sso/postMessage)
#   :3004  skill3-web-component       (공개 위젯)
#   :3005  skill3-1-web-component-auth (인증 통합 위젯)
set -e
cd "$(dirname "$0")"

trap 'kill 0' EXIT

(cd sso-backend && uvicorn main:app --port 8000) &
npm run dev:mother &
npm run dev:skill1 &
npm run dev:skill2 &
npm run dev:skill2-1 &
npm run dev:skill3 &
npm run dev:skill3-1 &

wait

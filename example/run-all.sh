#!/usr/bin/env bash
# macOS/Linux용: 데모 서버 7개를 한 번에 실행한다. (Windows는 run-all.ps1)
#   :8000  가짜 중앙 SSO + 원가절감 업무 API (FastAPI)
#   :3000  Mother App Portal
#   :3001  skill1-sso                 (SSO 인증만)
#   :3002  skill2-iframe-tab          (iframe 탭만)
#   :3003  skill2-1-iframe-auth       (iframe + same-sso/postMessage)
#   :3004  skill3-web-component       (공개 위젯)
#   :3005  skill3-1-web-component-auth (인증 통합 위젯)
set -e
cd "$(dirname "$0")"

PY=$(command -v python3 || command -v python)

trap 'kill 0' EXIT

# --host 0.0.0.0: WSL2에서 Windows 브라우저가 localhost:8000 에 접근하려면 필수
(cd sso-backend && "$PY" -m uvicorn main:app --host 0.0.0.0 --port 8000) &
npm run dev:mother &
npm run dev:skill1 &
npm run dev:skill2 &
npm run dev:skill2-1 &
npm run dev:skill3 &
npm run dev:skill3-1 &

wait

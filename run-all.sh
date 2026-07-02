#!/usr/bin/env bash
# 데모 3개 서버를 한 번에 실행한다.
#   - http://localhost:8000  가짜 중앙 SSO + Sub App backend (FastAPI)
#   - http://localhost:3000  Mother App Portal (Next.js)
#   - http://localhost:3001  원가절감 Sub App (Next.js)
set -e
cd "$(dirname "$0")"

trap 'kill 0' EXIT

(cd sso-backend && uvicorn main:app --port 8000) &
(cd mother-app && npm run dev) &
(cd sub-app-cost-saving && npm run dev) &

wait

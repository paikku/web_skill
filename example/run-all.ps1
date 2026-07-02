# Windows용: 데모 서버 7개를 각각 새 PowerShell 창으로 실행한다.
#   PowerShell에서:  .\run-all.ps1
# (스크립트 실행이 막혀 있으면: Set-ExecutionPolicy -Scope Process Bypass)
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process powershell -ArgumentList "-NoExit", "-Command",
  "cd '$root\sso-backend'; python -m uvicorn main:app --host 0.0.0.0 --port 8000"

foreach ($t in @("mother", "skill1", "skill2", "skill2-1", "skill3", "skill3-1")) {
  Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "cd '$root'; npm run dev:$t"
}

Write-Host ""
Write-Host "7개 창이 열립니다. 전부 뜨면 http://localhost:3000 접속."
Write-Host "상태 확인: npm run check"

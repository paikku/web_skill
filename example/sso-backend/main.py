"""
가짜 중앙 SSO + Sub App(원가절감) 업무 API.

하나의 FastAPI 프로세스가 데모 편의상 2개 역할을 겸한다.

  1. 중앙 SSO (OIDC 흉내) : /authorize /token /userinfo /logout
  2. 원가절감 업무 API     : /api/cost-saving/*  (Bearer 검증 + 기능별 권한 체크)

화면(iframe 탭)과 위젯 호스팅은 각 Sub App(Next.js)이 담당한다 — sub-apps/ 참고.
"""

import secrets
import time
from urllib.parse import urlencode

from fastapi import FastAPI, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse

app = FastAPI(title="Fake Central SSO + Sub App Backend")

PORTAL_ORIGIN = "http://localhost:3000"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[PORTAL_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# 데모 데이터 (전부 in-memory)
# ---------------------------------------------------------------------------

USERS = {
    "user-kim": {
        "sub": "user-kim",
        "email": "kim@company.com",
        "name": "김철수",
        "department": "Manufacturing",
        "employeeNo": "E10001",
    },
    "user-lee": {
        "sub": "user-lee",
        "email": "lee@company.com",
        "name": "이영희",
        "department": "Finance",
        "employeeNo": "E10002",
    },
}

# 기능별 권한은 Sub App DB가 관리한다 (문서 원칙: Token = identity, DB = 권한)
COST_SAVING_PERMISSIONS = {
    "user-kim": ["COST_SAVING_VIEW", "COST_SAVING_EDIT"],
    "user-lee": ["COST_SAVING_VIEW"],
}

REGISTERED_CLIENTS = {
    "mother-portal": {"redirect_uris": ["http://localhost:3000/auth/callback"]},
    "expense-app": {"redirect_uris": ["http://localhost:3001/auth/callback"]},
    "cost-saving-app": {"redirect_uris": ["http://localhost:3003/auth/callback"]},
}

PROJECTS = [
    {"id": 1, "title": "라인 A 전력 절감", "saving": 12000000, "owner": "user-kim"},
    {"id": 2, "title": "포장재 단가 협상", "saving": 8500000, "owner": "user-lee"},
    {"id": 3, "title": "물류 경로 최적화", "saving": 4300000, "owner": "user-kim"},
]

SSO_SESSIONS: dict[str, dict] = {}   # sso_session cookie -> {user_id}
AUTH_CODES: dict[str, dict] = {}     # code -> {user_id, client_id, redirect_uri, exp}
ACCESS_TOKENS: dict[str, dict] = {}  # token -> {user_id, client_id, exp}

TOKEN_TTL = 60 * 60


# ---------------------------------------------------------------------------
# 1. 중앙 SSO
# ---------------------------------------------------------------------------

LOGIN_PAGE = """
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>중앙 SSO 로그인</title>
  <style>
    body {{ font-family: sans-serif; background: #1e293b; color: #e2e8f0;
           display: flex; justify-content: center; padding-top: 10vh; }}
    .card {{ background: #0f172a; border: 1px solid #334155; border-radius: 12px;
            padding: 32px 40px; width: 360px; }}
    h1 {{ font-size: 18px; margin-top: 0; }}
    p {{ color: #94a3b8; font-size: 13px; }}
    button {{ display: block; width: 100%; margin: 10px 0; padding: 12px;
             border-radius: 8px; border: 1px solid #475569; background: #1e293b;
             color: #e2e8f0; font-size: 14px; cursor: pointer; text-align: left; }}
    button:hover {{ background: #334155; }}
    .perm {{ font-size: 11px; color: #64748b; }}
  </style>
</head>
<body>
  <div class="card">
    <h1>🔐 중앙 SSO (sso.company.com 흉내)</h1>
    <p>client: <b>{client_id}</b><br/>redirect: {redirect_uri}</p>
    <p>데모 사용자를 선택하면 로그인됩니다.</p>
    <form method="post" action="/authorize/login">
      <input type="hidden" name="client_id" value="{client_id}" />
      <input type="hidden" name="redirect_uri" value="{redirect_uri}" />
      <input type="hidden" name="state" value="{state}" />
      <button name="user_id" value="user-kim">
        김철수 (Manufacturing)<br/>
        <span class="perm">COST_SAVING_VIEW + EDIT — 과제 등록 가능</span>
      </button>
      <button name="user_id" value="user-lee">
        이영희 (Finance)<br/>
        <span class="perm">COST_SAVING_VIEW — 조회만 가능</span>
      </button>
    </form>
  </div>
</body>
</html>
"""


def _validate_client(client_id: str, redirect_uri: str) -> bool:
    client = REGISTERED_CLIENTS.get(client_id)
    return bool(client and redirect_uri in client["redirect_uris"])


def _issue_code(user_id: str, client_id: str, redirect_uri: str) -> str:
    code = secrets.token_urlsafe(24)
    AUTH_CODES[code] = {
        "user_id": user_id,
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "exp": time.time() + 120,
    }
    return code


@app.get("/authorize")
def authorize(
    request: Request,
    client_id: str,
    redirect_uri: str,
    state: str = "",
    silent: str = "",
):
    if not _validate_client(client_id, redirect_uri):
        return JSONResponse({"error": "invalid_client_or_redirect"}, status_code=400)

    # 중앙 SSO 세션이 이미 있으면 로그인 화면 없이 즉시 code 발급 (same-sso 자동 로그인의 핵심)
    session = SSO_SESSIONS.get(request.cookies.get("sso_session", ""))
    if session:
        code = _issue_code(session["user_id"], client_id, redirect_uri)
        return RedirectResponse(
            f"{redirect_uri}?{urlencode({'code': code, 'state': state})}", status_code=302
        )

    # silent 요청(iframe 내부 자동 시도)인데 SSO 세션이 없으면 로그인 화면 대신 에러로 복귀
    if silent == "1":
        return RedirectResponse(
            f"{redirect_uri}?{urlencode({'error': 'login_required', 'state': state})}",
            status_code=302,
        )

    return HTMLResponse(
        LOGIN_PAGE.format(client_id=client_id, redirect_uri=redirect_uri, state=state)
    )


@app.post("/authorize/login")
def authorize_login(
    user_id: str = Form(...),
    client_id: str = Form(...),
    redirect_uri: str = Form(...),
    state: str = Form(""),
):
    if user_id not in USERS or not _validate_client(client_id, redirect_uri):
        return JSONResponse({"error": "invalid_request"}, status_code=400)

    code = _issue_code(user_id, client_id, redirect_uri)
    response = RedirectResponse(
        f"{redirect_uri}?{urlencode({'code': code, 'state': state})}", status_code=302
    )
    sso_session = secrets.token_urlsafe(24)
    SSO_SESSIONS[sso_session] = {"user_id": user_id}
    response.set_cookie("sso_session", sso_session, httponly=True, samesite="lax")
    return response


@app.post("/token")
def token(
    grant_type: str = Form(...),
    code: str = Form(...),
    client_id: str = Form(...),
    redirect_uri: str = Form(...),
):
    data = AUTH_CODES.pop(code, None)
    if (
        grant_type != "authorization_code"
        or not data
        or data["client_id"] != client_id
        or data["redirect_uri"] != redirect_uri
        or data["exp"] < time.time()
    ):
        return JSONResponse({"error": "invalid_grant"}, status_code=400)

    access_token = secrets.token_urlsafe(32)
    ACCESS_TOKENS[access_token] = {
        "user_id": data["user_id"],
        "client_id": client_id,
        "exp": time.time() + TOKEN_TTL,
    }
    return {"access_token": access_token, "token_type": "Bearer", "expires_in": TOKEN_TTL}


def _resolve_token(request: Request) -> dict | None:
    auth = request.headers.get("authorization", "")
    if not auth.lower().startswith("bearer "):
        return None
    data = ACCESS_TOKENS.get(auth[7:])
    if not data or data["exp"] < time.time():
        return None
    return USERS.get(data["user_id"])


@app.get("/userinfo")
def userinfo(request: Request):
    user = _resolve_token(request)
    if not user:
        return JSONResponse(
            {"code": "UNAUTHENTICATED", "message": "유효한 토큰이 없습니다."}, status_code=401
        )
    return user


@app.get("/logout")
def logout(request: Request, redirect_uri: str = PORTAL_ORIGIN):
    SSO_SESSIONS.pop(request.cookies.get("sso_session", ""), None)
    response = RedirectResponse(redirect_uri, status_code=302)
    response.delete_cookie("sso_session")
    return response


# ---------------------------------------------------------------------------
# 2. 원가절감 업무 API (Sub App backend 역할)
# ---------------------------------------------------------------------------

def _require_auth(request: Request):
    user = _resolve_token(request)
    if not user:
        return None, JSONResponse(
            {"code": "UNAUTHENTICATED", "message": "로그인이 필요합니다."}, status_code=401
        )
    return user, None


def _require_permission(user: dict, permission: str):
    if permission not in COST_SAVING_PERMISSIONS.get(user["sub"], []):
        return JSONResponse(
            {"code": "FORBIDDEN", "message": f"{permission} 권한이 없습니다."},
            status_code=403,
        )
    return None


@app.get("/api/cost-saving/projects")
def list_projects(request: Request):
    user, err = _require_auth(request)
    if err:
        return err
    err = _require_permission(user, "COST_SAVING_VIEW")
    if err:
        return err
    return PROJECTS


@app.post("/api/cost-saving/projects")
async def create_project(request: Request):
    user, err = _require_auth(request)
    if err:
        return err
    err = _require_permission(user, "COST_SAVING_EDIT")
    if err:
        return err
    body = await request.json()
    project = {
        "id": max((p["id"] for p in PROJECTS), default=0) + 1,
        "title": str(body.get("title", "")).strip() or "제목 없음",
        "saving": int(body.get("saving", 0)),
        "owner": user["sub"],
    }
    PROJECTS.append(project)
    return project


@app.get("/api/cost-saving/my-permissions")
def my_permissions(request: Request):
    user, err = _require_auth(request)
    if err:
        return err
    return {"userId": user["sub"], "permissions": COST_SAVING_PERMISSIONS.get(user["sub"], [])}

"use client";

import { useEffect, useState } from "react";
import { PORTAL_ORIGIN } from "@/lib/config";

// Skill 2-1의 핵심 컴포넌트.
// - 직접 접속: "중앙 SSO로 로그인" 버튼 (Skill 1과 동일한 흐름)
// - iframe 내부: 먼저 silent SSO를 자동 시도(same-sso). SSO 세션이 없어
//   실패(?login=required)하면 부모(Mother App)에게 LOGIN_REQUIRED postMessage.
export function LoginGate() {
  const [inIframe, setInIframe] = useState(false);
  const [silentFailed, setSilentFailed] = useState(false);

  useEffect(() => {
    const embedded = window.self !== window.top;
    const failed = new URLSearchParams(window.location.search).get("login") === "required";
    setInIframe(embedded);
    setSilentFailed(failed);

    if (embedded && !failed) {
      // same-sso 자동 로그인 시도: SSO 세션이 있으면 사용자 개입 없이 로그인된다.
      window.location.href = "/auth/login?silent=1";
      return;
    }

    if (embedded && failed) {
      window.parent.postMessage(
        { type: "LOGIN_REQUIRED", payload: { appId: "cost-saving" } },
        PORTAL_ORIGIN // targetOrigin 명시. "*" 금지.
      );
    }
  }, []);

  return (
    <div className="login-gate">
      <div className="card">
        <h1>💰 원가절감 Sub App</h1>
        {inIframe && !silentFailed ? (
          <p>중앙 SSO 세션 확인 중... (silent 로그인 시도)</p>
        ) : inIframe && silentFailed ? (
          <>
            <p>
              중앙 SSO 세션이 없습니다.
              <br />
              부모(Mother App)에게 <b>LOGIN_REQUIRED</b> postMessage를
              보냈습니다. 포털에서 로그인 후 이 탭을 새로고침하세요.
            </p>
            <a className="btn ghost" href="/auth/login">
              iframe 안에서 직접 로그인
            </a>
          </>
        ) : (
          <>
            <p>
              로그인되어 있지 않습니다. 직접 접속 시에는 중앙 SSO로
              로그인합니다.
            </p>
            <a className="btn" href="/auth/login">
              중앙 SSO로 로그인
            </a>
          </>
        )}
      </div>
    </div>
  );
}

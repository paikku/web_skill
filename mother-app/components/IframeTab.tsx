"use client";

import { useEffect, useState } from "react";
import type { IframeTabSkill } from "@/lib/types";

export function IframeTab({
  appId,
  appName,
  iframeTab,
  portalLoggedIn,
}: {
  appId: string;
  appName: string;
  iframeTab: IframeTabSkill;
  portalLoggedIn: boolean;
}) {
  const [loginRequired, setLoginRequired] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<string | null>(null);
  const auth = iframeTab.authIntegration;

  // Skill 2-1 (post-message-login-required):
  // iframe 내부에서 로그인이 필요하면 Mother App에게 알려준다. origin 검증 필수.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== iframeTab.allowedOrigin) return;
      if (event.data?.type === "LOGIN_REQUIRED") {
        setLoginRequired(true);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [iframeTab.allowedOrigin]);

  async function checkSession() {
    if (!auth?.sessionCheckUrl) return;
    try {
      const res = await fetch(auth.sessionCheckUrl, {
        credentials: "include",
      });
      setSessionInfo(JSON.stringify(await res.json()));
    } catch (e) {
      setSessionInfo(`세션 확인 실패: ${String(e)}`);
    }
  }

  return (
    <div>
      <h1 className="page-title">
        📑 {iframeTab.title ?? appName}{" "}
        <span className="badge">iframeTab</span>{" "}
        {auth?.enabled ? (
          <span className="badge auth">auth: {auth.mode}</span>
        ) : (
          <span className="badge">인증 통합 없음</span>
        )}
      </h1>

      {loginRequired && (
        <div className="warn-banner">
          <span>
            ⚠️ Sub App({appId})이 <b>LOGIN_REQUIRED</b> postMessage를
            보냈습니다.
            {portalLoggedIn
              ? " (포털은 로그인 상태 — 새로고침하면 same-sso로 자동 로그인됩니다)"
              : " 포털 SSO 로그인이 필요합니다."}
          </span>
          {!portalLoggedIn && (
            <a className="btn primary" href="/auth/login">
              포털 로그인 시작
            </a>
          )}
        </div>
      )}

      <div className="iframe-wrap">
        <iframe
          src={iframeTab.url}
          title={iframeTab.title ?? appName}
          sandbox={iframeTab.sandbox?.join(" ")}
        />
      </div>

      {auth?.sessionCheckUrl && (
        <div className="session-panel">
          <button className="btn" onClick={checkSession}>
            sessionCheckUrl 확인
          </button>
          <code>{auth.sessionCheckUrl}</code>
          {sessionInfo && <pre>{sessionInfo}</pre>}
        </div>
      )}
    </div>
  );
}

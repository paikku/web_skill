"use client";

import { useEffect, useRef, useState } from "react";
import { ALLOWED_SCRIPT_ORIGINS } from "@/lib/config";
import type { PortalAuthBridge, WebComponentSkill } from "@/lib/types";

// portal-auth-bridge mode: Mother App이 위젯에 property로 주입하는 인증 브릿지.
// token을 attribute로 넘기지 않고, 호출 자체를 Mother App(BFF)이 대신 해준다.
const portalAuthBridge: PortalAuthBridge = {
  getUser: async () => {
    const res = await fetch("/api/me", { credentials: "include" });
    if (!res.ok) throw new Error("UNAUTHENTICATED");
    return res.json();
  },
  fetch: (path, init) =>
    fetch(`/bff/cost-saving${path}`, { ...init, credentials: "include" }),
};

function isAllowedScriptUrl(scriptUrl: string) {
  try {
    return ALLOWED_SCRIPT_ORIGINS.includes(new URL(scriptUrl).origin);
  } catch {
    return false;
  }
}

export function WebComponentRenderer({
  widget,
}: {
  widget: WebComponentSkill;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 보안 정책: scriptUrl은 allowlist 도메인만 허용한다.
    if (!isAllowedScriptUrl(widget.scriptUrl)) {
      setError(`차단됨: ${widget.scriptUrl} 은 allowlist에 없습니다.`);
      return;
    }

    if (!document.querySelector(`script[src="${widget.scriptUrl}"]`)) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = widget.scriptUrl;
      script.async = true;
      script.onerror = () => setError("위젯 스크립트 로딩 실패");
      document.head.appendChild(script);
    }

    let cancelled = false;
    customElements.whenDefined(widget.tagName).then(() => {
      if (cancelled || !containerRef.current) return;
      const el = document.createElement(widget.tagName);
      for (const [key, value] of Object.entries(widget.attributes ?? {})) {
        el.setAttribute(key, value);
      }
      if (widget.authIntegration?.mode === "portal-auth-bridge") {
        (el as HTMLElement & { portalAuth?: PortalAuthBridge }).portalAuth =
          portalAuthBridge;
      }
      containerRef.current.replaceChildren(el);
    });

    return () => {
      cancelled = true;
    };
  }, [widget]);

  if (error) {
    return <div style={{ color: "#b91c1c", fontSize: 13 }}>⛔ {error}</div>;
  }
  return <div ref={containerRef}>위젯 로딩 중...</div>;
}

import type { SubAppManifest, WebComponentSkill } from "@/lib/types";
import { WebComponentRenderer } from "./WebComponentRenderer";

export function WidgetCard({
  app,
  widget,
}: {
  app: SubAppManifest;
  widget: WebComponentSkill;
}) {
  const auth = widget.authIntegration;
  return (
    <div className="widget-card">
      <header>
        <h3>{widget.title}</h3>
        {auth?.enabled ? (
          <span className="badge auth">auth: {auth.mode}</span>
        ) : (
          <span className="badge">public</span>
        )}
      </header>
      <div className="widget-meta">
        {app.appName} · {app.ownerTeam} · &lt;{widget.tagName}&gt;
      </div>
      <WebComponentRenderer widget={widget} />
    </div>
  );
}

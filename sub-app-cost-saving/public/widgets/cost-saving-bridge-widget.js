// Skill 3-1 데모 (portal-auth-bridge mode):
// Mother App이 property로 주입하는 portalAuth = { getUser, fetch } 브릿지만 사용한다.
// 위젯은 어떤 인증 정보도 직접 갖지 않는다.
class CostSavingBridgeWidget extends HTMLElement {
  set portalAuth(bridge) {
    this._auth = bridge;
    this.load();
  }

  connectedCallback() {
    if (!this._auth) {
      this.box("portalAuth 브릿지 주입 대기 중...");
    }
  }

  box(inner) {
    this.innerHTML = `
      <section style="font-family:sans-serif;border:1px solid #fcd34d;border-radius:10px;
                      padding:14px 16px;background:#fffbeb;">
        <div style="font-size:13px;color:#92400e;font-weight:600;">🌉 원가절감 요약 (Auth Bridge)</div>
        <div style="margin-top:8px;font-size:13px;color:#78350f;">${inner}</div>
        <div style="font-size:11px;color:#d97706;margin-top:8px;">this.portalAuth.getUser() / this.portalAuth.fetch("/projects")</div>
      </section>
    `;
  }

  async load() {
    this.box("불러오는 중...");
    try {
      const user = await this._auth.getUser();
      const res = await this._auth.fetch("/projects");
      if (!res.ok) {
        this.box(`⛔ API 응답 ${res.status}`);
        return;
      }
      const projects = await res.json();
      this.box(
        `<b>${user.name}</b>님의 조회 가능한 과제: <b>${projects.length}건</b>`
      );
    } catch (e) {
      this.box(`🔒 로그인이 필요합니다 (getUser 실패)`);
    }
  }
}

if (!customElements.get("cost-saving-bridge-widget")) {
  customElements.define("cost-saving-bridge-widget", CostSavingBridgeWidget);
}

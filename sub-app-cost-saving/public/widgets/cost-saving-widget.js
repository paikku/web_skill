// Skill 3-1 데모 (bff mode):
// 이 위젯은 Mother App 페이지 안에서 실행되므로, Mother App origin 기준
// 상대 경로 /bff/cost-saving/* 를 쿠키 인증(credentials: include)으로 호출한다.
// 토큰을 직접 만지지 않는다 — Mother App BFF가 토큰을 붙여준다.
class CostSavingSecureWidget extends HTMLElement {
  connectedCallback() {
    this.load();
  }

  box(inner) {
    this.innerHTML = `
      <section style="font-family:sans-serif;border:1px solid #a7f3d0;border-radius:10px;
                      padding:14px 16px;background:#ecfdf5;">
        <div style="font-size:13px;color:#047857;font-weight:600;">💰 내 원가절감 과제 (BFF)</div>
        <div style="margin-top:8px;font-size:13px;color:#064e3b;">${inner}</div>
        <div style="font-size:11px;color:#6ee7b7;margin-top:8px;">fetch("/bff/cost-saving/projects", { credentials: "include" })</div>
      </section>
    `;
  }

  async load() {
    this.box("불러오는 중...");
    try {
      const res = await fetch("/bff/cost-saving/projects", {
        credentials: "include",
      });
      if (res.status === 401) {
        this.box(`🔒 <b>401 UNAUTHENTICATED</b> — 포털 로그인이 필요합니다.`);
        return;
      }
      if (res.status === 403) {
        this.box(`⛔ <b>403 FORBIDDEN</b> — COST_SAVING_VIEW 권한이 없습니다.`);
        return;
      }
      const projects = await res.json();
      const total = projects.reduce((sum, p) => sum + (p.saving || 0), 0);
      this.box(`
        <div style="font-size:22px;font-weight:700;">${projects.length}건 / ${total.toLocaleString()}원</div>
        <ul style="margin:8px 0 0;padding-left:18px;">
          ${projects.map((p) => `<li>${p.title} — ${p.saving.toLocaleString()}원</li>`).join("")}
        </ul>
      `);
    } catch (e) {
      this.box(`위젯 오류: ${String(e)}`);
    }
  }
}

if (!customElements.get("cost-saving-secure-widget")) {
  customElements.define("cost-saving-secure-widget", CostSavingSecureWidget);
}

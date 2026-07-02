// Skill 3 데모: 인증 통합이 필요 없는 공개 Web Component 위젯.
class FactoryKpiCard extends HTMLElement {
  static get observedAttributes() {
    return ["plant"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const plant = this.getAttribute("plant") ?? "KR01";
    const data = {
      KR01: { rate: "92%", oee: "87%" },
      KR02: { rate: "88%", oee: "81%" },
    }[plant] ?? { rate: "-", oee: "-" };

    this.innerHTML = `
      <section style="font-family:sans-serif;border:1px solid #d1d5db;border-radius:10px;
                      padding:14px 16px;background:linear-gradient(135deg,#eff6ff,#e0e7ff);">
        <div style="font-size:13px;color:#4338ca;font-weight:600;">🏭 Factory KPI — ${plant}</div>
        <div style="display:flex;gap:24px;margin-top:10px;">
          <div>
            <div style="font-size:11px;color:#6b7280;">가동률</div>
            <div style="font-size:24px;font-weight:700;color:#1e3a8a;">${data.rate}</div>
          </div>
          <div>
            <div style="font-size:11px;color:#6b7280;">OEE</div>
            <div style="font-size:24px;font-weight:700;color:#1e3a8a;">${data.oee}</div>
          </div>
        </div>
        <div style="font-size:11px;color:#9ca3af;margin-top:8px;">인증 통합 없음 · 누구나 볼 수 있는 위젯</div>
      </section>
    `;
  }
}

if (!customElements.get("factory-kpi-card")) {
  customElements.define("factory-kpi-card", FactoryKpiCard);
}

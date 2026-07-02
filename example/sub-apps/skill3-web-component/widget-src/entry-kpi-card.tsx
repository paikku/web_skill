import { defineReactWebComponent } from "./reactToWebComponent";
import { KpiCard } from "./KpiCard";

// React 컴포넌트를 <factory-kpi-card plant="KR01"> 커스텀 엘리먼트로 등록.
defineReactWebComponent("factory-kpi-card", KpiCard as never, {
  observedAttributes: ["plant"],
});

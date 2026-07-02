import { defineReactWebComponent } from "./reactToWebComponent";
import { CostSavingWidget } from "./CostSavingWidget";
import { CostSavingBridgeWidget } from "./CostSavingBridgeWidget";

// bff mode 위젯: attribute/property 주입 없음.
defineReactWebComponent("cost-saving-secure-widget", CostSavingWidget as never);

// portal-auth-bridge mode 위젯: Mother App이 portalAuth 객체를 property로 주입.
defineReactWebComponent("cost-saving-bridge-widget", CostSavingBridgeWidget as never, {
  properties: ["portalAuth"],
});

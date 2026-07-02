import { createElement, type ComponentType } from "react";
import { createRoot, type Root } from "react-dom/client";

/**
 * React 컴포넌트를 프레임워크 중립적인 Custom Element로 감싸는 얇은 래퍼.
 *
 * 목적(강결합 방지):
 *  - 위젯은 이 앱의 stack(React)으로 편하게 작성한다.
 *  - 소비하는 쪽(Mother App)은 React를 몰라도 된다 — <script>로 불러 <tag-name>만 쓰면 된다.
 *    React 런타임은 빌드 시 위젯 번들에 포함되어 Mother App의 React와 공유되지 않는다.
 *  - Shadow DOM 마운트로 스타일/DOM을 격리한다.
 *
 * 매핑:
 *  - observedAttributes: HTML attribute → React prop (문자열)
 *  - properties: JS property(예: portalAuth 객체) → React prop (객체/함수 주입용)
 */
export function defineReactWebComponent(
  tagName: string,
  Component: ComponentType<Record<string, unknown>>,
  opts: { observedAttributes?: string[]; properties?: string[] } = {}
): void {
  const { observedAttributes = [], properties = [] } = opts;
  if (typeof window === "undefined" || customElements.get(tagName)) return;

  class ReactWebComponent extends HTMLElement {
    static observedAttributes = observedAttributes;
    private root: Root | null = null;
    private props: Record<string, unknown> = {};

    connectedCallback() {
      for (const name of observedAttributes) {
        const v = this.getAttribute(name);
        if (v !== null) this.props[name] = v;
      }
      const mount = this.shadowRoot ?? this.attachShadow({ mode: "open" });
      this.root = createRoot(mount);
      this.renderReact();
    }

    attributeChangedCallback(name: string, _old: string | null, value: string | null) {
      this.props[name] = value;
      this.renderReact();
    }

    disconnectedCallback() {
      this.root?.unmount();
      this.root = null;
    }

    private renderReact() {
      this.root?.render(createElement(Component, { ...this.props }));
    }
  }

  // 객체/함수 주입용 property (예: portalAuth). connect 전에 세팅돼도 보관됐다가 connect 시 렌더된다.
  for (const prop of properties) {
    Object.defineProperty(ReactWebComponent.prototype, prop, {
      configurable: true,
      get() {
        return (this as ReactWebComponent)["props"][prop];
      },
      set(value: unknown) {
        const el = this as ReactWebComponent;
        el["props"][prop] = value;
        el["renderReact"]();
      },
    });
  }

  customElements.define(tagName, ReactWebComponent);
}

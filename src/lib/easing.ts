export const EASING_CURVES = {
  linear: "cubic-bezier(0, 0, 1, 1)",
  easeInOut: "cubic-bezier(0.42, 0, 0.58, 1)",
  easeOutBack: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  easeOutBounce: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  springGentle: "cubic-bezier(0.18, 0.89, 0.32, 1.15)",
  springBouncy: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
};

export function injectEasingCSSVariables() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--ease-linear", EASING_CURVES.linear);
  root.style.setProperty("--ease-in-out", EASING_CURVES.easeInOut);
  root.style.setProperty("--ease-out-back", EASING_CURVES.easeOutBack);
  root.style.setProperty("--ease-out-bounce", EASING_CURVES.easeOutBounce);
  root.style.setProperty("--ease-spring-gentle", EASING_CURVES.springGentle);
  root.style.setProperty("--ease-spring-bouncy", EASING_CURVES.springBouncy);
}

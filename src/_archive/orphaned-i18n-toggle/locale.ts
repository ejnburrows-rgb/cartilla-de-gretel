// locale.ts — language detection + persistence.
// Default is Spanish. English is an explicit choice for bilingual readers.
// Persisted in localStorage so the choice survives reloads.

export type Lang = "es" | "en";

const KEY = "cartilla.lang.v1";

export function getLang(): Lang {
  if (typeof window === "undefined") return "es";
  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored === "es" || stored === "en") return stored;
  } catch {
    /* swallow */
  }
  // Default to Spanish per locked spec.
  return "es";
}

export function setLang(lang: Lang): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, lang);
    window.dispatchEvent(new CustomEvent("cartilla:lang-change", { detail: { lang } }));
  } catch {
    /* swallow */
  }
}

export function toggleLang(): Lang {
  const next: Lang = getLang() === "es" ? "en" : "es";
  setLang(next);
  return next;
}

export function onLangChange(handler: (lang: Lang) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    const ce = e as CustomEvent<{ lang: Lang }>;
    handler(ce.detail.lang);
  };
  window.addEventListener("cartilla:lang-change", listener);
  return () => window.removeEventListener("cartilla:lang-change", listener);
}

export function pickByLang<T>(es: T, en: T, lang: Lang = getLang()): T {
  return lang === "en" ? en : es;
}

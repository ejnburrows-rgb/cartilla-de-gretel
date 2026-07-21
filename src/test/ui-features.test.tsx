/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { ThemeToggle } from "../components/ThemeToggle";

const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
    removeItem(key: string) {
      delete store[key];
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("UI Features", () => {
  beforeEach(() => {
    global.localStorage.clear();
    document.documentElement.className = "";
  });

  describe("Theme Persistence", () => {
    it("persists theme to localStorage and applies class to document", () => {
      render(<ThemeToggle />);
      const btn = screen.getByRole("button");

      // Default is light (or depends on prefers-color-scheme, which is mocked or undefined here)
      // Since window.matchMedia might be undefined, it falls back to 'light'

      // Click toggles it (if it was light, it becomes dark)
      fireEvent.click(btn);
      const afterClick = document.documentElement.classList.contains("dark");
      expect(localStorage.getItem("reader.theme")).toBe(afterClick ? '"dark"' : '"light"');

      // Click again
      fireEvent.click(btn);
      expect(document.documentElement.classList.contains("dark")).toBe(!afterClick);
      expect(localStorage.getItem("reader.theme")).toBe(!afterClick ? '"dark"' : '"light"');
    });
  });

  // The English (ES/EN) language toggle was removed: the interface is
  // Spanish-only (see AGENTS.md). LanguageToggle now renders only the theme
  // toggle, so there is no language-switch behavior left to test here.
});

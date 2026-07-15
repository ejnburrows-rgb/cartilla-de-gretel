/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { ThemeToggle } from "../components/ThemeToggle";
import { LanguageToggle } from "../components/LanguageToggle";
import { LanguageProvider } from "../context/LanguageContext";

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

  describe("Language Toggle", () => {
    it("switches language and persists to localStorage", () => {
      render(
        <LanguageProvider>
          <LanguageToggle />
        </LanguageProvider>,
      );

      const btn = screen.getByText("ES");

      fireEvent.click(btn);
      expect(screen.getByText("EN")).toBeDefined();
      expect(localStorage.getItem("cartilla_lang")).toBe("en");

      fireEvent.click(screen.getByText("EN"));
      expect(screen.getByText("ES")).toBeDefined();
      expect(localStorage.getItem("cartilla_lang")).toBe("es");
    });
  });
});

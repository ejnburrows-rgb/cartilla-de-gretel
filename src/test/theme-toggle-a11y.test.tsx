/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
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

describe("ThemeToggle accessibility", () => {
  beforeEach(() => {
    global.localStorage.clear();
    document.documentElement.className = "";
  });

  it("exposes an accessible name so screen readers can announce it", () => {
    render(<ThemeToggle />);
    // getByRole with a name will only find the button if it has an accessible
    // name (aria-label). This fails if the aria-label is removed.
    const btn = screen.getByRole("button", { name: /modo (claro|oscuro)/i });
    expect(btn).toBeDefined();
    expect(btn.getAttribute("aria-label")).toMatch(/modo (claro|oscuro)/i);
  });

  it("uses a large enough tap target (44x44px via h-11 w-11)", () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole("button", { name: /modo (claro|oscuro)/i });
    expect(btn.className).toContain("h-11");
    expect(btn.className).toContain("w-11");
  });
});

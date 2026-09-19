import { describe, expect, it } from "vitest";
import { BRANDING, copyrightLine, pageTitle } from "@/lib/branding";

describe("Centralized Branding Configuration", () => {
  it("defines the standard BRANDING metadata correctly", () => {
    expect(BRANDING.productName).toBe("La Cartilla de Gretel");
    expect(BRANDING.productTagline).toContain("Edición digital interactiva");
    expect(BRANDING.shortName).toBe("Cartilla");
    expect(BRANDING.author).toBe("Leonor Lopetegui");
    expect(BRANDING.publisher).toBe("Double R Publishing");
    expect(BRANDING.publisherEstablished).toBe(2004);
    expect(BRANDING.supportEmail).toBe("info@doublerpublishing.com");
    expect(BRANDING.themeColor).toBe("#3b82f6");
  });

  it("generates correct pageTitle with and without sections", () => {
    expect(pageTitle()).toBe("La Cartilla de Gretel");
    expect(pageTitle("")).toBe("La Cartilla de Gretel");
    expect(pageTitle("Maestro")).toBe("Maestro — La Cartilla de Gretel");
    expect(pageTitle("Lección 5")).toBe("Lección 5 — La Cartilla de Gretel");
  });

  it("generates copyrightLine containing current year, publisher and author", () => {
    const currentYear = new Date().getFullYear().toString();
    const line = copyrightLine();
    expect(line).toContain(currentYear);
    expect(line).toContain("Double R Publishing");
    expect(line).toContain("Leonor Lopetegui");
    expect(line).toBe(`© ${currentYear} Double R Publishing · Leonor Lopetegui`);
  });
});

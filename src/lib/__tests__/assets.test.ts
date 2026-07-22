import { afterEach, describe, expect, it, vi } from "vitest";
import { assetPath, routePath } from "@/lib/assets";

describe("Asset Routing Utilities", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("handles standard assetPath with default BASE_URL (/) and resolves correctly", () => {
    // Default BASE_URL in Vitest is usually "/"
    expect(assetPath("/art/hd/page-001.png")).toBe("/art/hd/page-001.png");
    expect(assetPath("art/hd/page-001.png")).toBe("/art/hd/page-001.png");
    expect(assetPath("///art/hd/page-001.png")).toBe("/art/hd/page-001.png");
  });

  it("handles assetPath with custom subpath BASE_URL", () => {
    vi.stubEnv("BASE_URL", "/my-subpath/");
    expect(assetPath("/art/hd/page-001.png")).toBe("/my-subpath/art/hd/page-001.png");
    expect(assetPath("art/hd/page-001.png")).toBe("/my-subpath/art/hd/page-001.png");
  });

  it("handles standard routePath with default BASE_URL (/) and resolves correctly", () => {
    expect(routePath("/cartilla/lecciones")).toBe("/cartilla/lecciones");
    expect(routePath("")).toBe("");
  });

  it("handles routePath with custom subpath BASE_URL", () => {
    vi.stubEnv("BASE_URL", "/my-subpath/");
    expect(routePath("/cartilla/lecciones")).toBe("/my-subpath/cartilla/lecciones");
    expect(routePath("")).toBe("/my-subpath");
  });
});

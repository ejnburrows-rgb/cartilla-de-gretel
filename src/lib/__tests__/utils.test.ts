import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn class merger utility", () => {
  it("combines standard string inputs", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
    expect(cn("px-4 py-2", "rounded-md", "font-bold")).toBe("px-4 py-2 rounded-md font-bold");
  });

  it("handles conditional classes correctly", () => {
    const isPrimary = true;
    const isSecondary = false;
    expect(cn("btn", isPrimary && "btn-primary", isSecondary && "btn-secondary")).toBe(
      "btn btn-primary",
    );
  });

  it("handles object-style class inputs", () => {
    expect(
      cn("static-class", {
        "active-class": true,
        "inactive-class": false,
      }),
    ).toBe("static-class active-class");
  });

  it("filters out falsy values like null, undefined, false, or empty string", () => {
    expect(cn("visible", null, undefined, false, "", "always-visible")).toBe(
      "visible always-visible",
    );
  });

  it("merges conflicting Tailwind CSS utility classes using tailwind-merge", () => {
    // p-4 should override both px-2 and py-1
    expect(cn("px-2 py-1", "p-4")).toBe("p-4");

    // text-blue-500 should override text-red-500
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});

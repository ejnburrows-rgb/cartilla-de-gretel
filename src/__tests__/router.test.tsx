/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "../router";

describe("getRouter", () => {
  it("creates a router with the expected configuration", () => {
    const router = getRouter();

    expect(router).toBeDefined();
    expect(router.options.scrollRestoration).toBe(true);
    expect(router.options.defaultPreloadStaleTime).toBe(0);
    expect(router.options.context?.queryClient).toBeDefined();
  });

  it("can be provided to RouterProvider without crashing", () => {
    const router = getRouter();
    const { container } = render(<RouterProvider router={router} />);
    expect(container).toBeDefined();
  });
});

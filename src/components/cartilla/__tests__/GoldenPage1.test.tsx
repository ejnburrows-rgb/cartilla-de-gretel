import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { FaithfulPageRenderer } from "@/components/cartilla/FaithfulPageRenderer";
import pageLayouts from "@/data/page-layouts.json";

describe("Golden Workbook Page 1 — Clean Digital Canvas", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders page 1 with data-page-number='1' and exact instruction text", () => {
    const { container } = render(
      <FaithfulPageRenderer pageNumber={1} lessonNumber={1} interactive native />
    );

    const pageFrame = container.querySelector(".faithful-page");
    expect(pageFrame).not.toBeNull();
    expect(pageFrame?.getAttribute("data-page-number")).toBe("1");

    const page1Data = pageLayouts.pages["1"];
    const instructionRegion = page1Data.regions.find((r) => r.regionType === "instruction");
    expect(instructionRegion).toBeDefined();

    expect(instructionRegion?.text).toBeDefined();
    expect(screen.getByText((content) => content.includes(instructionRegion?.text ?? ""))).toBeDefined();
  });

  it("renders all 20 picture grid items for page 1 exercise", () => {
    const { container } = render(
      <FaithfulPageRenderer pageNumber={1} lessonNumber={1} interactive native />
    );

    const cells = container.querySelectorAll(".fp-ix-cell");
    expect(cells.length).toBe(20);

    const mainImages = container.querySelectorAll(".fp-ix-cell img.living-illustration__art");
    expect(mainImages.length).toBe(20);
  });
});

/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { isValidElement, type ReactElement } from "react";
import { ExactWorkbookPage } from "@/components/cartilla/ExactWorkbookPage";
import { DigitalPageViewer } from "@/components/StudentBook/DigitalPageViewer";
import { NativeLessonViewer } from "@/components/StudentBook/NativeLessonViewer";
import { CATALOG } from "@/lib/lesson-catalog";
import { buildPageArray } from "@/utils/buildPageArray";

afterEach(() => cleanup());

describe("workbook exact-replica surface", () => {
  it("renders the locked canonical page image without a reconstructed/remastered substitute", () => {
    const { container } = render(<ExactWorkbookPage pageNumber={4} />);
    const image = screen.getByRole("img", { name: "Página 4 del cuaderno" });

    expect(image).toHaveAttribute("src", "/cartilla/art/source/workbook/page-004.jpg");
    expect(container.querySelector('[data-exact-workbook-page="true"]')).not.toBeNull();
    expect(container.querySelector("[data-reconstructed-master]")).toBeNull();
  });

  it("routes every lesson page through the exact canonical workbook page", () => {
    expect(CATALOG).toHaveLength(24);

    for (const lesson of CATALOG) {
      const pages = buildPageArray(lesson.n);
      expect(pages.length).toBeGreaterThan(0);

      for (const page of pages) {
        expect(isValidElement(page.content)).toBe(true);
        const element = page.content as ReactElement;
        expect(element.type).toBe(ExactWorkbookPage);
      }
    }
  });

  it("removes reader toolbar, page-list chrome, and companion in exact-replica mode", () => {
    render(
      <DigitalPageViewer
        exactReplica
        pages={[
          {
            id: "p4",
            pageNumber: 4,
            content: <ExactWorkbookPage pageNumber={4} />,
          },
        ]}
        bookCompanion={<div>Gretel chrome</div>}
      />,
    );

    expect(screen.queryByText("Páginas")).toBeNull();
    expect(screen.queryByText("Gretel chrome")).toBeNull();
    expect(document.querySelector(".digital-reader__toolbar")).toBeNull();
    expect(document.querySelector(".digital-reader__controls")).toBeNull();
  });

  it("removes lesson topline and progress dots in exact-replica mode", () => {
    render(
      <NativeLessonViewer
        exactReplica
        pages={[
          {
            id: "p19",
            pageNumber: 19,
            content: <ExactWorkbookPage pageNumber={19} />,
          },
        ]}
        chapterLabel="Lección 7"
        bookCompanion={<div>Gretel chrome</div>}
      />,
    );

    expect(document.querySelector(".native-lesson-viewer__topline")).toBeNull();
    expect(document.querySelector(".native-lesson-viewer__progress")).toBeNull();
    expect(screen.queryByText("Gretel chrome")).toBeNull();
  });
});

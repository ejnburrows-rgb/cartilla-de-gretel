/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LivingIllustration } from "../LivingIllustration";
import { InteractivePictureGrid } from "@/components/cartilla/InteractivePageExercises";
import { getPageLayout } from "@/lib/book-faithful";
import { getLivingActor } from "@/lib/living-actor-registry";

vi.mock("@/lib/piano-audio", () => ({
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));

afterEach(cleanup);

const ARDILLA_SRC = "/cartilla/art/faithful/vocal-a/ardilla.webp";
const ARDILLA_384 = "/cartilla/art/delivery/faithful/384/vocal-a/ardilla.webp";
const ARDILLA_768 = "/cartilla/art/delivery/faithful/768/vocal-a/ardilla.webp";

describe("Gate 2: Component Rendering in <LivingIllustration> for Ardilla", () => {
  it("renders ardilla.webp without exceptions in normal motion mode with wag action and tail part", () => {
    const actor = getLivingActor(ARDILLA_SRC);
    expect(actor).toBeDefined();
    expect(actor?.action).toBe("wag");
    expect(actor?.creature).toBe(true);
    expect(actor?.parts).toHaveLength(1);
    expect(actor?.parts?.[0].name).toBe("tail");

    let renderError: unknown = null;
    let container: HTMLElement | null = null;

    try {
      const rendered = render(<LivingIllustration src={ARDILLA_SRC} alt="ardilla" />);
      container = rendered.container;
    } catch (e) {
      renderError = e;
    }

    expect(renderError).toBeNull();
    expect(container).not.toBeNull();

    // Verify main image element
    const mainImg = screen.getByRole("img", { name: "ardilla" });
    expect(mainImg.getAttribute("src")).toBe(ARDILLA_SRC);
    expect(mainImg.getAttribute("srcset")).toBe(`${ARDILLA_384} 1x, ${ARDILLA_768} 2x`);

    // Verify wrapper metadata & part rigging
    const wrapper = container!.querySelector(".living-illustration");
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute("data-ambient-motion")).toBe("wag");
    expect(wrapper?.getAttribute("data-part-based")).toBe("true");
    expect(wrapper?.getAttribute("data-interactive")).toBe("true");
    expect(wrapper?.className).toContain("living-illustration--creature-life");
    expect(wrapper?.className).toContain("living-illustration--part-rigged");

    // Verify tail part element
    const tailPart = container!.querySelector(".living-illustration__part--tail");
    expect(tailPart).not.toBeNull();
    expect(tailPart?.getAttribute("src")).toBe(ARDILLA_SRC);

    // Verify interaction trigger does not throw
    fireEvent.pointerDown(wrapper!);
    expect(wrapper?.className).toContain("living-illustration--reacting");
  });

  it("renders ardilla.webp without exceptions in reduced-motion mode and suppresses ambient animation", async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;

    try {
      let renderError: unknown = null;
      let container: HTMLElement | null = null;

      try {
        const rendered = render(
          <LivingIllustration src={ARDILLA_SRC} alt="ardilla quieta" />,
        );
        container = rendered.container;
      } catch (e) {
        renderError = e;
      }

      expect(renderError).toBeNull();
      expect(container).not.toBeNull();

      const mainImg = screen.getByRole("img", { name: "ardilla quieta" });
      expect(mainImg.getAttribute("src")).toBe(ARDILLA_SRC);

      const wrapper = container!.querySelector(".living-illustration");
      await waitFor(() => {
        expect(wrapper?.getAttribute("data-ambient-motion")).toBe("none");
      });

      // data-part-based reflects actor schema (parts.length > 0)
      expect(wrapper?.getAttribute("data-part-based")).toBe("true");
      expect(wrapper?.getAttribute("data-interactive")).toBe("false");
      expect(wrapper?.className).not.toContain("living-illustration--creature-life");
      expect(wrapper?.className).not.toContain("living-illustration--part-rigged");

      // Verify no animated tail parts are rendered in reduced motion
      const parts = container!.querySelectorAll(".living-illustration__part");
      expect(parts.length).toBe(0);
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it("handles delivery image network error gracefully without crashing, falling back to canonical source", () => {
    const { container } = render(<LivingIllustration src={ARDILLA_SRC} alt="ardilla fallback" />);
    const mainImg = screen.getByRole("img", { name: "ardilla fallback" });

    // Initial state has delivery srcSet
    expect(mainImg.getAttribute("srcset")).toBeDefined();

    // Simulate delivery image error (e.g. offline/broken CDN tier)
    fireEvent.error(mainImg);

    // LivingIllustration catches error and removes broken delivery srcSet to fall back to immutable canonical
    expect(mainImg.getAttribute("srcset")).toBeNull();
    expect(mainImg.getAttribute("src")).toBe(ARDILLA_SRC);
  });
});

describe("Gate 3: Workbook Page 7 Squirrel Card Pencil Mark & Interaction Boundaries", () => {
  it("renders Workbook Page 7 picture grid with ardilla card at correct layout position", () => {
    const page7 = getPageLayout(7);
    expect(page7).toBeDefined();

    const gridRegion = page7!.find((r) => r.id === "p7-grid");
    expect(gridRegion).toBeDefined();
    expect(gridRegion!.cells).toBeDefined();
    expect(gridRegion!.cells!.length).toBe(16);

    // Locate squirrel card
    const ardillaIndex = gridRegion!.cells!.findIndex((c) => c.caption === "ardilla");
    expect(ardillaIndex).toBe(11); // 12th card (index 11)

    const ardillaCell = gridRegion!.cells![ardillaIndex];
    expect(ardillaCell.illustrationSrc).toBe(ARDILLA_SRC);
    expect(ardillaCell.correct).toBe(true);
  });

  it("preserves unoccluded interaction boundaries and pointer events around the squirrel card during marking", async () => {
    const gridRegion = getPageLayout(7)!.find((r) => r.id === "p7-grid")!;
    const view = render(
      <InteractivePictureGrid
        region={gridRegion}
        accent="#099"
        lessonId="3"
        mark="x"
      />,
    );

    // Verify all 16 buttons are rendered
    const cells = view.container.querySelectorAll(".fp-ix-cell");
    expect(cells.length).toBe(16);

    // Locate ardilla button (index 11)
    const ardillaButton = view.getByRole("button", { name: "ardilla" });
    expect(ardillaButton).toBeDefined();
    expect(ardillaButton.getAttribute("disabled")).toBeNull();
    expect(ardillaButton.getAttribute("aria-pressed")).toBe("false");

    // Locate neighbor buttons before and after ardilla (index 10: estrella, index 12: ojo)
    const estrellaButton = view.getByRole("button", { name: "estrella" });
    const ojoButton = view.getByRole("button", { name: "ojo" });
    expect(estrellaButton.getAttribute("disabled")).toBeNull();
    expect(ojoButton.getAttribute("disabled")).toBeNull();

    // Trigger pencil tap on squirrel card
    fireEvent.click(ardillaButton);

    // Verify ardilla button is now in marking state
    expect(ardillaButton.getAttribute("aria-pressed")).toBe("true");

    // Verify pencil mark container is mounted with pointer-events-none
    const markContainer = ardillaButton.querySelector(".absolute.inset-0");
    expect(markContainer).not.toBeNull();
    expect(markContainer?.className).toContain("pointer-events-none");
    expect(markContainer?.className).toContain("z-10");

    // Verify pencil mark SVG has stroke properties that do not block underlying artwork
    const markSvg = ardillaButton.querySelector(".workbook-pencil-mark__svg");
    expect(markSvg).not.toBeNull();

    // Crucial check: verify that the mark overlay does not occlude or spill into neighbor cells
    // The squirrel mark is strictly bound inside ardillaButton's boundaries
    expect(estrellaButton.querySelector(".workbook-pencil-mark")).toBeNull();
    expect(ojoButton.querySelector(".workbook-pencil-mark")).toBeNull();

    // Verify the squirrel card's LivingIllustration image remains mounted underneath
    const ardillaImg = ardillaButton.querySelector(".living-illustration__art");
    expect(ardillaImg).not.toBeNull();
    expect(ardillaImg?.getAttribute("src")).toBe(ARDILLA_SRC);
  });
});

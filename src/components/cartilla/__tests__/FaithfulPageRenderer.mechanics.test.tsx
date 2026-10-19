/**
 * FaithfulPageRenderer wires Colorea → PaintCanvas, Dibuja → DibujaHost,
 * Encierra uses the approved pencil circle; Une uses direct pencil lines.
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { FaithfulPageRenderer } from "../FaithfulPageRenderer";
import { getPageLayout, type PageRegion } from "@/lib/book-faithful";

vi.mock("@/lib/gretel-bus", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/gretel-bus")>()),
  gretelEvent: vi.fn(),
}));

vi.mock("@/lib/student-session", () => ({
  recordEvent: vi.fn(),
}));

vi.mock("@/lib/gretel-speak", () => ({
  speakGretel: vi.fn(() => Promise.resolve()),
  cancelGretelSpeech: vi.fn(),
}));

vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));

vi.mock("@/lib/piano-audio", () => ({
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));

/** jsdom canvas stub so PaintCanvas mount does not hang under parallel workers. */
function installCanvasMock() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLCanvasElement.prototype as any).getContext = function () {
    return {
      setTransform: vi.fn(),
      scale: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      createRadialGradient: () => ({ addColorStop: vi.fn() }),
      fillRect: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1,
      })),
      putImageData: vi.fn(),
      canvas: this,
      globalCompositeOperation: "source-over",
      fillStyle: "#000",
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    };
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLCanvasElement.prototype as any).toDataURL = vi.fn(() => "data:image/png;base64,mock");
}

beforeEach(() => {
  installCanvasMock();
  vi.clearAllMocks();
});

afterEach(() => cleanup());

function paintRegions(): PageRegion[] {
  return [
    {
      id: "p-test-instr",
      regionType: "instruction",
      order: 0,
      fontRole: "body",
      text: "Colorea el dibujo de la rosa.",
    },
    {
      id: "p-test-paint",
      regionType: "paint-box",
      order: 1,
      fontRole: "body",
      illustrationSrc: "/cartilla/art/faithful/leccion-17-r/rosa.webp",
      caption: "rosa",
    },
  ];
}

function coloreaSlotRegions(): PageRegion[] {
  return [
    {
      id: "p-slot-instr",
      regionType: "instruction",
      order: 0,
      fontRole: "body",
      text: "Colorea el dibujo.",
    },
    {
      id: "p-slot-ill",
      regionType: "illustration-slot",
      order: 1,
      fontRole: "body",
      illustrationSrc: "/cartilla/art/faithful/leccion-17-r/rosa.webp",
      caption: "rosa",
    },
  ];
}

function dibujaRegions(): PageRegion[] {
  return [
    {
      id: "p-dibuja-instr",
      regionType: "instruction",
      order: 0,
      fontRole: "body",
      text: "Haz un dibujo que represente una palabra que comienza con m.",
    },
    {
      id: "p-dibuja-box",
      regionType: "draw-box",
      order: 1,
      fontRole: "body",
    },
  ];
}

function encierraRegions(): PageRegion[] {
  return [
    {
      id: "p-enc-instr",
      regionType: "instruction",
      order: 0,
      fontRole: "body",
      text: "Encierra en un círculo la sílaba correspondiente.",
    },
    {
      id: "p-enc-match",
      regionType: "syllable-match",
      order: 1,
      fontRole: "body",
      syllable: "ma",
      matchRows: [
        [
          { word: "mamá", correct: true },
          { word: "mapa", correct: true },
        ],
      ],
    },
  ];
}

describe("FaithfulPageRenderer mechanic hosts", () => {
  it("real source page 4 Marca con una x uses only wooden pencil X, never rope or old Comprobar", () => {
    const regions = getPageLayout(4);
    expect(regions).not.toBeNull();
    const { container } = render(
      <FaithfulPageRenderer pageNumber={4} lessonNumber={2} regions={regions ?? []} interactive />,
    );
    const target = container.querySelector<HTMLButtonElement>(".fp-ix-grid .fp-ix-cell");
    expect(target).not.toBeNull();
    fireEvent.click(target!);
    const mark = container.querySelector(".workbook-pencil-mark[data-mark-type='x']");
    expect(mark).not.toBeNull();
    expect(mark?.querySelectorAll(".workbook-pencil-mark__stroke")).toHaveLength(2);
    expect(container.querySelector(".fp-ix-cell__lasso")).toBeNull();
    expect(screen.queryByRole("button", { name: "Comprobar" })).toBeNull();
  });

  it("paint-box → PaintCanvas with Colorea verb (not tap)", () => {
    render(
      <FaithfulPageRenderer
        pageNumber={9991}
        lessonNumber={17}
        regions={paintRegions()}
        interactive
      />,
    );
    expect(screen.getByText("Colorea")).toBeTruthy();
    expect(screen.getByLabelText(/Colorea: pinta/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /mamá/i })).toBeNull();
  });

  it("Colorea + illustration-slot → PaintCanvas", () => {
    render(
      <FaithfulPageRenderer
        pageNumber={9992}
        lessonNumber={17}
        regions={coloreaSlotRegions()}
        interactive
      />,
    );
    expect(screen.getByLabelText(/Colorea: pinta/i)).toBeTruthy();
  });

  it("draw-box → DibujaHost (≥ dual-mode draw)", () => {
    const { container } = render(
      <FaithfulPageRenderer
        pageNumber={9993}
        lessonNumber={7}
        regions={dibujaRegions()}
        interactive
      />,
    );
    const host = container.querySelector(".am-dibuja");
    expect(host).toBeTruthy();
    expect(host?.getAttribute("data-verb")).toBe("Dibuja");
    expect(screen.getByRole("group", { name: /Modo de dibujo/i })).toBeTruthy();
  });

  it("Encierra syllable-match renders the source-syllable pencil circle, never rope", () => {
    const { container } = render(
      <FaithfulPageRenderer
        pageNumber={9994}
        lessonNumber={7}
        regions={encierraRegions()}
        interactive
      />,
    );
    expect(container.querySelector(".native-syllable")).toBeTruthy();
    expect(screen.getByRole("button", { name: "mamá" })).toBeTruthy();
    expect(container.querySelector(".am-lasso__rope-layer")).toBeNull();
  });
});

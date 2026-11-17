/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ContractPencilCursor } from "../ContractPencilCursor";
import {
  ERASER_CURSOR_SRC,
  ERASER_VIEWBOX,
  PENCIL_TIP_SRC,
  PENCIL_TIP_VIEWBOX,
} from "@/lib/cursor-mode";
import {
  holdEraser,
  holdManualEraser,
  isManualEraserActive,
  PENCIL_CONTRACT,
} from "@/lib/pencil-contract";
import { DirectPencilConnector, type PencilTarget } from "@/cartilla/interactions/PencilConnector";
import { WorkbookLetterTrace } from "@/components/cartilla/WorkbookLetterTrace";
import { DibujaHost } from "@/cartilla/interactions/DibujaHost";
import { ActivityContext } from "@/lib/activity-events";

vi.mock("@/lib/piano-audio", () => ({
  playNote: vi.fn(),
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));
vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
  onGretelEvent: vi.fn(() => () => {}),
  focusGretelActivity: vi.fn(),
  releaseGretelActivity: vi.fn(),
}));
vi.mock("@/lib/student-session", () => ({ recordEvent: vi.fn() }));

describe("HD uncropped pencil & eraser cursors and R2 hotspot mechanics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    document.documentElement.className = "";
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.documentElement.className = "";
  });

  it("ships uncropped resolution-independent vector SVGs for pencil and eraser with zero HB stamp", () => {
    const pencilSvg = readFileSync(
      resolve(process.cwd(), "public/cartilla/images/ui/owner-pencil-tip.svg"),
      "utf8",
    );
    const eraserSvg = readFileSync(
      resolve(process.cwd(), "public/cartilla/images/ui/owner-eraser.svg"),
      "utf8",
    );

    // Pure vector HD (no embedded raster WebP/PNG image, no HB/text stamp)
    expect(pencilSvg).not.toContain("<image");
    expect(pencilSvg).not.toContain("data:image/");
    expect(pencilSvg).not.toContain("<text");
    expect(pencilSvg).not.toContain("HB");
    expect(pencilSvg).toContain(`viewBox="0 0 ${PENCIL_TIP_VIEWBOX.width} ${PENCIL_TIP_VIEWBOX.height}"`);
    expect(pencilSvg).toContain('overflow="visible"');

    // Full pencil parts present in both tip and flipped back-eraser: graphite, cedar cone, yellow barrel, silver ferrule, pink eraser
    for (const part of ["op-lead", "op-wood", "op-lacq", "op-metal", "op-eraser"]) {
      expect(pencilSvg).toContain(part);
      expect(eraserSvg).toContain(part);
    }

    expect(eraserSvg).not.toContain("<image");
    expect(eraserSvg).not.toContain("<text");
    expect(eraserSvg).toContain(`viewBox="0 0 ${ERASER_VIEWBOX.width} ${ERASER_VIEWBOX.height}"`);
    expect(eraserSvg).toContain('overflow="visible"');
  });

  it("ContractPencilCursor positions at exact (0,0), excludes __navigation, and switches to HD eraser", () => {
    let rafCb: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCb = cb;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const { container } = render(
      <div className="native-lesson-viewer">
        <div className="native-lesson-viewer__content">
          <button type="button">Actividad</button>
        </div>
        <nav className="native-lesson-viewer__navigation">
          <button type="button">Siguiente</button>
        </nav>
        <ContractPencilCursor />
      </div>,
    );

    const cursor = document.querySelector<HTMLDivElement>('[data-testid="contract-pencil-cursor"]')!;
    expect(cursor).toBeTruthy();
    expect(cursor.dataset.tool).toBe("pencil");
    expect(cursor.dataset.pencilPose).toBe("hd-tip");
    expect(cursor.style.overflow).toBe("visible");
    expect(cursor.querySelector("img")?.getAttribute("src")).toBe(PENCIL_TIP_SRC);

    // Move inside activity content -> visible at exact (142.5, 218.0)
    const activityBtn = container.querySelector(".native-lesson-viewer__content button")!;
    fireEvent.pointerMove(activityBtn, { clientX: 142.5, clientY: 218 });
    act(() => {
      rafCb?.(16);
    });
    expect(cursor.dataset.visible).toBe("true");
    expect(cursor.style.transform).toBe("translate3d(142.5px, 218.0px, 0)");

    // Move over .native-lesson-viewer__navigation -> cursor hides so system pointer takes over
    const navBtn = container.querySelector(".native-lesson-viewer__navigation button")!;
    fireEvent.pointerMove(navBtn, { clientX: 400, clientY: 500 });
    act(() => {
      rafCb?.(32);
    });
    expect(cursor.dataset.visible).toBe("false");

    // Back over activity + activate manual eraser -> switches to HD eraser SVG
    fireEvent.pointerMove(activityBtn, { clientX: 160, clientY: 220 });
    let releaseManual!: () => void;
    act(() => {
      releaseManual = holdManualEraser();
      rafCb?.(48);
    });
    expect(cursor.dataset.visible).toBe("true");
    expect(cursor.dataset.tool).toBe("eraser");
    expect(cursor.dataset.pencilPose).toBe("hd-eraser");
    expect(cursor.querySelector("img")?.getAttribute("src")).toBe(ERASER_CURSOR_SRC);

    // Autonomous wrong-mark rub hides cursor overlay to maintain single-tool invariant
    let releaseAuto!: () => void;
    act(() => {
      releaseAuto = holdEraser();
      rafCb?.(64);
    });
    expect(cursor.dataset.visible).toBe("false");

    act(() => {
      releaseAuto();
      releaseManual();
      rafCb?.(80);
    });
    expect(cursor.dataset.visible).toBe("true");
    expect(cursor.dataset.tool).toBe("pencil");
  });

  it("PencilConnector renders HD uncropped eraser + 12 pink crumbs in contract erase and normalizes CSS zoom", () => {
    vi.useFakeTimers();
    const targets: PencilTarget[] = [
      { id: "abeja", label: "abeja", correct: true, example: true },
      { id: "arbol", label: "árbol", correct: true },
      { id: "oso", label: "oso", correct: false },
    ];
    const { container } = render(
      <div className="native-lesson-viewer">
        <DirectPencilConnector
          pageKey="zoom-crumbs-test"
          targets={targets}
          mode="mark"
          centerLabel="Aa"
          reducedMotion={false}
        />
      </div>,
    );

    const stage = container.querySelector<HTMLDivElement>(".am-direct-pencil__stage")!;
    const center = screen.getByRole("button", { name: "Vocal central Aa" });

    // Simulate zoom = 0.5: layout clientWidth=400, viewport rect.width=200
    Object.defineProperty(stage, "clientWidth", { configurable: true, value: 400 });
    Object.defineProperty(stage, "clientHeight", { configurable: true, value: 300 });
    vi.spyOn(stage, "getBoundingClientRect").mockReturnValue({
      left: 50,
      top: 40,
      width: 200,
      height: 150,
      right: 250,
      bottom: 190,
      x: 50,
      y: 40,
      toJSON: () => {},
    });

    fireEvent.pointerDown(center, { clientX: 100, clientY: 90, pointerId: 1, button: 0 });
    // Drag to viewport (200, 140) => unzoomed stage coords ((200-50)*2, (140-40)*2) = (300, 200)
    fireEvent.pointerMove(stage, { clientX: 200, clientY: 140, pointerId: 1, buttons: 1 });
    const dragCircle = container.querySelector(".am-direct-pencil__active-line circle");
    expect(Number(dragCircle?.getAttribute("cx"))).toBeCloseTo(300, 1);
    expect(Number(dragCircle?.getAttribute("cy"))).toBeCloseTo(200, 1);
    fireEvent.pointerCancel(stage);

    // Wrong answer -> 400ms charcoal hold -> 600ms red -> 3500ms HD eraser + 12 crumbs
    fireEvent.click(screen.getByRole("button", { name: "oso" }));
    act(() => vi.advanceTimersByTime(PENCIL_CONTRACT.holdMs + PENCIL_CONTRACT.redShowMs));
    expect(container.querySelector(".am-direct-pencil__eraser-shape")).toBeTruthy();
    expect(container.querySelectorAll(".workbook-pencil__crumbs > g")).toHaveLength(12);
    act(() => vi.advanceTimersByTime(PENCIL_CONTRACT.eraseMs));
    expect(container.querySelector(".am-direct-pencil__retry-group")).toBeNull();
  });

  it("WorkbookLetterTrace maps meet-letterboxed coordinates accurately and holds #3a3a38 for 400ms inside contract host", () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "matchMedia",
      vi.fn((q: string) => ({
        matches: q === "(pointer: coarse)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    const onEvent = vi.fn();
    const { container } = render(
      <div className="native-lesson-viewer">
        <ActivityContext.Provider
          value={{ activityId: "trace-zoom-hold", isolated: true, isCurrent: () => true, onEvent }}
        >
          <WorkbookLetterTrace modelText="A" />
        </ActivityContext.Provider>
      </div>,
    );

    const svg = container.querySelector<SVGSVGElement>(".fp-trace__svg")!;
    // Letterboxed container: width=200, height=120 for 100x120 viewBox -> unit=1, horizontal offset ox=50!
    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 120,
      right: 200,
      bottom: 120,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    (svg as unknown as { setPointerCapture: ReturnType<typeof vi.fn> }).setPointerCapture = vi.fn();

    // Letter A strokes: [50,20]->[35,60]->[20,100], [50,20]->[65,60]->[80,100], [32,68]->[50,68]->[68,68]
    // With ox=50, viewBox x=50 maps to clientX=100!
    fireEvent.pointerDown(svg, { clientX: 100, clientY: 20, pointerId: 1 });
    expect(container.querySelector(".fp-trace")?.getAttribute("data-status")).toBe("tracing");
    // Active stroke uses #3a3a38 charcoal
    const activeStroke = container.querySelector('.fp-trace__svg path[stroke="#3a3a38"]');
    expect(activeStroke).toBeTruthy();

    fireEvent.pointerMove(svg, { clientX: 85, clientY: 60, pointerId: 1 });
    fireEvent.pointerMove(svg, { clientX: 70, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(svg, { pointerId: 1 });

    // Stroke 1: bottom-right {80,100} -> {65,60} -> apex {50,20} (with ox=50 => 130 -> 115 -> 100)
    fireEvent.pointerDown(svg, { clientX: 130, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(svg, { clientX: 115, clientY: 60, pointerId: 1 });
    fireEvent.pointerMove(svg, { clientX: 100, clientY: 20, pointerId: 1 });
    fireEvent.pointerUp(svg, { pointerId: 1 });

    // Stroke 2: crossbar {30,65} -> {50,65} -> {70,65} (with ox=50 => 80 -> 100 -> 120)
    fireEvent.pointerDown(svg, { clientX: 80, clientY: 65, pointerId: 1 });
    fireEvent.pointerMove(svg, { clientX: 100, clientY: 65, pointerId: 1 });
    fireEvent.pointerMove(svg, { clientX: 120, clientY: 65, pointerId: 1 });

    // 400ms charcoal hold before settling to done
    expect(container.querySelector(".fp-trace")?.getAttribute("data-status")).toBe("holding");
    expect(onEvent).not.toHaveBeenCalledWith("activity:complete", undefined);
    act(() => vi.advanceTimersByTime(PENCIL_CONTRACT.holdMs));
    expect(container.querySelector(".fp-trace")?.getAttribute("data-status")).toBe("done");
    expect(onEvent).toHaveBeenCalledWith("activity:complete", undefined);
  });

  it("DibujaHost defaults to #3a3a38 charcoal, normalizes canvas zoom, and syncs manual eraser cursor", () => {
    const moveTo = vi.fn();
    const lineTo = vi.fn();
    let capturedStroke = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (HTMLCanvasElement.prototype as any).getContext = function () {
      return {
        setTransform: vi.fn(),
        scale: vi.fn(),
        beginPath: vi.fn(),
        moveTo,
        lineTo,
        stroke: vi.fn(function (this: { strokeStyle: string }) {
          capturedStroke = this.strokeStyle;
        }),
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(16), width: 2, height: 2 })),
        putImageData: vi.fn(),
        globalCompositeOperation: "source-over",
        strokeStyle: "#000",
        lineWidth: 4,
        lineCap: "round",
        lineJoin: "round",
        globalAlpha: 1,
        imageSmoothingEnabled: true,
      };
    };

    const { container, unmount } = render(
      <DibujaHost pageKey="zoom-dibuja-test" initialMode="draw" />,
    );
    const canvas = container.querySelector<HTMLCanvasElement>(".am-dibuja__canvas")!;
    // Simulate dpr=1, logical width=400, zoomed rect.width=200 (zoom=0.5)
    Object.defineProperty(canvas, "width", { configurable: true, value: 400 });
    Object.defineProperty(canvas, "height", { configurable: true, value: 240 });
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      left: 20,
      top: 10,
      width: 200,
      height: 120,
      right: 220,
      bottom: 130,
      x: 20,
      y: 10,
      toJSON: () => {},
    });

    fireEvent.pointerDown(canvas, { clientX: 70, clientY: 40, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 120, clientY: 70, pointerId: 1 });
    // ((70-20)*2, (40-10)*2) = (100, 60) -> ((120-20)*2, (70-10)*2) = (200, 120)
    expect(moveTo).toHaveBeenCalledWith(100, 60);
    expect(lineTo).toHaveBeenCalledWith(200, 120);
    expect(capturedStroke).toBe("#3a3a38");

    // Toggle eraser -> activates manual eraser cursor; unmount releases it cleanly
    const eraserBtn = screen.getByRole("button", { name: "Borrador de goma" });
    expect(isManualEraserActive()).toBe(false);
    fireEvent.click(eraserBtn);
    expect(isManualEraserActive()).toBe(true);
    unmount();
    expect(isManualEraserActive()).toBe(false);
  });
});

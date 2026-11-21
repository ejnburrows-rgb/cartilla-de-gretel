/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ContractPencilCursor } from "../ContractPencilCursor";
import {
  contractEase,
  contractEraseAt,
  contractPointAlong,
  endEraseFlight,
  endTipFlight,
  eraseStrokeSchedule,
  getEraseFlight,
  getTipFlight,
  holdEraser,
  holdManualEraser,
  isEraserActive,
  isManualEraserActive,
  markToScreen,
  PENCIL_CONTRACT,
  startEraseFlight,
  startTipFlight,
} from "@/lib/pencil-contract";
import { DirectPencilConnector, type PencilTarget } from "@/cartilla/interactions/PencilConnector";
import { WorkbookLetterTrace } from "@/components/cartilla/WorkbookLetterTrace";
import { WorkbookPencilMark } from "@/components/cartilla/WorkbookPencilMark";
import { DrawBoxCanvas } from "@/components/cartilla/DrawBoxCanvas";
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

  it("renders the owner-approved 74ccee59 photographic pencil tip (600×497, point up-left at 0,0) with seamless off-screen barrel extension in pencil mode", () => {
    render(
      <div className="native-lesson-viewer">
        <ContractPencilCursor />
      </div>,
    );
    const cursor = document.querySelector<HTMLDivElement>('[data-testid="contract-pencil-cursor"]')!;
    const photoTip = cursor.querySelector<SVGSVGElement>('[data-testid="contract-pencil-photo-tip"]')!;
    const photoHead = cursor.querySelector<SVGImageElement>('[data-testid="contract-pencil-photo-head"]')!;
    const barrelExt = cursor.querySelector<SVGRectElement>('[data-testid="contract-pencil-barrel-extension"]');
    const eraserSvg = cursor.querySelector("svg.contract-pencil-cursor__svg")!;
    expect(photoTip).toBeTruthy();
    expect(photoTip.getAttribute("viewBox")).toBe("0 0 600 497");
    expect(photoTip.getAttribute("overflow")).toBe("visible");
    expect(photoTip.getAttribute("width")).toBe("252");
    expect(photoTip.getAttribute("height")).toBe("209");
    expect(photoTip.style.display).toBe("block");
    expect(photoTip.style.transformOrigin).toBe("0px 0px");
    expect(photoHead).toBeTruthy();
    expect(photoHead.getAttribute("href")?.startsWith("data:image/webp;base64,")).toBe(true);
    expect(photoHead.getAttribute("clip-path")).toMatch(/^url\(#owner-pencil-.*-head-clip\)$/);
    expect(barrelExt).toBeTruthy();
    expect(Number(barrelExt?.getAttribute("width"))).toBeGreaterThanOrEqual(8000);
    expect(eraserSvg).toBeTruthy();
    expect(eraserSvg.getAttribute("overflow")).toBe("visible");
  });

  it("computes smooth 0° -> 180° -> 0° back-eraser flip and scrubbing via contractEraseAt", () => {
    const flight = {
      points: [
        [10, 10] as [number, number],
        [90, 90] as [number, number],
      ],
      enterMs: 450,
      rubMs: 2600,
      liftMs: 450,
      totalMs: 3500,
    };
    const start = contractEraseAt(flight, 0);
    expect(start.phase).toBe("enter");
    expect(start.flipDeg).toBe(0);
    expect(start.markPt).toEqual([90, 90]);

    const midEnter = contractEraseAt(flight, 225);
    expect(midEnter.phase).toBe("enter");
    expect(midEnter.flipDeg).toBeCloseTo(90, 1);
    expect(midEnter.lift).toBeGreaterThan(0.9);

    const midRub = contractEraseAt(flight, 450 + 1300);
    expect(midRub.phase).toBe("rub");
    expect(midRub.flipDeg).toBe(180);
    expect(midRub.lift).toBe(0);
    expect(midRub.markPt[0]).toBeCloseTo(50, 1);
    expect(midRub.markPt[1]).toBeCloseTo(50, 1);

    const end = contractEraseAt(flight, 3500);
    expect(end.phase).toBe("lift");
    expect(end.flipDeg).toBe(0);
    expect(end.markPt).toEqual([10, 10]);
  });

  it("ContractPencilCursor positions at exact (0,0), excludes __navigation, flips 180° for manual & auto erase", () => {
    let rafCb: FrameRequestCallback | null = null;
    let fakeNow = 1000;
    vi.spyOn(performance, "now").mockImplementation(() => fakeNow);
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
    const flipGroup = cursor.querySelector<SVGGElement>('[data-testid="contract-pencil-flip"]')!;
    expect(cursor).toBeTruthy();
    expect(cursor.dataset.tool).toBe("pencil");
    expect(cursor.dataset.pencilPose).toBe("hd-tip");
    expect(cursor.style.overflow).toBe("visible");
    expect(cursor.querySelector('[data-testid="contract-pencil-photo-tip"]')).toBeTruthy();
    expect(cursor.querySelector('[data-testid="contract-pencil-barrel-extension"]')).toBeTruthy();
    expect(cursor.querySelector(".workbook-pencil__shape")).toBeTruthy();

    // Move inside activity content -> visible at exact (142.5, 218.0)
    const activityBtn = container.querySelector(".native-lesson-viewer__content button")!;
    fireEvent.pointerMove(activityBtn, { clientX: 142.5, clientY: 218 });
    act(() => {
      fakeNow += 16;
      rafCb?.(fakeNow);
    });
    expect(cursor.dataset.visible).toBe("true");
    expect(cursor.style.transform).toBe("translate3d(142.5px, 218.0px, 0)");

    // Move over .native-lesson-viewer__navigation -> cursor hides so system pointer takes over
    const navBtn = container.querySelector(".native-lesson-viewer__navigation button")!;
    fireEvent.pointerMove(navBtn, { clientX: 400, clientY: 500 });
    act(() => {
      fakeNow += 16;
      rafCb?.(fakeNow);
    });
    expect(cursor.dataset.visible).toBe("false");

    // Back over activity + activate manual eraser -> SAME single pencil flips 180° onto back pink eraser
    fireEvent.pointerMove(activityBtn, { clientX: 160, clientY: 220 });
    let releaseManual!: () => void;
    act(() => {
      releaseManual = holdManualEraser();
      fakeNow += 16;
      rafCb?.(fakeNow);
      fakeNow += 300;
      rafCb?.(fakeNow);
    });
    expect(cursor.dataset.visible).toBe("true");
    expect(cursor.dataset.tool).toBe("eraser");
    expect(cursor.dataset.pencilPose).toBe("hd-eraser");
    expect(cursor.querySelector(".workbook-pencil--eraser .workbook-pencil__eraser-hd")).toBeTruthy();
    expect(flipGroup.getAttribute("transform")).toContain("rotate(180.00 0 -839.75)");

    // Autonomous wrong-mark erase flight keeps the SAME single pencil visible and flips 180° to rub
    let eraseId!: symbol;
    act(() => {
      releaseManual();
      eraseId = startEraseFlight({
        el: activityBtn as HTMLElement,
        height: 100,
        points: [
          [10, 10],
          [90, 90],
        ],
        enterMs: 450,
        rubMs: 2600,
        liftMs: 450,
        totalMs: 3500,
      });
      fakeNow += 600;
      rafCb?.(fakeNow);
    });
    expect(isEraserActive()).toBe(true);
    expect(cursor.dataset.visible).toBe("true");
    expect(cursor.dataset.tool).toBe("eraser");
    expect(cursor.dataset.pencilPose).toBe("hd-eraser");
    expect(flipGroup.getAttribute("transform")).toContain("rotate(180.00 0 -839.75)");

    act(() => {
      endEraseFlight(eraseId);
    });

    // External inline eraser (e.g. PencilConnector) hides cursor overlay to maintain single-tool invariant
    let releaseAuto!: () => void;
    act(() => {
      releaseAuto = holdEraser();
      fakeNow += 16;
      rafCb?.(fakeNow);
    });
    expect(cursor.dataset.visible).toBe("false");

    act(() => {
      releaseAuto();
      fakeNow += 300;
      rafCb?.(fakeNow);
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

  it("rubs multi-stroke X marks sequentially (stroke 0 -> hop -> stroke 1) via contractEraseAt", () => {
    const diag2: [number, number][] = [
      [80, 20],
      [20, 80],
    ];
    const diag1: [number, number][] = [
      [20, 20],
      [80, 80],
    ];
    const flight = {
      points: diag2,
      strokes: [diag2, diag1],
      enterMs: 450,
      rubMs: 2600,
      liftMs: 450,
      totalMs: 3500,
    };
    const [win0, win1] = eraseStrokeSchedule(2, 450, 2600);
    expect(win0.begin).toBe(450);
    expect(win1.begin).toBeGreaterThan(win0.begin + win0.dur);

    // Mid first erased stroke (diag2 rubbed from [20,80] -> [80,20])
    const mid0 = contractEraseAt(flight, win0.begin + win0.dur / 2);
    expect(mid0.phase).toBe("rub");
    expect(mid0.flipDeg).toBe(180);
    expect(mid0.lift).toBe(0);
    expect(mid0.markPt[0]).toBeCloseTo(50, 1);
    expect(mid0.markPt[1]).toBeCloseTo(50, 1);

    // Mid hop between diag2 start [80,20] and diag1 end [80,80]
    const hopMid = contractEraseAt(flight, (win0.begin + win0.dur + win1.begin) / 2);
    expect(hopMid.phase).toBe("rub");
    expect(hopMid.flipDeg).toBe(180);
    expect(hopMid.lift).toBeGreaterThan(0.3);
    expect(hopMid.scrubPx).toEqual([0, 0]);
    expect(hopMid.markPt[0]).toBeCloseTo(80, 1);
    expect(hopMid.markPt[1]).toBeCloseTo(50, 1);

    // End of lift returns to diag1 start [20,20] and 0° graphite tip
    const end = contractEraseAt(flight, 3500);
    expect(end.phase).toBe("lift");
    expect(end.flipDeg).toBe(0);
    expect(end.markPt).toEqual([20, 20]);
  });

  it("holds tip poised after lastEnd without teleporting to stroke[0] and cleans up detached erase flights", () => {
    let rafCb: FrameRequestCallback | null = null;
    let fakeNow = 2000;
    vi.spyOn(performance, "now").mockImplementation(() => fakeNow);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCb = cb;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const { container } = render(
      <div className="native-lesson-viewer">
        <div className="native-lesson-viewer__content">
          <div data-testid="mark-host" />
        </div>
        <ContractPencilCursor />
      </div>,
    );

    const markHost = container.querySelector<HTMLDivElement>('[data-testid="mark-host"]')!;
    vi.spyOn(markHost, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      right: 200,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON: () => {},
    });
    const cursor = document.querySelector<HTMLDivElement>('[data-testid="contract-pencil-cursor"]')!;

    let tipId!: symbol;
    act(() => {
      tipId = startTipFlight({
        el: markHost,
        height: 100,
        strokes: [
          {
            points: [
              [10, 10],
              [90, 90],
            ],
            begin: 300,
            dur: 800,
          },
        ],
      });
      // Advance well past lastEnd (300 + 800 = 1100ms) -> poised near [90,90] => screen (190,190) + (+10,-10) = (200,180)
      fakeNow += 1500;
      rafCb?.(fakeNow);
    });
    expect(cursor.dataset.visible).toBe("true");
    // Must stay poised near stroke end (200, 180), NEVER teleporting back to stroke[0] (110, 110)
    expect(cursor.style.transform).toBe("translate3d(200.0px, 180.0px, 0)");

    act(() => {
      endTipFlight(tipId);
    });

    // Detached erase flight element is cleaned up automatically so cursor never sticks in eraser mode
    const detached = document.createElement("div");
    act(() => {
      startEraseFlight({
        el: detached,
        height: 100,
        points: [
          [10, 10],
          [90, 90],
        ],
        enterMs: 450,
        rubMs: 2600,
        liftMs: 450,
        totalMs: 3500,
      });
      fakeNow += 16;
      rafCb?.(fakeNow);
    });
    expect(getEraseFlight()).toBeNull();
    expect(cursor.dataset.tool).toBe("pencil");
  });

  it("DrawBoxCanvas toggles manual eraser mode (holdManualEraser + destination-out) and releases cleanly", () => {
    let composite = "source-over";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (HTMLCanvasElement.prototype as any).getContext = function () {
      return {
        scale: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(function (this: { globalCompositeOperation: string }) {
          composite = this.globalCompositeOperation;
        }),
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        globalCompositeOperation: "source-over",
        strokeStyle: "#000",
        lineWidth: 4,
        lineCap: "round",
        lineJoin: "round",
      };
    };

    const { container, unmount } = render(<DrawBoxCanvas regionId="eraser-test" />);
    const canvas = container.querySelector<HTMLCanvasElement>("canvas")!;
    canvas.setPointerCapture = vi.fn();
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
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

    const eraserBtn = screen.getByRole("button", { name: "Borrador de goma" });
    expect(isManualEraserActive()).toBe(false);
    fireEvent.click(eraserBtn);
    expect(isManualEraserActive()).toBe(true);
    expect(eraserBtn.getAttribute("aria-pressed")).toBe("true");

    fireEvent.pointerDown(canvas, { clientX: 20, clientY: 20, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 60, clientY: 60, pointerId: 1 });
    fireEvent.pointerUp(canvas);
    expect(composite).toBe("destination-out");

    // Selecting a crayon color exits manual eraser mode
    fireEvent.click(screen.getByRole("button", { name: "Color #dc2626" }));
    expect(isManualEraserActive()).toBe(false);

    // Re-enable eraser and unmount -> releases cleanly
    fireEvent.click(eraserBtn);
    expect(isManualEraserActive()).toBe(true);
    unmount();
    expect(isManualEraserActive()).toBe(false);
  });

  it("WorkbookPencilMark avoids non-scaling-stroke + pathLength dashes and queues consecutive wrong X marks cleanly", () => {
    vi.useFakeTimers();
    const retry1 = vi.fn();
    const retry2 = vi.fn();
    const { container } = render(
      <div className="native-lesson-viewer">
        <WorkbookPencilMark markType="x" isCorrect={false} itemId="x-1" onRetry={retry1} />
        <WorkbookPencilMark markType="x" isCorrect={false} itemId="x-2" onRetry={retry2} />
      </div>,
    );

    // Regression lock: non-scaling-stroke ContractSegment paths must NEVER carry pathLength/strokeDasharray
    const segPaths = [...container.querySelectorAll(".workbook-pencil-mark__contract-strokes path")];
    expect(segPaths).toHaveLength(28);
    for (const p of segPaths) {
      expect(p.getAttribute("pathLength")).toBeNull();
      expect(p.getAttribute("stroke-dasharray")).toBeNull();
    }

    const xDrawMs = PENCIL_CONTRACT.approachMs + 2 * PENCIL_CONTRACT.crossStrokeMs + PENCIL_CONTRACT.hopMs;
    act(() => vi.advanceTimersByTime(xDrawMs + PENCIL_CONTRACT.holdMs));
    act(() => vi.advanceTimersByTime(PENCIL_CONTRACT.redShowMs));
    // First wrong X is now rubbing with 2 distinct sequential mask windows and 12 crumbs
    const rubMasks = [...container.querySelectorAll('mask[id$="-rub"] path animate')];
    expect(rubMasks).toHaveLength(2);
    expect(rubMasks[0].getAttribute("keyTimes")).not.toBe(rubMasks[1].getAttribute("keyTimes"));
    expect(container.querySelectorAll(".workbook-pencil__crumbs > g")).toHaveLength(12);

    // Finish first wrong X -> second wrong X automatically takes turn and completes cleanly
    act(() => vi.advanceTimersByTime(PENCIL_CONTRACT.eraseMs));
    expect(retry1).toHaveBeenCalledTimes(1);
    expect(retry2).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(xDrawMs + PENCIL_CONTRACT.holdMs));
    act(() => vi.advanceTimersByTime(PENCIL_CONTRACT.redShowMs));
    act(() => vi.advanceTimersByTime(PENCIL_CONTRACT.eraseMs));
    expect(retry2).toHaveBeenCalledTimes(1);
    expect(getEraseFlight()).toBeNull();
  });

  it("synchronizes the @image1 graphite tip (0,0) with the butt-capped reveal mask at 0.0px offset for both Circle and X marks", () => {
    const rafCallbacks = new Map<number, FrameRequestCallback>();
    let nextRafId = 1;
    let fakeNow = 5000;
    vi.spyOn(performance, "now").mockImplementation(() => fakeNow);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      const id = nextRafId++;
      rafCallbacks.set(id, cb);
      return id;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
      rafCallbacks.delete(id);
    });
    const stepFrame = (dt: number) => {
      fakeNow += dt;
      const cbs = [...rafCallbacks.values()];
      rafCallbacks.clear();
      for (const cb of cbs) cb(fakeNow);
    };

    for (const markType of ["circle", "x"] as const) {
      cleanup();
      rafCallbacks.clear();
      const { container } = render(
        <div className="native-lesson-viewer">
          <WorkbookPencilMark markType={markType} round isCorrect itemId={`sync-${markType}`} />
          <ContractPencilCursor />
        </div>,
      );
      const markEl = container.querySelector<HTMLDivElement>(".workbook-pencil-mark")!;
      vi.spyOn(markEl, "getBoundingClientRect").mockReturnValue({
        left: 100,
        top: 100,
        width: 200,
        height: 200,
        right: 300,
        bottom: 300,
        x: 100,
        y: 100,
        toJSON: () => {},
      });
      const cursor = document.querySelector<HTMLDivElement>('[data-testid="contract-pencil-cursor"]')!;
      const flight = getTipFlight()!;
      expect(flight).toBeTruthy();

      for (let si = 0; si < flight.strokes.length; si++) {
        const s = flight.strokes[si];
        for (const frac of [0, 0.25, 0.5, 0.75, 1]) {
          const targetMs = s.begin + s.dur * frac;
          stepFrame(targetMs - (fakeNow - flight.start));
          const p = contractEase(frac);
          const expectedPt = markToScreen(
            markEl,
            flight.height,
            contractPointAlong(s.points, p),
          );
          expect(cursor.style.transform).toBe(
            `translate3d(${expectedPt[0].toFixed(1)}px, ${expectedPt[1].toFixed(1)}px, 0)`,
          );
          const maskPath = markEl.querySelector<SVGPathElement>(
            `[data-contract-mask-path="${si}"]`,
          )!;
          expect(maskPath.getAttribute("stroke-linecap")).toBe("butt");
          expect(Number(maskPath.getAttribute("stroke-dashoffset"))).toBeCloseTo(
            (1 - p) * 100,
            2,
          );
        }
      }
    }
  });
});

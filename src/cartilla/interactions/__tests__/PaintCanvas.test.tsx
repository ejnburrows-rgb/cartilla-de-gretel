/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup, screen } from "@testing-library/react";
import { PaintCanvas } from "../PaintCanvas";

vi.mock("@/lib/piano-audio", () => ({
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));
vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
}));
vi.mock("@/lib/student-session", () => ({
  recordEvent: vi.fn(),
}));
vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

import { gretelEvent } from "@/lib/gretel-bus";
import { recordEvent } from "@/lib/student-session";

// Canvas 2d mock for jsdom
function installCanvasMock() {
  const store = new Map<HTMLCanvasElement, ImageData>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLCanvasElement.prototype as any).getContext = function (
    this: HTMLCanvasElement,
    type: string,
  ) {
    if (type !== "2d") return null;
    const canvas = this;
    const ctx = {
      setTransform: vi.fn(),
      scale: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      createRadialGradient: () => ({
        addColorStop: vi.fn(),
      }),
      fillRect: vi.fn(),
      getImageData: vi.fn((x: number, y: number, w: number, h: number) => {
        const key = canvas;
        if (!store.has(key)) {
          // Opaque alpha so mask/stay-in-lines allows painting in jsdom
          const data = new Uint8ClampedArray(Math.max(4, w * h * 4));
          for (let i = 0; i < data.length; i += 4) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 255;
          }
          store.set(key, {
            data,
            width: w,
            height: h,
            colorSpace: "srgb",
          } as ImageData);
        }
        return store.get(key)!;
      }),
      putImageData: vi.fn(),
      canvas,
      globalCompositeOperation: "source-over",
      fillStyle: "#000",
      strokeStyle: "#000",
      lineWidth: 1,
      lineCap: "round",
      lineJoin: "round",
      globalAlpha: 1,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    };
    return ctx;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLCanvasElement.prototype as any).toDataURL = vi.fn(() => "data:image/png;base64,mock");
}

describe("PaintCanvas — Colorea freehand", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    installCanvasMock();
    const mem: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem[k] ?? null,
      setItem: (k: string, v: string) => {
        mem[k] = v;
      },
      removeItem: (k: string) => {
        delete mem[k];
      },
      clear: () => {
        for (const k of Object.keys(mem)) delete mem[k];
      },
    });
  });
  afterEach(() => cleanup());

  it("renders without crashing with Colorea label", () => {
    render(<PaintCanvas pageKey="test-paint-1" verbLabel="Colorea" lessonId="2" />);
    expect(screen.getByText("Colorea")).toBeTruthy();
    expect(screen.getByLabelText(/Colorea: pinta/i)).toBeTruthy();
  });

  it("pointer painting produces strokes and enables Listo", () => {
    render(<PaintCanvas pageKey="test-paint-2" verbLabel="Colorea" lessonId="2" />);
    const canvas = screen.getByLabelText(/Colorea: pinta/i);
    fireEvent.pointerDown(canvas, { clientX: 20, clientY: 20, pointerId: 1, buttons: 1 });
    fireEvent.pointerMove(canvas, { clientX: 40, clientY: 35, pointerId: 1, buttons: 1 });
    fireEvent.pointerUp(canvas, { clientX: 40, clientY: 35, pointerId: 1 });
    const listo = screen.getByRole("button", { name: /Listo/i });
    expect((listo as HTMLButtonElement).disabled).toBe(false);
  });

  it("eraser tool toggles and clear confirm works", () => {
    render(<PaintCanvas pageKey="test-paint-3" verbLabel="Colorea" />);
    const canvas = screen.getByLabelText(/Colorea: pinta/i);
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1, buttons: 1 });
    fireEvent.pointerUp(canvas, { pointerId: 1 });
    fireEvent.click(screen.getByLabelText("Borrador"));
    expect(screen.getByLabelText("Borrador").getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByLabelText("Borrar todo"));
    expect(screen.getByText("¿Borrar todo el color?")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Sí, borrar/i }));
    expect(screen.queryByText("¿Borrar todo el color?")).toBeNull();
  });

  it("finish records progress and gretel correct", () => {
    render(<PaintCanvas pageKey="test-paint-4" verbLabel="Colorea" lessonId="7" />);
    const canvas = screen.getByLabelText(/Colorea: pinta/i);
    fireEvent.pointerDown(canvas, { clientX: 15, clientY: 15, pointerId: 1, buttons: 1 });
    fireEvent.pointerMove(canvas, { clientX: 50, clientY: 50, pointerId: 1, buttons: 1 });
    fireEvent.pointerUp(canvas, { pointerId: 1 });
    fireEvent.click(screen.getByRole("button", { name: /Listo/i }));
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct");
    expect(recordEvent).toHaveBeenCalled();
    expect(screen.getByText(/Qué bonito quedó/i)).toBeTruthy();
  });

  it("persists paint snapshot to localStorage", () => {
    render(<PaintCanvas pageKey="test-paint-persist" verbLabel="Colorea" />);
    const canvas = screen.getByLabelText(/Colorea: pinta/i);
    fireEvent.pointerDown(canvas, { clientX: 12, clientY: 12, pointerId: 1, buttons: 1 });
    fireEvent.pointerUp(canvas, { pointerId: 1 });
    const raw = localStorage.getItem("cartilla.activity.canvas.v1:paint:test-paint-persist");
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).dataUrl).toContain("data:image");
  });
});

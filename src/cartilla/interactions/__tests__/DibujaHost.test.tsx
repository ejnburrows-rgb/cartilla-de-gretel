/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup, screen } from "@testing-library/react";
import { DibujaHost } from "../DibujaHost";

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

import { playCorrectChord, playWrongBuzz } from "@/lib/piano-audio";
import { gretelEvent } from "@/lib/gretel-bus";

const picks = [
  {
    id: "oso",
    caption: "oso",
    illustrationSrc: "/cartilla/art/faithful/vocal-o/oso.webp",
    correct: true,
  },
  {
    id: "ala",
    caption: "ala",
    illustrationSrc: "/cartilla/art/faithful/vocal-a/alas.webp",
    correct: false,
  },
  {
    id: "uva",
    caption: "uva",
    illustrationSrc: "/cartilla/art/faithful/vocal-u/uvas.webp",
    correct: false,
  },
];

function installCanvasMock() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLCanvasElement.prototype as any).getContext = function () {
    return {
      setTransform: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(16),
        width: 2,
        height: 2,
      })),
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLCanvasElement.prototype as any).toDataURL = vi.fn(() => "data:image/png;base64,dibuja");
}

describe("DibujaHost — dual mode", () => {
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

  it("fine-pointer default is pick mode", () => {
    render(<DibujaHost pageKey="d1" pickOptions={picks} initialMode="pick" lessonId="2" />);
    expect(screen.getByRole("listbox", { name: /Elige el dibujo/i })).toBeTruthy();
    expect(screen.getByText("Dibuja")).toBeTruthy();
  });

  it("touch path can default to draw mode", () => {
    render(<DibujaHost pageKey="d2" pickOptions={picks} initialMode="draw" lessonId="2" />);
    expect(screen.getByLabelText(/Área para dibujar/i)).toBeTruthy();
  });

  it("toggle switches both ways", () => {
    render(<DibujaHost pageKey="d3" pickOptions={picks} initialMode="draw" lessonId="2" />);
    fireEvent.click(screen.getByRole("button", { name: /Elegir el dibujo/i }));
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Dibujar/i }));
    expect(screen.getByLabelText(/Área para dibujar/i)).toBeTruthy();
  });

  it("pick mode grades correct and wrong", () => {
    render(<DibujaHost pageKey="d4" pickOptions={picks} initialMode="pick" lessonId="2" />);
    fireEvent.click(screen.getByRole("option", { name: /ala/i }));
    expect(playWrongBuzz).toHaveBeenCalled();
    expect(gretelEvent).toHaveBeenCalledWith("answer:wrong");
    expect(screen.getByText(/Inténtalo de nuevo/i)).toBeTruthy();

    // after wrong flash clears, pick correct
    fireEvent.click(screen.getByRole("option", { name: /oso/i }));
    expect(playCorrectChord).toHaveBeenCalled();
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct");
  });

  it("draw mode completes without requiring a correct drawing", () => {
    render(<DibujaHost pageKey="d5" pickOptions={picks} initialMode="draw" lessonId="2" />);
    const canvas = screen.getByLabelText(/Área para dibujar/i);
    // Simulate enough points for non-trivial stroke
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1, buttons: 1 });
    for (let i = 0; i < 20; i++) {
      fireEvent.pointerMove(canvas, {
        clientX: 10 + i * 3,
        clientY: 10 + i * 2,
        pointerId: 1,
        buttons: 1,
      });
    }
    fireEvent.pointerUp(canvas, { pointerId: 1 });
    const listo = screen.getByRole("button", { name: /Listo/i });
    expect((listo as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(listo);
    expect(playCorrectChord).toHaveBeenCalled();
    expect(screen.getByText(/Qué lindo dibujo/i)).toBeTruthy();
  });
});

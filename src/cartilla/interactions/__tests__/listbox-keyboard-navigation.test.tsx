/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup, screen, act } from "@testing-library/react";
import { DibujaHost } from "../DibujaHost";
import { PaintCanvas } from "../PaintCanvas";
import { NativeLessonViewer } from "@/components/StudentBook/NativeLessonViewer";

vi.mock("@/lib/piano-audio", () => ({
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));
vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
  onGretelEvent: vi.fn(() => () => {}),
}));
vi.mock("@/lib/student-session", () => ({
  recordEvent: vi.fn(),
}));
vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

import { playCorrectChord } from "@/lib/piano-audio";

const picks = [
  { id: "oso", caption: "oso", correct: true },
  { id: "ala", caption: "ala", correct: false },
  { id: "uva", caption: "uva", correct: false },
];

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
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      createRadialGradient: () => ({ addColorStop: vi.fn() }),
      fillRect: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(16),
        width: 2,
        height: 2,
      })),
      putImageData: vi.fn(),
      globalCompositeOperation: "source-over",
      fillStyle: "#000",
      strokeStyle: "#000",
      lineWidth: 1,
      lineCap: "round",
      lineJoin: "round",
      globalAlpha: 1,
      imageSmoothingEnabled: true,
    };
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLCanvasElement.prototype as any).toDataURL = vi.fn(() => "data:image/png;base64,mock");
}

describe("Listbox Keyboard Navigation & Page Turn Prevention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    installCanvasMock();
  });
  afterEach(() => cleanup());

  describe("DibujaHost keyboard navigation", () => {
    it("navigates pick options with ArrowRight, ArrowLeft, Home, End and wraps around", () => {
      render(<DibujaHost pageKey="kb-dibuja-nav" pickOptions={picks} initialMode="pick" />);
      const options = screen.getAllByRole("option");
      expect(options.length).toBe(3);

      options[0].focus();
      expect(document.activeElement).toBe(options[0]);

      // ArrowRight -> options[1]
      act(() => {
        const ev = new KeyboardEvent("keydown", {
          key: "ArrowRight",
          bubbles: true,
          cancelable: true,
        });
        options[0].dispatchEvent(ev);
        expect(ev.defaultPrevented).toBe(true);
      });
      expect(document.activeElement).toBe(options[1]);

      // ArrowRight -> options[2]
      act(() => {
        const ev = new KeyboardEvent("keydown", {
          key: "ArrowRight",
          bubbles: true,
          cancelable: true,
        });
        options[1].dispatchEvent(ev);
        expect(ev.defaultPrevented).toBe(true);
      });
      expect(document.activeElement).toBe(options[2]);

      // ArrowRight -> options[0] (wrap-around)
      act(() => {
        const ev = new KeyboardEvent("keydown", {
          key: "ArrowRight",
          bubbles: true,
          cancelable: true,
        });
        options[2].dispatchEvent(ev);
        expect(ev.defaultPrevented).toBe(true);
      });
      expect(document.activeElement).toBe(options[0]);

      // ArrowLeft -> options[2] (wrap-around backwards)
      act(() => {
        const ev = new KeyboardEvent("keydown", {
          key: "ArrowLeft",
          bubbles: true,
          cancelable: true,
        });
        options[0].dispatchEvent(ev);
        expect(ev.defaultPrevented).toBe(true);
      });
      expect(document.activeElement).toBe(options[2]);

      // Home -> options[0]
      act(() => {
        const ev = new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true });
        options[2].dispatchEvent(ev);
        expect(ev.defaultPrevented).toBe(true);
      });
      expect(document.activeElement).toBe(options[0]);

      // End -> options[2]
      act(() => {
        const ev = new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true });
        options[0].dispatchEvent(ev);
        expect(ev.defaultPrevented).toBe(true);
      });
      expect(document.activeElement).toBe(options[2]);
    });

    it("pressing Arrow keys moves focus without triggering option grading", () => {
      render(
        <DibujaHost pageKey="kb-dibuja-no-auto-submit" pickOptions={picks} initialMode="pick" />,
      );
      const options = screen.getAllByRole("option");

      options[0].focus();
      act(() => {
        const ev = new KeyboardEvent("keydown", {
          key: "ArrowRight",
          bubbles: true,
          cancelable: true,
        });
        options[0].dispatchEvent(ev);
      });

      expect(document.activeElement).toBe(options[1]);
      expect(playCorrectChord).not.toHaveBeenCalled();
    });

    it("pressing Enter/Space or clicking a focused pick option selects it", () => {
      render(<DibujaHost pageKey="kb-dibuja-select" pickOptions={picks} initialMode="pick" />);
      const options = screen.getAllByRole("option");

      options[0].focus(); // "oso" is correct
      act(() => {
        fireEvent.click(options[0]);
      });

      expect(playCorrectChord).toHaveBeenCalled();
      expect(options[0].getAttribute("aria-selected")).toBe("true");
    });

    it("navigates draw swatches with arrow keys in draw mode", () => {
      render(<DibujaHost pageKey="kb-dibuja-draw-swatch" pickOptions={picks} initialMode="draw" />);
      const swatches = screen.getAllByRole("option");

      swatches[0].focus();
      act(() => {
        const ev = new KeyboardEvent("keydown", {
          key: "ArrowRight",
          bubbles: true,
          cancelable: true,
        });
        swatches[0].dispatchEvent(ev);
        expect(ev.defaultPrevented).toBe(true);
      });

      expect(document.activeElement).toBe(swatches[1]);
      expect(swatches[1].getAttribute("aria-selected")).toBe("true");
    });
  });

  describe("PaintCanvas keyboard navigation", () => {
    it("navigates swatches with ArrowRight, ArrowLeft, Home, End and updates selected color", () => {
      render(<PaintCanvas pageKey="kb-paint-swatches" verbLabel="Colorea" />);
      const swatches = screen.getAllByRole("option");

      swatches[0].focus();
      expect(swatches[0].getAttribute("aria-selected")).toBe("true");

      act(() => {
        const ev = new KeyboardEvent("keydown", {
          key: "ArrowRight",
          bubbles: true,
          cancelable: true,
        });
        swatches[0].dispatchEvent(ev);
        expect(ev.defaultPrevented).toBe(true);
      });

      expect(document.activeElement).toBe(swatches[1]);
      expect(swatches[1].getAttribute("aria-selected")).toBe("true");

      // Home key
      act(() => {
        const ev = new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true });
        swatches[1].dispatchEvent(ev);
        expect(ev.defaultPrevented).toBe(true);
      });

      expect(document.activeElement).toBe(swatches[0]);
      expect(swatches[0].getAttribute("aria-selected")).toBe("true");

      // End key
      act(() => {
        const ev = new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true });
        swatches[0].dispatchEvent(ev);
        expect(ev.defaultPrevented).toBe(true);
      });

      const lastIndex = swatches.length - 1;
      expect(document.activeElement).toBe(swatches[lastIndex]);
      expect(swatches[lastIndex].getAttribute("aria-selected")).toBe("true");
    });
  });

  describe("NativeLessonViewer integration (Page Turn Prevention)", () => {
    it("pressing ArrowRight on a focused DibujaHost pick option does NOT turn page in NativeLessonViewer", () => {
      const onPageChange = vi.fn();
      const pages = [
        {
          id: "p1",
          pageNumber: 1,
          gretelLine: "Página 1",
          content: <DibujaHost pageKey="p1-dibuja" pickOptions={picks} initialMode="pick" />,
        },
        {
          id: "p2",
          pageNumber: 2,
          gretelLine: "Página 2",
          content: <div>Página 2</div>,
        },
      ];

      render(
        <NativeLessonViewer
          pages={pages}
          chapterLabel="Capítulo 1"
          lessonNumber={1}
          onPageChange={onPageChange}
        />,
      );

      expect(screen.getByText(/Página 1 · 1 de 2/i)).toBeTruthy();

      const options = screen.getAllByRole("option");
      options[0].focus();

      act(() => {
        const ev = new KeyboardEvent("keydown", {
          key: "ArrowRight",
          bubbles: true,
          cancelable: true,
        });
        options[0].dispatchEvent(ev);
      });

      // Focus moved to second option
      expect(document.activeElement).toBe(options[1]);
      // Page turn was NOT triggered
      expect(onPageChange).not.toHaveBeenCalled();
      expect(screen.getByText(/Página 1 · 1 de 2/i)).toBeTruthy();
    });

    it("pressing ArrowRight on a focused PaintCanvas swatch does NOT turn page in NativeLessonViewer", () => {
      const onPageChange = vi.fn();
      const pages = [
        {
          id: "p1",
          pageNumber: 1,
          gretelLine: "Página 1",
          content: <PaintCanvas pageKey="p1-paint" verbLabel="Colorea" />,
        },
        {
          id: "p2",
          pageNumber: 2,
          gretelLine: "Página 2",
          content: <div>Página 2</div>,
        },
      ];

      render(
        <NativeLessonViewer
          pages={pages}
          chapterLabel="Capítulo 1"
          lessonNumber={1}
          onPageChange={onPageChange}
        />,
      );

      expect(screen.getByText(/Página 1 · 1 de 2/i)).toBeTruthy();

      const swatches = screen.getAllByRole("option");
      swatches[0].focus();

      act(() => {
        const ev = new KeyboardEvent("keydown", {
          key: "ArrowRight",
          bubbles: true,
          cancelable: true,
        });
        swatches[0].dispatchEvent(ev);
      });

      // Focus moved to second swatch
      expect(document.activeElement).toBe(swatches[1]);
      // Page turn was NOT triggered
      expect(onPageChange).not.toHaveBeenCalled();
      expect(screen.getByText(/Página 1 · 1 de 2/i)).toBeTruthy();
    });
  });
});

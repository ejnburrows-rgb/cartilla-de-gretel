import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DragBuildWord } from "../DragBuildWord";
import { gretelEvent } from "@/lib/gretel-bus";
import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock @dnd-kit/core to trigger drops easily
vi.mock("@dnd-kit/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/core")>();
  return {
    ...actual,
    DndContext: ({ children, onDragEnd }: any) => {
      // Expose onDragEnd globally to trigger drops in tests
      (window as any).__dndContextOnDragEnd = onDragEnd;
      return <div data-testid="dnd-context">{children}</div>;
    },
    useDraggable: ({ id, data, disabled }: any) => ({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      isDragging: false,
    }),
    useDroppable: ({ id, data }: any) => ({
      isOver: false,
      setNodeRef: vi.fn(),
    }),
  };
});

// Mock Audio to avoid issues in testing
vi.mock("@/hooks/useAudio", () => ({
  useAudio: () => ({
    play: vi.fn(),
    playingText: null,
  }),
}));

vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
}));

vi.mock("@/lib/student-session", () => ({
  recordEvent: vi.fn(),
}));

const words = ["sol", "luna", "mar", "pez"];

function triggerDrop(trayIdx: number, slotIdx: number, letter: string) {
  const onDragEnd = (window as any).__dndContextOnDragEnd;
  if (!onDragEnd) throw new Error("DndContext not rendered or mocked properly");
  act(() => {
    onDragEnd({
      active: { data: { current: { trayIdx, letter } } },
      over: { data: { current: { slotIdx } } },
    });
  });
}

describe("DragBuildWord.completion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("completes activity only after all words are built", async () => {
    const onComplete = vi.fn();
    render(<DragBuildWord words={words} accent="#000" onComplete={onComplete} lessonId="test" />);

    // Helper to drop correct letters for the current word
    const completeCurrentWord = (word: string) => {
      for (let slotIdx = 0; slotIdx < word.length; slotIdx++) {
        const targetLetter = word[slotIdx];
        const traysParent = screen.getByRole("group", { name: "Letras disponibles" });
        const trayEls = Array.from(traysParent.children);

        // find a tray that has not been used yet and has the target letter
        const trayIdx = trayEls.findIndex(
          (el) => el.getAttribute("data-used") === "false" && el.textContent === targetLetter,
        );

        triggerDrop(trayIdx, slotIdx, targetLetter);
      }
    };

    // 1. Complete first word
    completeCurrentWord("sol");

    // Verify first word completion shows "¡Muy bien!" but doesn't complete activity
    expect(await screen.findByText("¡Muy bien!")).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
    expect(gretelEvent).not.toHaveBeenCalledWith("lesson:complete");

    // Click next word
    act(() => {
      fireEvent.click(screen.getByText("Siguiente"));
    });

    // 2. Complete second word
    completeCurrentWord("luna");
    expect(await screen.findByText("¡Muy bien!")).toBeInTheDocument();
    act(() => {
      fireEvent.click(screen.getByText("Siguiente"));
    });

    // 3. Complete third word
    completeCurrentWord("mar");
    expect(await screen.findByText("¡Muy bien!")).toBeInTheDocument();
    act(() => {
      fireEvent.click(screen.getByText("Siguiente"));
    });

    // 4. Complete fourth word (final)
    completeCurrentWord("pez");

    // Now it should call onComplete exactly once
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
    expect(gretelEvent).toHaveBeenCalledWith("lesson:complete");

    // Retry/Reset the word shouldn't call onComplete again
    act(() => {
      fireEvent.click(screen.getByLabelText("Reiniciar palabra"));
    });
    completeCurrentWord("pez"); // completes it again

    // Wait a bit to ensure it doesn't get called
    await waitFor(() => {
      expect(screen.getByText("¡Muy bien!")).toBeInTheDocument();
    });
    expect(onComplete).toHaveBeenCalledTimes(1); // still 1
  });
});

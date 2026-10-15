import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DragBuildWord } from "../DragBuildWord";
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

const completeCurrentWord = (word: string) => {
  for (let slotIdx = 0; slotIdx < word.length; slotIdx++) {
    const targetLetter = word[slotIdx];
    const traysParent = screen.getByRole("group", { name: "Letras disponibles" });
    const trayEls = Array.from(traysParent.children);

    // find a tray that has not been used yet and has the target letter
    const trayIdx = trayEls.findIndex(el =>
      el.getAttribute("data-used") === "false" && el.textContent === targetLetter
    );

    triggerDrop(trayIdx, slotIdx, targetLetter);
  }
};

describe("DragBuildWord reset behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const words1 = ["sol"];
  const words2 = ["luz"];

  it("resets state when content changes", async () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <DragBuildWord words={words1} accent="#000" onComplete={onComplete} />
    );

    // Complete the first word ("sol")
    completeCurrentWord("sol");
    expect(await screen.findByText("¡Muy bien!")).toBeInTheDocument();

    // It should complete after all words are done
    expect(onComplete).toHaveBeenCalledTimes(1);

    // Now rerender with words2
    rerender(
      <DragBuildWord words={words2} accent="#000" onComplete={onComplete} />
    );

    // Check that we're on the new word
    const slotParent = screen.getByRole("group", { name: "Casillas de la palabra" });
    expect(slotParent.children.length).toBe(3);

    // Complete the second word ("luz")
    completeCurrentWord("luz");
    expect(await screen.findByText("¡Muy bien!")).toBeInTheDocument();

    expect(onComplete).toHaveBeenCalledTimes(2);
  });
});

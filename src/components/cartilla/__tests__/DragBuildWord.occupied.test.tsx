import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DragBuildWord } from "../DragBuildWord";
import { feelBus } from "@/lib/feel-bus";
import { gretelEvent } from "@/lib/gretel-bus";
import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock("@dnd-kit/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/core")>();
  return {
    ...actual,
    DndContext: ({ children, onDragEnd }: any) => {
      (window as any).__dndContextOnDragEnd = onDragEnd;
      return <div data-testid="dnd-context">{children}</div>;
    },
    useDraggable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      isDragging: false,
    }),
    useDroppable: () => ({
      isOver: false,
      setNodeRef: vi.fn(),
    }),
  };
});

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

describe("DragBuildWord occupied slot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not emit success events when dropping a matching letter on an already occupied slot", () => {
    const feelBusSpy = vi.spyOn(feelBus, "emit");
    const onComplete = vi.fn();
    // Using "ala" because it has two 'a's.
    render(<DragBuildWord words={["ala"]} accent="#000" onComplete={onComplete} lessonId="test" />);

    const traysParent = screen.getByRole("group", { name: "Letras disponibles" });
    const trayEls = Array.from(traysParent.children);
    
    // Find first 'a'
    const firstAIdx = trayEls.findIndex(el => el.textContent === "a");
    // Find second 'a'
    const secondAIdx = trayEls.findIndex((el, i) => i !== firstAIdx && el.textContent === "a");

    // Drop first 'a' into slot 0
    triggerDrop(firstAIdx, 0, "a");
    expect(feelBusSpy).toHaveBeenCalledWith("success");
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct");
    // Also state mutation happened: tray is marked as used
    expect(trayEls[firstAIdx]).toHaveAttribute("data-used", "true");

    feelBusSpy.mockClear();
    vi.mocked(gretelEvent).mockClear();

    // Now try to drop the SECOND 'a' into the SAME occupied slot 0
    triggerDrop(secondAIdx, 0, "a");
    
    // NO success event or state mutation should occur
    expect(feelBusSpy).not.toHaveBeenCalledWith("success");
    expect(gretelEvent).not.toHaveBeenCalledWith("answer:correct");
    expect(trayEls[secondAIdx]).toHaveAttribute("data-used", "false");
  });
});

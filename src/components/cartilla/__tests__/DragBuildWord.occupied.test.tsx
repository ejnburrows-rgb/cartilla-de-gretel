import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DragBuildWord } from "../DragBuildWord";
import { feelBus } from "@/lib/feel-bus";
import { gretelEvent } from "@/lib/gretel-bus";

// Mock DndContext to capture the onDragEnd handler
let dndContextOnDragEnd: any = null;

vi.mock("@dnd-kit/core", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    DndContext: (props: any) => {
      dndContextOnDragEnd = props.onDragEnd;
      return <div data-testid="dnd-context">{props.children}</div>;
    },
  };
});

vi.mock("@/lib/feel-bus", () => ({
  feelBus: {
    emit: vi.fn(),
  },
}));

vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
}));

describe("DragBuildWord occupied slot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dndContextOnDragEnd = null;
  });

  it("ignores drops to an already occupied slot and already used tray items", () => {
    const words = ["ala"];

    render(<DragBuildWord words={words} accent="emerald" />);

    expect(dndContextOnDragEnd).toBeDefined();

    // Find the tray indices for 'a'
    const trayButtons = screen.getAllByRole("button").filter((b) => b.getAttribute("data-used") !== null);

    // We don't have exact access to the state, but we can look at the tray button text content
    // and manually fire onDragEnd events mimicking DndKit behavior

    const aIndices: number[] = [];
    trayButtons.forEach((btn, index) => {
      if (btn.textContent === "a") {
        aIndices.push(index); // This assumes the rendered order is the tray array order
      }
    });

    expect(aIndices.length).toBeGreaterThanOrEqual(2);

    const firstATrayIdx = aIndices[0];
    const secondATrayIdx = aIndices[1];
    const slotIdx = 0; // We'll drop both on the first slot

    // Drop first 'a' on slot 0
    act(() => {
      dndContextOnDragEnd({
        active: { data: { current: { trayIdx: firstATrayIdx } } },
        over: { data: { current: { slotIdx: slotIdx } } },
      });
    });

    expect(feelBus.emit).toHaveBeenCalledWith("success");
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct");

    vi.clearAllMocks();

    // Drop second 'a' on the SAME slot 0
    act(() => {
      dndContextOnDragEnd({
        active: { data: { current: { trayIdx: secondATrayIdx } } },
        over: { data: { current: { slotIdx: slotIdx } } },
      });
    });

    // Should NOT trigger success again because the slot is occupied
    expect(feelBus.emit).not.toHaveBeenCalledWith("success");
    expect(gretelEvent).not.toHaveBeenCalledWith("answer:correct");

    vi.clearAllMocks();

    // Drop the first 'a' (already used) onto a DIFFERENT slot
    act(() => {
      dndContextOnDragEnd({
        active: { data: { current: { trayIdx: firstATrayIdx } } },
        over: { data: { current: { slotIdx: 2 } } }, // Slot 2 is still empty
      });
    });

    // Should NOT trigger success again because the tray item is already used
    expect(feelBus.emit).not.toHaveBeenCalledWith("success");
    expect(gretelEvent).not.toHaveBeenCalledWith("answer:correct");
  });
});

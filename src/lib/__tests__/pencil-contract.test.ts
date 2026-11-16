import { describe, expect, it } from "vitest";
import { contractTipAt, PENCIL_CONTRACT, velocitySegments, type ContractStroke } from "@/lib/pencil-contract";
import { markInProgress } from "@/components/StudentBook/NativeLessonViewer";

describe("contract candidate and turn guard", () => {
  it("uses the intended durations and bounds stroke widths", () => {
    expect(PENCIL_CONTRACT.holdMs).toBe(400);
    expect(PENCIL_CONTRACT.eraseMs).toBe(3500);
    expect(PENCIL_CONTRACT.crumbCount).toBe(12);
    const stroke: ContractStroke = { points: [[0, 0], [100, 0]], begin: 300, dur: 2000 };
    const segments = velocitySegments(stroke);
    expect(segments).toHaveLength(14);
    expect(segments.every(s => s.width >= 3.3 && s.width <= 6.4)).toBe(true);
    expect(contractTipAt([stroke], 1300)?.[0]).toBeCloseTo(50);
  });
  it.each(["drawing", "holding", "erasing"])("blocks a turn while %s", status => {
    const root = document.createElement("div");
    root.innerHTML = `<span class="workbook-pencil-mark" data-mark-status="${status}"></span>`;
    expect(markInProgress(root)).toBe(true);
  });
  it("does not block on a completed mark", () => {
    const root = document.createElement("div");
    root.innerHTML = '<span class="workbook-pencil-mark" data-mark-status="correct"></span>';
    expect(markInProgress(root)).toBe(false);
  });
});

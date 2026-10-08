import { describe, it, expect } from "vitest";
import {
  nextBlinkDelayMs,
  studentFlipTransforms,
  flipchartFlipTransforms,
  STUDENT_PAGE_TURN_MS,
  FLIPCHART_FLIP_MS,
  BLINK_HOLD_MS,
  BREATH_AMPLITUDE_PX,
} from "../living-motion";

describe("living-motion core policy", () => {
  it("blink delay stays in 3–7s inclusive bounds", () => {
    for (let i = 0; i < 50; i++) {
      const d = nextBlinkDelayMs(() => i / 49);
      expect(d).toBeGreaterThanOrEqual(3000);
      expect(d).toBeLessThanOrEqual(7000);
    }
  });

  it("student next free-edge moves with negative rotateY (R→L)", () => {
    const t = studentFlipTransforms("next");
    expect(t.start).toBe("rotateY(0deg)");
    expect(t.end).toBe("rotateY(-180deg)");
  });

  it("student prev reverses the leaf", () => {
    const t = studentFlipTransforms("prev");
    expect(t.start).toBe("rotateY(-180deg)");
    expect(t.end).toBe("rotateY(0deg)");
  });

  it("flipchart next is top-hinged rotateX", () => {
    const t = flipchartFlipTransforms("next");
    expect(t.start).toBe("rotateX(0deg)");
    expect(t.end).toBe("rotateX(-180deg)");
  });

  it("uses deliberate premium turn timing instead of app-like snap transitions", () => {
    expect(STUDENT_PAGE_TURN_MS).toBe(960);
    expect(STUDENT_PAGE_TURN_MS).toBeGreaterThanOrEqual(850);
    expect(STUDENT_PAGE_TURN_MS).toBeLessThanOrEqual(1100);
    expect(FLIPCHART_FLIP_MS).toBe(1120);
    expect(FLIPCHART_FLIP_MS).toBeGreaterThanOrEqual(1000);
    expect(FLIPCHART_FLIP_MS).toBeLessThanOrEqual(1300);
    expect(BLINK_HOLD_MS).toBeLessThan(200);
    expect(BREATH_AMPLITUDE_PX).toBeGreaterThanOrEqual(1);
    expect(BREATH_AMPLITUDE_PX).toBeLessThanOrEqual(3);
  });
});

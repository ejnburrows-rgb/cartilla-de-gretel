import { describe, it, expect } from "vitest";
import { manifestPageToEnginePage } from "../manifest-adapter";
import type { ManifestPage } from "../manifest-schema";

describe("manifestPageToEnginePage", () => {
  it("maps basic page fields", () => {
    const manifestPage: ManifestPage = {
      physicalPage: 7,
      lesson: 3,
      instruction: "Tap the correct picture.",
      objects: [],
      status: "mapped",
      background: "/some/bg.png",
    };
    const engine = manifestPageToEnginePage(manifestPage);
    expect(engine.pageNumber).toBe(7);
    expect(engine.lessonNumber).toBe(3);
    expect(engine.instruction).toBe("Tap the correct picture.");
    expect(engine.backgroundSrc).toBe("/some/bg.png");
    expect(engine.status).toBe("draft");
  });

  it("maps null background to null backgroundSrc (honest 'pending' state)", () => {
    const engine = manifestPageToEnginePage({
      physicalPage: 1,
      lesson: 1,
      instruction: "",
      objects: [],
      status: "mapped",
      background: null,
    });
    expect(engine.backgroundSrc).toBeNull();
  });

  it("maps status complete -> verified, everything else -> draft", () => {
    const base = { physicalPage: 1, lesson: 1, instruction: "", objects: [] };
    expect(manifestPageToEnginePage({ ...base, status: "complete" }).status).toBe("verified");
    expect(manifestPageToEnginePage({ ...base, status: "mapped" }).status).toBe("draft");
    expect(manifestPageToEnginePage({ ...base, status: "cropping-ready" }).status).toBe("draft");
  });

  it("maps select mechanic to tap-select and derives object correctness from answers", () => {
    const engine = manifestPageToEnginePage({
      physicalPage: 1,
      lesson: 1,
      instruction: "",
      status: "implementation-ready",
      interaction: { mechanic: "select", answers: ["b"] },
      objects: [
        { id: "a", type: "shape", x: 0, y: 0, width: 20, interactive: true },
        { id: "b", type: "shape", x: 30, y: 0, width: 20, interactive: true },
      ],
    });
    expect(engine.interaction?.kind).toBe("tap-select");
    const objA = engine.objects.find((o) => o.id === "a");
    const objB = engine.objects.find((o) => o.id === "b");
    expect((objA?.interaction?.data as { correct?: boolean })?.correct).toBe(false);
    expect((objB?.interaction?.data as { correct?: boolean })?.correct).toBe(true);
  });

  it("maps drag mechanic to drag-place with positional answers/targets pairing", () => {
    const engine = manifestPageToEnginePage({
      physicalPage: 1,
      lesson: 1,
      instruction: "",
      status: "implementation-ready",
      interaction: { mechanic: "drag", answers: ["piece-1"], targets: ["slot-1"] },
      objects: [
        { id: "piece-1", type: "shape", x: 0, y: 0, width: 20, interactive: true },
        { id: "slot-1", type: "shape", x: 50, y: 0, width: 20, interactive: true },
      ],
    });
    expect(engine.interaction?.kind).toBe("drag-place");
    const piece = engine.objects.find((o) => o.id === "piece-1");
    const slot = engine.objects.find((o) => o.id === "slot-1");
    expect(piece?.interaction?.data).toEqual({ role: "draggable", targetId: "slot-1" });
    expect(slot?.interaction?.data).toEqual({ role: "target" });
  });

  it("maps match mechanic to pair-match with shared pairId by position", () => {
    const engine = manifestPageToEnginePage({
      physicalPage: 1,
      lesson: 1,
      instruction: "",
      status: "implementation-ready",
      interaction: { mechanic: "match", answers: ["left-1"], targets: ["right-1"] },
      objects: [
        { id: "left-1", type: "shape", x: 0, y: 0, width: 20, interactive: true },
        { id: "right-1", type: "shape", x: 50, y: 0, width: 20, interactive: true },
      ],
    });
    expect(engine.interaction?.kind).toBe("pair-match");
    const left = engine.objects.find((o) => o.id === "left-1");
    const right = engine.objects.find((o) => o.id === "right-1");
    expect(left?.interaction?.data).toEqual({ role: "left", pairId: "pair-0" });
    expect(right?.interaction?.data).toEqual({ role: "right", pairId: "pair-0" });
  });

  it("falls back unsupported mechanics (order/trace) to no interaction, page still renders", () => {
    const engine = manifestPageToEnginePage({
      physicalPage: 1,
      lesson: 1,
      instruction: "Trace the letter.",
      status: "implementation-ready",
      interaction: { mechanic: "order", answers: ["a"] },
      objects: [{ id: "a", type: "shape", x: 0, y: 0, width: 20 }],
    });
    expect(engine.interaction).toBeUndefined();
    expect(engine.instruction).toBe("Trace the letter.");
  });

  it("falls back on object height to width when height is absent (documented square placeholder)", () => {
    const engine = manifestPageToEnginePage({
      physicalPage: 1,
      lesson: 1,
      instruction: "",
      status: "mapped",
      objects: [{ id: "a", type: "shape", x: 0, y: 0, width: 25 }],
    });
    expect(engine.objects[0].box.hPct).toBe(25);
  });

  it("wires audioId as a safe-no-op audio cue with the label preserved", () => {
    const engine = manifestPageToEnginePage({
      physicalPage: 1,
      lesson: 1,
      instruction: "",
      status: "mapped",
      objects: [{ id: "a", type: "shape", x: 0, y: 0, width: 20, audioId: "audio-42" }],
    });
    expect(engine.objects[0].audio).toEqual({ src: "", label: "audio-42" });
  });
});

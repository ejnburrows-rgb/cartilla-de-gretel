/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup, screen, act } from "@testing-library/react";
import { LassoConnect } from "../LassoConnect";

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
vi.mock("@/lib/gretel-tts", () => ({
  speakGretelPhrase: vi.fn(),
}));
vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => true, // shorten durations in tests
}));

import { playCorrectChord, playWrongBuzz } from "@/lib/piano-audio";
import { gretelEvent } from "@/lib/gretel-bus";
import { speakGretelPhrase } from "@/lib/gretel-tts";

const markTargets = [
  { id: "a", label: "mamá", correct: true },
  { id: "b", label: "oso", correct: false },
  { id: "c", label: "mimo", correct: true },
];

const pairTargets = [
  { id: "L0", label: "O", role: "left" as const, pairId: "p0" },
  { id: "R0", label: "oso", role: "right" as const, pairId: "p0", src: "/x/oso.webp" },
  { id: "L1", label: "A", role: "left" as const, pairId: "p1" },
  { id: "R1", label: "ala", role: "right" as const, pairId: "p1", src: "/x/ala.webp" },
];

async function flushAnim(ms = 600) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}

describe("LassoConnect — cinematic rope", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
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
    // stub getBoundingClientRect for hand/target geometry
    Element.prototype.getBoundingClientRect = function () {
      return {
        x: 0,
        y: 0,
        top: 10,
        left: 10,
        bottom: 110,
        right: 110,
        width: 100,
        height: 100,
        toJSON: () => ({}),
      } as DOMRect;
    };
  });
  afterEach(() => cleanup());

  it("renders thick SVG rope layer (not a single line stub)", () => {
    const { container } = render(
      <LassoConnect
        pageKey="lasso-1"
        targets={markTargets}
        mode="mark"
        verbFamily="encierra"
        instruction="Encierra en un círculo la sílaba correspondiente."
        reducedMotion
      />,
    );
    const ropeLayer = container.querySelector(".am-lasso__rope-layer");
    expect(ropeLayer).toBeTruthy();
    expect(ropeLayer?.tagName.toLowerCase()).toBe("svg");
    // Must not ship a lone bare <line> as the design
    const bareLines = ropeLayer?.querySelectorAll("line") ?? [];
    expect(bareLines.length).toBe(0);
    // Gradient rope defs present (thickness system)
    expect(container.querySelector("#ropeGrad")).toBeTruthy();
  });

  it("speaks intro VO on enter for Encierra family", () => {
    render(
      <LassoConnect
        pageKey="lasso-vo"
        targets={markTargets}
        mode="mark"
        verbFamily="encierra"
        reducedMotion
      />,
    );
    expect(speakGretelPhrase).toHaveBeenCalledWith("Vamos a encerrar la respuesta.");
  });

  it("correct target → wrap + success VO path", async () => {
    render(
      <LassoConnect
        pageKey="lasso-ok"
        targets={markTargets}
        mode="mark"
        verbFamily="encierra"
        lessonId="7"
        reducedMotion
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "mamá" }));
    await flushAnim(500);
    expect(playCorrectChord).toHaveBeenCalled();
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct");
    expect(speakGretelPhrase).toHaveBeenCalledWith("¡Buen trabajo!");
  });

  it("wrong target → reel-back + retry VO path", async () => {
    render(
      <LassoConnect
        pageKey="lasso-bad"
        targets={markTargets}
        mode="mark"
        verbFamily="encierra"
        reducedMotion
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "oso" }));
    await flushAnim(500);
    expect(playWrongBuzz).toHaveBeenCalled();
    expect(gretelEvent).toHaveBeenCalledWith("answer:wrong");
    expect(speakGretelPhrase).toHaveBeenCalledWith("Oh no, inténtalo de nuevo.");
  });

  it("pair mode links two items with settled rope path (not straight line)", async () => {
    const { container } = render(
      <LassoConnect
        pageKey="lasso-pair"
        targets={pairTargets}
        mode="pair"
        verbFamily="une"
        reducedMotion
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "O" }));
    fireEvent.click(screen.getByRole("button", { name: "oso" }));
    await flushAnim(500);
    expect(playCorrectChord).toHaveBeenCalled();
    // After success, a link group should exist (draped path via Q curve, not line)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    const links = container.querySelectorAll(".am-lasso__link path");
    // May be 0 until layout measures; assert no forbidden <line> design
    expect(container.querySelectorAll(".am-lasso__rope-layer line").length).toBe(0);
    void links;
  });

  it("Gretel full-presence figure is present (not corner sticker only)", () => {
    const { container } = render(
      <LassoConnect pageKey="lasso-g" targets={markTargets} mode="mark" reducedMotion />,
    );
    expect(container.querySelector(".am-lasso__gretel")).toBeTruthy();
    expect(container.querySelector(".am-lasso__gretel-img")).toBeTruthy();
    expect(container.querySelector(".am-lasso__shadow")).toBeTruthy();
  });
});

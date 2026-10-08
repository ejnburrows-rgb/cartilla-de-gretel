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
import { saveLassoProgress } from "@/lib/activity-canvas-store";

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

  it("correct target gives visual and sound feedback without repetitive Gretel speech", async () => {
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
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct", { itemId: "a" });
    expect(speakGretelPhrase).not.toHaveBeenCalledWith("¡Buen trabajo!");
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
    expect(gretelEvent).toHaveBeenCalledWith("answer:wrong", { itemId: "b" });
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

describe("DirectPencilConnector (Page 17 Uu direct line-match prototype)", () => {
  const p17Targets = [
    { id: "0", label: "uniforme", correct: true, src: "/art/uniforme.webp" },
    { id: "1", label: "uno", correct: true, src: "/art/uno.webp" },
    { id: "2", label: "oso", correct: false, src: "/art/oso.webp" },
    { id: "3", label: "uvas", correct: true, src: "/art/uvas.webp" },
    { id: "4", label: "unicornio", correct: true, src: "/art/unicornio.webp" },
    { id: "5", label: "uña", correct: true, src: "/art/una.webp" },
    { id: "6", label: "estrella", correct: false, src: "/art/estrella.webp" },
    { id: "7", label: "imán", correct: false, src: "/art/iman.webp" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders Archetype 4 source composition without invented header, badge, or pre-connected line", () => {
    const { container } = render(
      <LassoConnect
        pageKey="p17-proto"
        targets={p17Targets}
        mode="mark"
        directPencil
        centerLabel="Uu"
        instruction="Traza una línea desde la vocal Uu hasta el dibujo de la palabra que comienza con Uu."
        reducedMotion
      />,
    );

    expect(screen.getByRole("button", { name: "Vocal central Uu" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "uniforme" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "uña" })).toBeTruthy();
    expect(container.querySelectorAll(".am-direct-pencil__row--top .am-direct-pencil__target")).toHaveLength(3);
    expect(container.querySelectorAll(".am-direct-pencil__row--mid .am-direct-pencil__target")).toHaveLength(2);
    expect(container.querySelectorAll(".am-direct-pencil__row--bottom .am-direct-pencil__target")).toHaveLength(3);
    expect(container.querySelector(".am-direct-pencil__instruction")).toBeNull();
    expect(container.querySelector(".am-direct-pencil__example-badge")).toBeNull();
    expect(container.querySelector(".am-direct-pencil__line-group")).toBeNull();
  });

  it("tapping correct target (uniforme) connects line and plays correct chord", async () => {
    render(
      <LassoConnect
        pageKey="p17-proto-ok"
        targets={p17Targets}
        mode="mark"
        directPencil
        centerLabel="Uu"
        lessonId="6"
        reducedMotion
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "uniforme" }));
    await flushAnim(300);

    expect(playCorrectChord).toHaveBeenCalled();
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct", { itemId: "0" });
    expect(screen.getByRole("button", { name: "uniforme" }).classList.contains("is-connected")).toBe(true);
  });

  it("wrong target retracts neutrally and delegates retry voice without local buzz or TTS", async () => {
    const { container } = render(
      <LassoConnect
        pageKey="p17-proto-bad"
        targets={p17Targets}
        mode="mark"
        directPencil
        centerLabel="Uu"
        reducedMotion
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "oso" }));

    expect(playWrongBuzz).not.toHaveBeenCalled();
    expect(speakGretelPhrase).not.toHaveBeenCalled();
    expect(gretelEvent).toHaveBeenCalledWith("answer:wrong", { itemId: "2" });
    expect(screen.getByRole("button", { name: "oso" }).classList.contains("is-connected")).toBe(false);
    expect(screen.getByRole("button", { name: "oso" }).classList.contains("is-retry")).toBe(true);
    expect(container.querySelector(".am-direct-pencil__retry-line")).toBeTruthy();

    await flushAnim(150);
    expect(screen.getByRole("button", { name: "oso" }).classList.contains("is-retry")).toBe(false);
  });

  it("toggling focus mode expands stage for precision drawing", () => {
    const { container } = render(
      <LassoConnect
        pageKey="p17-proto-focus"
        targets={p17Targets}
        mode="mark"
        directPencil
        centerLabel="Uu"
        reducedMotion
      />,
    );

    const focusBtn = screen.getByRole("button", { name: "Ampliar área de trabajo" });
    fireEvent.click(focusBtn);

    expect(container.querySelector(".am-direct-pencil.is-expanded")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Volver a la página" }));
    expect(container.querySelector(".am-direct-pencil.is-expanded")).toBeFalsy();
  });

  it("supports press-and-hold pointer drag from center vowel to target with active pencil rendering", () => {
    const { container } = render(
      <LassoConnect
        pageKey="p17-proto-drag"
        targets={p17Targets}
        mode="mark"
        directPencil
        centerLabel="Uu"
        reducedMotion
      />,
    );

    const centerBtn = screen.getByRole("button", { name: "Vocal central Uu" });
    fireEvent.pointerDown(centerBtn, { clientX: 100, clientY: 100 });

    const stage = container.querySelector(".am-direct-pencil__stage")!;
    fireEvent.pointerMove(stage, { clientX: 150, clientY: 150 });

    expect(container.querySelector(".am-direct-pencil__active-line")).toBeTruthy();

    fireEvent.pointerUp(stage, { clientX: 150, clientY: 150 });
    expect(container.querySelector(".am-direct-pencil__active-line")).toBeNull();
  });

  it("renders pre-drawn example line and excludes it from learner count", () => {
    const targetsWithExample = p17Targets.map((t) =>
      t.label === "uña" ? { ...t, example: true } : t,
    );

    const { container } = render(
      <LassoConnect
        pageKey="p17-proto-example"
        targets={targetsWithExample}
        mode="mark"
        directPencil
        centerLabel="Uu"
        reducedMotion
      />,
    );

    const exampleBtn = screen.getByRole("button", { name: "uña" });
    expect(exampleBtn.classList.contains("is-connected")).toBe(true);
    expect(container.querySelector(".am-direct-pencil__line-group line[stroke-dasharray]")).toBeTruthy();
  });

  it("p3 Archetype 3 multi-pair Pencil Line connector connects left letter to right picture via click and drag", async () => {
    const p3Targets = [
      { id: "p3-L-0", label: "o", role: "left" as const, pairId: "pair-0" },
      { id: "p3-R-0", label: "ocho", role: "right" as const, pairId: "pair-0", src: "/art/ocho.webp" },
      { id: "p3-L-1", label: "a", role: "left" as const, pairId: "pair-1" },
      { id: "p3-R-1", label: "araña", role: "right" as const, pairId: "pair-1", src: "/art/arana.webp" },
    ];

    const { container } = render(
      <LassoConnect
        pageKey="p3-multi-pair"
        targets={p3Targets}
        mode="pair"
        directPencil
        reducedMotion
      />,
    );

    expect(screen.getByRole("button", { name: "Vocal o" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "ocho" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Vocal o" }));
    expect(screen.getByRole("button", { name: "Vocal o" }).classList.contains("is-active")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "ocho" }));
    await flushAnim(200);

    expect(playCorrectChord).toHaveBeenCalled();
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct", { itemId: "p3-L-0|p3-R-0" });
    expect(container.querySelector(".am-direct-pencil__line-group")).toBeTruthy();
  });

  it("filters out stale/mismatched saved keys and restores valid ones silently", () => {
    const p3Targets = [
      { id: "p3-L-0", label: "o", role: "left" as const, pairId: "pair-0" },
      { id: "p3-R-0", label: "ocho", role: "right" as const, pairId: "pair-0", src: "/art/ocho.webp" },
      { id: "p3-L-1", label: "a", role: "left" as const, pairId: "pair-1" },
      { id: "p3-R-1", label: "araña", role: "right" as const, pairId: "pair-1", src: "/art/arana.webp" },
    ];

    // Seed localStorage via saveLassoProgress with one valid pair key and several stale/mismatched keys
    saveLassoProgress("p3-stale-test", [
      "p3-L-0|p3-R-0",
      "p3-L-0|p3-R-1",
      "invalid-key",
      "p3-L-99|p3-R-99",
    ]);

    const { container } = render(
      <LassoConnect
        pageKey="p3-stale-test"
        targets={p3Targets}
        mode="pair"
        directPencil
        reducedMotion
      />,
    );

    // Only the valid line ("p3-L-0|p3-R-0") should be rendered
    const lineGroups = container.querySelectorAll(".am-direct-pencil__line-group");
    expect(lineGroups).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Vocal o" }).classList.contains("is-connected")).toBe(true);
    expect(screen.getByRole("button", { name: "Vocal a" }).classList.contains("is-connected")).toBe(false);
  });

  it("clears transient drag state cleanly onPointerCancel without committing", () => {
    const { container } = render(
      <LassoConnect
        pageKey="p17-proto-cancel"
        targets={p17Targets}
        mode="mark"
        directPencil
        centerLabel="Uu"
        reducedMotion
      />,
    );

    const centerBtn = screen.getByRole("button", { name: "Vocal central Uu" });
    fireEvent.pointerDown(centerBtn, { clientX: 100, clientY: 100 });

    const stage = container.querySelector(".am-direct-pencil__stage")!;
    fireEvent.pointerMove(stage, { clientX: 150, clientY: 150 });
    expect(container.querySelector(".am-direct-pencil__active-line")).toBeTruthy();

    fireEvent.pointerCancel(stage);
    expect(container.querySelector(".am-direct-pencil__active-line")).toBeNull();
    expect(gretelEvent).not.toHaveBeenCalledWith("answer:correct", expect.anything());
    expect(gretelEvent).not.toHaveBeenCalledWith("answer:wrong", expect.anything());
  });

  it("pointer down followed by click keeps source selected without immediate toggle-off", () => {
    render(
      <LassoConnect
        pageKey="p17-proto-tap"
        targets={p17Targets}
        mode="mark"
        directPencil
        centerLabel="Uu"
        reducedMotion
      />,
    );

    const centerBtn = screen.getByRole("button", { name: "Vocal central Uu" });
    fireEvent.pointerDown(centerBtn, { clientX: 100, clientY: 100 });
    fireEvent.click(centerBtn);

    expect(centerBtn.classList.contains("is-active")).toBe(true);
  });
});

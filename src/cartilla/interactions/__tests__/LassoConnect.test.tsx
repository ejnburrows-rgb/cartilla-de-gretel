/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { DirectPencilConnector, type PencilTarget } from "../PencilConnector";
import { saveLassoProgress } from "@/lib/activity-canvas-store";

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

describe("validateProgressKeys edge cases for LassoConnect logic", () => {
  const p17Targets = [
    { id: "0", label: "uniforme", correct: true, src: "/art/uniforme.webp" },
    { id: "1", label: "uno", correct: true, src: "/art/uno.webp" },
    { id: "2", label: "oso", correct: false, src: "/art/oso.webp" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("handles empty input arrays cleanly without marking any targets", () => {
    saveLassoProgress("empty-test", []);
    const { container } = render(
      <DirectPencilConnector
        pageKey="empty-test"
        targets={p17Targets}
        mode="mark"
        centerLabel="Uu"
        reducedMotion
      />,
    );

    const lineGroups = container.querySelectorAll(".am-direct-pencil__line-group line[stroke-dasharray]");
    expect(lineGroups).toHaveLength(0);
    expect(screen.getByRole("button", { name: "uniforme" }).classList.contains("is-connected")).toBe(false);
  });

  it("filters out missing targets cleanly", () => {
    saveLassoProgress("missing-target-test", ["non-existent-id"]);
    const { container } = render(
      <DirectPencilConnector
        pageKey="missing-target-test"
        targets={p17Targets}
        mode="mark"
        centerLabel="Uu"
        reducedMotion
      />,
    );

    const lineGroups = container.querySelectorAll(".am-direct-pencil__line-group line[stroke-dasharray]");
    expect(lineGroups).toHaveLength(0);
  });

  it("handles invalid roles and missing pairIds in pair mode", () => {
    const p3Targets = [
      { id: "p3-L-0", label: "o", role: "left" },
      { id: "p3-R-0", label: "ocho", role: "right", pairId: "pair-0", src: "/art/ocho.webp" },
      { id: "p3-L-1", label: "a", role: "left", pairId: "pair-1" },
      // Intentionally malformed right target (wrong role, no pairId)
      { id: "p3-R-1-broken", label: "araña", role: "left", src: "/art/arana.webp" },
    ];

    const typedTargets = p3Targets as PencilTarget[];

    saveLassoProgress("invalid-roles-test", [
      "p3-L-0|p3-R-0",
      "p3-L-1|p3-R-1-broken", // Should be filtered out due to role and missing pairId
      "p3-L-0|p3-R-0|extra", // Malformed key format
    ]);

    const { container } = render(
      <DirectPencilConnector
        pageKey="invalid-roles-test"
        targets={typedTargets}
        mode="pair"
        reducedMotion
      />,
    );

    const lineGroups = container.querySelectorAll(".am-direct-pencil__line-group");
    expect(lineGroups).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Vocal o" }).classList.contains("is-connected")).toBe(false);
  });

  it("filters out valid mark IDs if the target is marked as correct: false in mark mode", () => {
    saveLassoProgress("correct-false-test", ["0", "2"]);

    const { container } = render(
      <DirectPencilConnector
        pageKey="correct-false-test"
        targets={p17Targets}
        mode="mark"
        centerLabel="Uu"
        reducedMotion
      />,
    );

    expect(screen.getByRole("button", { name: "uniforme" }).classList.contains("is-connected")).toBe(true);
    expect(screen.getByRole("button", { name: "oso" }).classList.contains("is-connected")).toBe(false);
  });

  it("handles null and undefined saved states safely", () => {
    saveLassoProgress("null-test", null as any);
    const { container: container1 } = render(
      <DirectPencilConnector
        pageKey="null-test"
        targets={p17Targets}
        mode="mark"
        centerLabel="Uu"
        reducedMotion
      />,
    );
    expect(container1.querySelectorAll(".am-direct-pencil__line-group line[stroke-dasharray]")).toHaveLength(0);
    cleanup();

    saveLassoProgress("undefined-test", undefined as any);
    const { container: container2 } = render(
      <DirectPencilConnector
        pageKey="undefined-test"
        targets={p17Targets}
        mode="mark"
        centerLabel="Uu"
        reducedMotion
      />,
    );
    expect(container2.querySelectorAll(".am-direct-pencil__line-group line[stroke-dasharray]")).toHaveLength(0);
  });

  it("handles non-array object input gracefully without crashing", () => {
    saveLassoProgress("object-test", {} as any);
    const { container } = render(
      <DirectPencilConnector
        pageKey="object-test"
        targets={p17Targets}
        mode="mark"
        centerLabel="Uu"
        reducedMotion
      />,
    );
    expect(container.querySelectorAll(".am-direct-pencil__line-group line[stroke-dasharray]")).toHaveLength(0);
  });

  it("handles targets missing required keys like id, or extra unknown keys in pair mode", () => {
    const boundaryTargets = [
      // Missing id
      { id: "fake-id", label: "broken-missing-id", role: "left", pairId: "b-0" } as any,
      { id: "valid-left", label: "valid", role: "left", pairId: "b-1" },
      { id: "valid-right", label: "valid", role: "right", pairId: "b-1", src: "/art/valid.webp" },
      // Extra unknown properties, missing pairId, wrong role type
      { id: "b-R", label: "broken", role: 123 as any, someExtraKey: true },
    ];

    saveLassoProgress("boundary-test", [
      "undefined|valid-right",
      "valid-left|b-R",
      "valid-left|valid-right"
    ]);

    const { container } = render(
      <DirectPencilConnector
        pageKey="boundary-test"
        targets={boundaryTargets as PencilTarget[]}
        mode="pair"
        reducedMotion
      />,
    );

    const lineGroups = container.querySelectorAll(".am-direct-pencil__line-group");
    // Only the fully valid pair connects
    expect(lineGroups).toHaveLength(1);
  });

  it("ignores incorrectly typed IDs in progress array", () => {
    saveLassoProgress("wrong-types-test", [123, true, {id: "0"}] as any);
    const { container } = render(
      <DirectPencilConnector
        pageKey="wrong-types-test"
        targets={p17Targets}
        mode="mark"
        centerLabel="Uu"
        reducedMotion
      />,
    );
    expect(container.querySelectorAll(".am-direct-pencil__line-group line[stroke-dasharray]")).toHaveLength(0);
  });
});

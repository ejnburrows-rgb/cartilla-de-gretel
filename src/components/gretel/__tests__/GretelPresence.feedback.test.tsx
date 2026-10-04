import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GretelPresence } from "../GretelPresence";
import { gretelEvent } from "@/lib/gretel-bus";
import { speakAsGretel } from "@/lib/gretel-voice";

vi.mock("@/lib/gretel-voice", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/gretel-voice")>();
  return {
    ...actual,
    speakAsGretel: vi.fn(() => Promise.resolve()),
    cancelGretelSpeech: vi.fn(),
    isGretelVoiceMuted: () => false,
  };
});

function readyActivity() {
  render(<GretelPresence autoIntro={false} bookMode hideChrome />);
  act(() => {
    gretelEvent("page:revealed", { pageNumber: 1 });
    gretelEvent("activity:focus", { activityId: "activity-1", pageNumber: 1 });
  });
}

function feedback(type: "answer:correct" | "answer:wrong" | "activity:complete") {
  act(() => {
    gretelEvent(type, { activityId: "activity-1", pageNumber: 1 });
    vi.advanceTimersByTime(100);
  });
}

describe("GretelPresence managed feedback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(speakAsGretel).mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("uses the owner-approved success phrase", () => {
    readyActivity();
    feedback("answer:correct");
    expect(speakAsGretel).toHaveBeenCalledWith("Buen trabajo.");
  });

  it("uses the owner-approved retry phrase", () => {
    readyActivity();
    feedback("answer:wrong");
    expect(speakAsGretel).toHaveBeenCalledWith("Inténtalo otra vez.");
  });

  it("does not speak twice when completion immediately follows the final correct answer", () => {
    readyActivity();
    feedback("answer:correct");
    feedback("activity:complete");
    expect(speakAsGretel).toHaveBeenCalledTimes(1);
    expect(speakAsGretel).toHaveBeenCalledWith("Buen trabajo.");
  });
});

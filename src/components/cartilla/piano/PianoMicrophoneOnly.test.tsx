// @vitest-environment jsdom
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PianoDesignA } from "./PianoDesignA";
import { PianoDesignB } from "./PianoDesignB";

const calls = vi.hoisted(() => ({
  toggleMic: vi.fn(),
  listenToWord: vi.fn(),
  listenToSyllable: vi.fn(),
}));

vi.mock("@/components/gretel/GretelLiveAvatar", () => ({
  GretelLiveAvatar: () => null,
}));

vi.mock("./usePianoSession", () => ({
  PRIVACY_NOTE: {
    "on-device": "La voz se procesa dentro del dispositivo.",
    unavailable: "No hay micrófono compatible.",
    checking: "Comprobando el micrófono.",
  },
  usePianoSession: () => ({
    item: { word: "a", syllables: ["a"] },
    items: [{ word: "a", syllables: ["a"] }],
    itemIndex: 0,
    keys: ["a"],
    wordMode: false,
    confirmed: 0,
    provisional: 0,
    done: false,
    isLastItem: true,
    message: "Di a",
    celebrating: false,
    flash: null,
    status: "idle",
    processing: "on-device",
    supported: true,
    micOpen: false,
    micDisabled: false,
    exampleActive: false,
    gretelRef: { current: null },
    keyStateFor: () => "next",
    listenToWord: calls.listenToWord,
    listenToSyllable: calls.listenToSyllable,
    toggleMic: calls.toggleMic,
    restartWord: vi.fn(),
  }),
}));

vi.mock("./usePianoGroups", () => ({
  usePianoGroups: () => ({
    modes: ["silabas"],
    mode: "silabas",
    chooseMode: vi.fn(),
    item: { word: "a", syllables: ["a"] },
    items: [{ word: "a", syllables: ["a"] }],
    itemIndex: 0,
    keys: ["a"],
    wordMode: false,
    confirmed: 0,
    done: false,
    isLastItem: true,
    message: "Di a",
    celebrating: false,
    flash: null,
    sparkle: null,
    status: "idle",
    processing: "on-device",
    supported: true,
    micOpen: false,
    micDisabled: false,
    exampleActive: false,
    gretelRef: { current: null },
    groupStateFor: () => "next",
    keyStateFor: () => "next",
    listenToWord: calls.listenToWord,
    listenToSyllable: calls.listenToSyllable,
    toggleMic: calls.toggleMic,
    restartWord: vi.fn(),
    nextWord: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe.each([
  ["Piano", PianoDesignA],
  ["Cancionero", PianoDesignB],
])("%s — microphone-controlled keys", (_name, Piano) => {
  it("renders keys as visual indicators, never clickable or keyboard-playable buttons", () => {
    render(<Piano syllables={["a"]} />);
    const key = screen.getByTestId("piano-key-0");
    expect(key.tagName).toBe("SPAN");
    expect(key.getAttribute("data-key-state")).toBe("next");
    expect(screen.queryByTestId("piano-touch-mode")).toBeNull();
    expect(screen.queryByRole("button", { name: /tecla a/i })).toBeNull();
    fireEvent.click(key);
    fireEvent.keyDown(window, { key: "a" });
    expect(calls.listenToSyllable).not.toHaveBeenCalled();
  });

  it("keeps microphone activation as the way to submit an utterance", () => {
    render(<Piano syllables={["a"]} />);
    fireEvent.click(screen.getByTestId("piano-mic"));
    expect(calls.toggleMic).toHaveBeenCalledTimes(1);
  });
});

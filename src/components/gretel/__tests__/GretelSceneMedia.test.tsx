import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GretelSceneMedia } from "../GretelSceneMedia";

const settings = vi.hoisted(() => ({ reduced: false }));
vi.mock("framer-motion", () => ({ useReducedMotion: () => settings.reduced }));
const clip = { mp4: "/approved.mp4", webm: "/approved.webm", poster: "/approved.webp" };
const props = { video: clip, fallback: "/still.webp", durationSeconds: 8 };

beforeEach(() => {
  vi.useFakeTimers();
  settings.reduced = false;
  Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: false } });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

describe("approved Gretel scene playback", () => {
  it("plays once, then shows the approved still and reports completion", () => {
    const settled = vi.fn();
    const { container } = render(<GretelSceneMedia {...props} onSettled={settled} />);
    const video = container.querySelector("video")!;
    expect(video).not.toHaveAttribute("loop");
    fireEvent.canPlay(video);
    fireEvent.canPlay(video);
    expect(video.play).toHaveBeenCalledTimes(1);
    fireEvent.playing(video);
    expect(container.querySelector("[data-gretel-media]")).toHaveAttribute("data-gretel-media", "playing");
    fireEvent.ended(video);
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute("src", clip.poster);
    expect(settled).toHaveBeenCalledTimes(1);
  });
  it("returns to the still if the clip does not start within two seconds", () => {
    const { container } = render(<GretelSceneMedia {...props} />);
    act(() => vi.advanceTimersByTime(2000));
    expect(container.querySelector("video")).toBeNull();
  });
  it("also times out a pending play request, rather than hiding the still indefinitely", () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockReturnValue(new Promise(() => {}));
    const { container } = render(<GretelSceneMedia {...props} />);
    fireEvent.canPlay(container.querySelector("video")!);
    act(() => vi.advanceTimersByTime(2000));
    expect(container.querySelector("video")).toBeNull();
  });
  it("keeps a playing clip alive beyond the loading timeout", () => {
    const { container } = render(<GretelSceneMedia {...props} />);
    fireEvent.canPlay(container.querySelector("video")!);
    fireEvent.playing(container.querySelector("video")!);
    act(() => vi.advanceTimersByTime(2000));
    expect(container.querySelector("video")).not.toBeNull();
  });
  it("falls back on a failed media load", () => {
    const { container } = render(<GretelSceneMedia {...props} />);
    fireEvent.error(container.querySelector("video")!);
    expect(container.querySelector("video")).toBeNull();
  });
  it("falls back when autoplay is rejected", async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(new Error("blocked"));
    const { container } = render(<GretelSceneMedia {...props} />);
    await act(async () => fireEvent.canPlay(container.querySelector("video")!));
    expect(container.querySelector("video")).toBeNull();
  });
  it("never loads a clip when reduced motion is requested", () => {
    settings.reduced = true;
    const { container } = render(<GretelSceneMedia {...props} />);
    expect(container.querySelector("video")).toBeNull();
  });
  it("never loads a clip when data saving is requested", () => {
    Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: true } });
    const { container } = render(<GretelSceneMedia {...props} />);
    expect(container.querySelector("video")).toBeNull();
  });
  it("uses the current still when no approved clip is registered", () => {
    const { container } = render(<GretelSceneMedia fallback={props.fallback} durationSeconds={8} />);
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute("src", props.fallback);
  });
  it("bounds stalled playback and starts a new player only for explicit replay", () => {
    const { container, rerender } = render(<GretelSceneMedia key="first" {...props} />);
    fireEvent.canPlay(container.querySelector("video")!);
    fireEvent.playing(container.querySelector("video")!);
    act(() => vi.advanceTimersByTime(11000));
    expect(container.querySelector("video")).toBeNull();
    rerender(<GretelSceneMedia key="replay" {...props} />);
    fireEvent.canPlay(container.querySelector("video")!);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
  });
});

 it("loops the approved welcome silently without a forced deadline", () => {
  const { container } = render(<GretelSceneMedia video={clip} fallback="/still.png" durationSeconds={6} loop />);
  const video = container.querySelector("video")!;
  expect(video.loop).toBe(true);
  expect(video.muted).toBe(true);
  fireEvent.playing(video);
  fireEvent.ended(video);
  act(() => vi.advanceTimersByTime(12000));
  expect(container.querySelector("[data-gretel-media]")).toHaveAttribute("data-gretel-media", "playing");
 });

describe("broken registered poster fallback", () => {
  it("uses the independently supplied fallback still when the registered poster fails", () => {
    const { container } = render(<GretelSceneMedia {...props} />);
    expect(container.querySelector("img")).toHaveAttribute("src", clip.poster);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toHaveAttribute("src", props.fallback);
  });

  it("does not retry a broken poster in an infinite error loop", () => {
    const { container } = render(<GretelSceneMedia {...props} />);
    fireEvent.error(container.querySelector("img")!);
    // Later errors (the fallback's own, or repeats) must never flip back to the
    // broken poster and trigger another load.
    fireEvent.error(container.querySelector("img")!);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toHaveAttribute("src", props.fallback);
  });

  it("resets the poster fallback when the video poster changes", () => {
    const { container, rerender } = render(<GretelSceneMedia {...props} />);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toHaveAttribute("src", props.fallback);
    const next = { mp4: "/next.mp4", webm: "/next.webm", poster: "/next.webp" };
    rerender(<GretelSceneMedia {...props} video={next} />);
    expect(container.querySelector("img")).toHaveAttribute("src", next.poster);
  });

  it("resets the poster fallback when the fallback still changes", () => {
    const { container, rerender } = render(<GretelSceneMedia {...props} />);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toHaveAttribute("src", props.fallback);
    // A new fallback is a new context: the stale failure is cleared and the
    // registered poster is retried once, then falls back to the new still.
    rerender(<GretelSceneMedia {...props} fallback="/other-still.webp" />);
    expect(container.querySelector("img")).toHaveAttribute("src", clip.poster);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toHaveAttribute("src", "/other-still.webp");
  });

  it("still falls back from video playback to the still after a poster failure", () => {
    const { container } = render(<GretelSceneMedia {...props} />);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toHaveAttribute("src", props.fallback);
    // The existing play/then-return-to-still contract is untouched by the poster fallback.
    const video = container.querySelector("video")!;
    fireEvent.canPlay(video);
    fireEvent.playing(video);
    expect(container.querySelector("[data-gretel-media]")).toHaveAttribute("data-gretel-media", "playing");
    fireEvent.ended(video);
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute("src", props.fallback);
  });
});

import { describe, it, expect, vi } from "vitest";
import { createGretelDynamicTts } from "../gretel-dynamic-tts";

function setup() {
  const textRequests: string[] = [];
  let finishAudio: (() => void) | undefined;
  const pause = vi.fn();
  const revoked: string[] = [];
  const fetchFn = vi.fn(async (_endpoint: string, options: RequestInit) => {
    textRequests.push(JSON.parse(String(options.body)).text as string);
    return new Response(new Blob(["RIFF"], { type: "audio/wav" }), {
      status: 200, headers: { "Content-Type": "audio/wav" },
    });
  }) as unknown as typeof fetch;
  const audioFactory = vi.fn((_url: string) => {
    const audio = {
      onended: null as (() => void) | null,
      onerror: null as (() => void) | null,
      pause,
      play: vi.fn(async () => undefined),
    };
    finishAudio = () => audio.onended?.();
    return audio as unknown as HTMLAudioElement;
  });
  const engine = createGretelDynamicTts("/api/gretel/tts", {
    fetchFn, audioFactory,
    createObjectURL: () => "blob:gretel",
    revokeObjectURL: (url) => revoked.push(url),
  });
  return { engine, textRequests, pause, revoked, audioFactory, endAudio: () => finishAudio?.() };
}

describe("Gretel dynamic custom voice", () => {
  it("sends new Spanish sentences including ñ and ü to one synth engine", async () => {
    const ctx = setup();
    const text = "Mañana el pingüino leerá una palabra nueva.";
    const onStart = vi.fn();
    const speech = ctx.engine.speak(text, { onStart });
    await vi.waitFor(() => expect(ctx.audioFactory).toHaveBeenCalledOnce());
    await vi.waitFor(() => expect(onStart).toHaveBeenCalledOnce());
    expect(ctx.textRequests).toEqual([text]);
    ctx.endAudio();
    await speech;
    expect(ctx.revoked).toEqual(["blob:gretel"]);
  });

  it("cancels playback and clears the private audio object URL", async () => {
    const ctx = setup();
    const speech = ctx.engine.speak("¡Hola!", {});
    await vi.waitFor(() => expect(ctx.audioFactory).toHaveBeenCalledOnce());
    ctx.engine.cancel();
    await speech;
    expect(ctx.pause).toHaveBeenCalledOnce();
    expect(ctx.revoked).toEqual(["blob:gretel"]);
  });

  it("rejects unexpected HTML instead of playing a generic replacement", async () => {
    const engine = createGretelDynamicTts("/api/gretel/tts", {
      fetchFn: async () => new Response("<html>wrong</html>", { status: 200, headers: { "Content-Type": "text/html" } }),
    });
    await expect(engine.speak("Hola")).rejects.toThrow(/audio/);
  });
  it("maps real learner outcomes to spoken Gretel reactions only", async () => {
    const { gretelReactionLine } = await import("../gretel-dynamic-tts");
    expect(gretelReactionLine("answer:correct")).toContain("Muy bien");
    expect(gretelReactionLine("answer:wrong")).toContain("intentarlo otra vez");
    expect(gretelReactionLine("lesson:complete")).toContain("Terminaste");
    expect(gretelReactionLine("listen:start")).toBeNull();
    expect(gretelReactionLine("page-turn:start")).toBeNull();
  });

  it("rejects insecure remote model endpoints rather than submitting learner text", async () => {
    const { initializeGretelDynamicTts } = await import("../gretel-dynamic-tts");
    expect(initializeGretelDynamicTts("http://remote-model.example/api/gretel/tts")).toBe(false);
  });

});

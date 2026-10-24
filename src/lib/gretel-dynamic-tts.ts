import { setGretelVoiceProviderConfig, getGretelVoiceProviderConfig, cancelGretelSpeech, speakAsGretel, type GretelVoiceHandlers } from "./gretel-voice";
import { onGretelEvent, type GretelBusEvent } from "./gretel-bus";

/**
 * Sends new Spanish text to Gretel's private inference server. Neither the
 * recording nor model weights enter the browser or the public repository.
 * There is no prerecorded-phrase lookup or browser-voice substitution.
 */
export interface DynamicTtsDependencies {
  fetchFn?: typeof fetch;
  audioFactory?: (url: string) => HTMLAudioElement;
  createObjectURL?: (blob: Blob) => string;
  revokeObjectURL?: (url: string) => void;
}

export function createGretelDynamicTts(endpoint: string, dependencies: DynamicTtsDependencies = {}) {
  const fetchFn = dependencies.fetchFn ?? ((...args: Parameters<typeof fetch>) => fetch(...args));
  const audioFactory = dependencies.audioFactory ?? ((url: string) => new Audio(url));
  const createURL = dependencies.createObjectURL ?? ((blob: Blob) => URL.createObjectURL(blob));
  const revokeURL = dependencies.revokeObjectURL ?? ((url: string) => URL.revokeObjectURL(url));
  type Current = { controller: AbortController; audio?: HTMLAudioElement; url?: string; settle?: () => void };
  let current: Current | null = null;

  function cancel(): void {
    const task = current;
    current = null;
    if (!task) return;
    task.controller.abort();
    task.audio?.pause();
    if (task.audio) {
      task.audio.onended = null;
      task.audio.onerror = null;
    }
    if (task.url) revokeURL(task.url);
    task.settle?.();
    task.settle = undefined;
  }

  async function speak(text: string, handlers: GretelVoiceHandlers = {}): Promise<void> {
    cancel();
    const spoken = text.trim();
    if (!spoken) return;
    const task: Current = { controller: new AbortController() };
    current = task;
    try {
      const response = await fetchFn(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "audio/wav" },
        body: JSON.stringify({ text: spoken }),
        signal: task.controller.signal,
      });
      if (!response.ok) throw new Error("Gretel TTS unavailable (" + response.status + ")");
      if (!response.headers.get("content-type")?.toLowerCase().startsWith("audio/")) {
        throw new Error("Gretel TTS returned something other than audio");
      }
      const blob = await response.blob();
      if (task.controller.signal.aborted) return;
      task.url = createURL(blob);
      const audio = audioFactory(task.url);
      task.audio = audio;
      await new Promise<void>((resolve, reject) => {
        const done = () => { task.settle = undefined; resolve(); };
        const fail = () => { task.settle = undefined; reject(new Error("Gretel TTS playback failed")); };
        task.settle = done;
        audio.onended = done;
        audio.onerror = fail;
        void audio.play().then(() => {
          if (!task.controller.signal.aborted) handlers.onStart?.();
        }).catch(fail);
      });
    } catch (error) {
      if (!task.controller.signal.aborted) throw error;
    } finally {
      if (current === task) cancel();
      handlers.onEnd?.();
    }
  }
  return { speak, cancel };
}

/** Turn actual learner outcomes into spoken Gretel reactions; silence while listening. */
export function gretelReactionLine(type: GretelBusEvent): string | null {
  switch (type) {
    case "answer:correct": return "¡Muy bien! ¡Lo conseguiste!";
    case "answer:wrong": return "Casi. Vamos a intentarlo otra vez.";
    case "lesson:complete": return "¡Terminaste la lección! ¡Excelente trabajo!";
    default: return null;
  }
}

let uninstallReactions: (() => void) | null = null;
export function installDynamicGretelReactions(): void {
  uninstallReactions?.();
  uninstallReactions = onGretelEvent((type, detail) => {
    if (getGretelVoiceProviderConfig().type !== "custom") return;
    if (type === "listen:start" || type === "page-turn:start") {
      cancelGretelSpeech();
      return;
    }
    if (detail.restored) return;
    const line = gretelReactionLine(type);
    if (line) void speakAsGretel(line);
  });
}

/** Activate the private engine only if a real inference endpoint is configured. */
export function initializeGretelDynamicTts(endpoint: string | undefined): boolean {
  if (!endpoint || typeof window === "undefined") return false;
  let url: URL;
  try { url = new URL(endpoint, window.location.href); }
  catch { return false; }
  const localDevelopment = ["localhost", "127.0.0.1"].includes(url.hostname);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && localDevelopment)) {
    console.warn("Gretel custom TTS requires HTTPS (except local development)");
    return false;
  }
  const engine = createGretelDynamicTts(url.toString());
  setGretelVoiceProviderConfig({
    type: "custom", name: "Gretel private Spanish TTS",
    speakFn: engine.speak, cancelFn: engine.cancel,
  });
  return true;
}

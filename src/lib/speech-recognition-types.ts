/**
 * Minimal structural types for the (non-standard) Web Speech API recognition
 * surface, which is absent from the TypeScript DOM lib. Shared by
 * useSpeechRecognition and InteractiveMiniGames so neither needs `any`.
 */

export type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

export type SpeechRecognitionErrorEventLike = {
  error: string;
};

export type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};

export type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

/** Prefixed/unprefixed constructor lookup; undefined when unsupported. */
export function getSpeechRecognitionCtor(): SpeechRecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition;
}

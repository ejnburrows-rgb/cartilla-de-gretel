import manifest from "@/data/gretel-recorded-manifest.json";
import existingCatalog from "@/data/gretel-existing-audio-catalog.json";

/** Full-phrase match only: NEVER use a similar word as proof that a recording says the requested text. */
export function exactRecordedPhraseUrls(text: string): string[] {
  const normalized = (value: string) => value
    .normalize("NFC").toLocaleLowerCase("es")
    .replace(/[^a-z0-9ñáéíóúü]+/g, " ").trim().replace(/\s+/g, " ");
  const target = normalized(text);
  if (!target) return [];
  return existingCatalog.assets
    .filter(asset => asset.playback_status === "approved_clean" && normalized(asset.phrase_es) === target)
    .map(asset => asset.path)
    .filter(url => /^\/audio\/gretel\/clips\/rec_[A-Za-z0-9_-]+\.mp3$/.test(url));
}


export type GretelRecording = {
  clip_id: string;
  text: string;
  page: string;
  lesson: string;
  category: string;
  urls: string[];
  status?: string;
  audio_verified?: boolean;
};

/** Existing owner-recorded audio only. Never use TTS or a guessed timestamp. */
function verifiedUrls(items: readonly GretelRecording[]): string[] {
  return items
    .filter((item) => item.status === "approved" && item.audio_verified === true)
    .flatMap((item) => item.urls)
    .filter((url) => /^\/audio\/gretel\/clips\/[A-Za-z0-9_-]+\.mp3$/.test(url));
}

export function pageRecordingUrls(page: number, items: readonly GretelRecording[]): string[] {
  if (!Number.isInteger(page) || page < 1 || page > 90 || page === 86 || page === 87) return [];
  // Page vocabulary (762 original script entries) must not be silently excluded.
  // Any category is usable only when the precise original recording is approved.
  return verifiedUrls(items.filter((item) => Number(item.page) === page));
}

/** Lesson introductions have a lesson ID but deliberately no individual page. */
export function lessonIntroRecordingUrls(lesson: number, items: readonly GretelRecording[]): string[] {
  if (!Number.isInteger(lesson) || lesson < 1 || lesson > 24) return [];
  return verifiedUrls(items.filter((item) =>
    Number(item.lesson) === lesson &&
    item.category === "02_entradas_24_lecciones" &&
    !item.page
  ));
}

export function availablePageRecordingUrls(page: number): string[] {
  return pageRecordingUrls(page, manifest.entries as GretelRecording[]);
}
export function availableLessonIntroRecordingUrls(lesson: number): string[] {
  return lessonIntroRecordingUrls(lesson, manifest.entries as GretelRecording[]);
}

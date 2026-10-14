import manifest from "@/data/gretel-recorded-manifest.json";
export type GretelRecording = { clip_id: string; text: string; page: string; lesson: string; category: string; urls: string[] };
const PAGE_CATEGORIES = new Set(["03_workbook_instrucciones_verbatim","04_fonetica","05_lectura_vocabulario","06_lectura_texto_continuo","06_lectura_oraciones"]);
export function pageRecordingUrls(page: number, items: readonly GretelRecording[]): string[] {
  if (!Number.isInteger(page) || page < 1 || page > 90 || page === 86 || page === 87) return [];
  return items.filter(x => Number(x.page) === page && PAGE_CATEGORIES.has(x.category))
    .flatMap(x => x.urls).filter(url => /^\/audio\/gretel\/clips\/[A-Za-z0-9_-]+\.mp3$/.test(url));
}
export function availablePageRecordingUrls(page: number): string[] {
  return pageRecordingUrls(page, manifest.entries as GretelRecording[]);
}

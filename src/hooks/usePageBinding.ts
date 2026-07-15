import bindings from "@/content/page-bindings.json";

export type PageBindingKind = "intro" | "syllable-tap" | "word-match" | "drag-build" | "reading";

export type PageBinding = {
  lessonN: number;
  kind: PageBindingKind;
};

const TABLE = bindings as unknown as Record<string, PageBinding>;

/**
 * Returns the exercise binding for a given workbook page number, or null if
 * the page has no binding. Pure lookup — no React state.
 */
export function usePageBinding(pageNumber: number | undefined): PageBinding | null {
  if (pageNumber == null) return null;
  const b = TABLE[String(pageNumber)];
  return b ?? null;
}

export function getPageBinding(pageNumber: number | undefined): PageBinding | null {
  return usePageBinding(pageNumber);
}

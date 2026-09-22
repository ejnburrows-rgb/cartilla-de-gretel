export type GretelGuideRegion = {
  regionType: string;
  text?: string;
};

export function buildGretelPageLine(
  regions: readonly GretelGuideRegion[] | null | undefined,
  pageNumber: number,
): string {
  const instructions = Array.from(
    new Set(
      (regions ?? [])
        .filter((region) => region.regionType === "instruction" && region.text?.trim())
        .map((region) => region.text!.trim()),
    ),
  );

  if (instructions.length > 0) return instructions.join(" ");
  return `Página ${pageNumber}. Mira con atención y sigue las indicaciones.`;
}

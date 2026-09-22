export type GretelGuideRegion = {
  regionType: string;
  text?: string;
};

export function buildGretelPageLine(
  regions: readonly GretelGuideRegion[] | null | undefined,
  pageNumber: number,
): string {
  const instruction = regions
    ?.find((region) => region.regionType === "instruction" && region.text?.trim())
    ?.text?.trim();

  if (instruction) return instruction;
  return `Página ${pageNumber}. Mira con atención y sigue las indicaciones.`;
}

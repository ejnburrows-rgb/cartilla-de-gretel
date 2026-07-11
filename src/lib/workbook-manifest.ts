/**
 * workbook-manifest.ts
 *
 * Types and accessors for the unified workbook manifest (`workbook-manifest.json`).
 */

import manifestJson from "@/data/workbook-manifest.json";

export type WorkbookManifestItemType =
  | "TapSelect"
  | "TapToHear"
  | "DragPlace"
  | "PairMatch"
  | "MarkCircle";

export interface WorkbookManifestIllustration {
  id: string;
  label: string;
  src: string;
  xPercent?: number;
  yPercent?: number;
  widthPercent?: number;
  heightPercent?: number;
  alt?: string;
}

export interface WorkbookManifestInteraction {
  id: string;
  type: WorkbookManifestItemType;
  prompt: string;
  label: string;
  targetId?: string;
  options?: string[];
  correctAnswer?: string;
  xPercent?: number;
  yPercent?: number;
  widthPercent?: number;
  heightPercent?: number;
  audioText?: string;
}

export interface WorkbookManifestPage {
  pageNumber: number;
  lessonNumber: number;
  pageType: string;
  title: string;
  instruction: string;
  backgroundAsset: string;
  illustrations: WorkbookManifestIllustration[];
  interactions: WorkbookManifestInteraction[];
}

export interface WorkbookManifest {
  version: string;
  builtAt: string;
  totalPages: number;
  pages: WorkbookManifestPage[];
}

const manifest = manifestJson as unknown as WorkbookManifest;

/**
 * Returns the entire workbook manifest object.
 */
export function getWorkbookManifest(): WorkbookManifest {
  return manifest;
}

/**
 * Returns all workbook manifest pages (1..90).
 */
export function getAllWorkbookPages(): WorkbookManifestPage[] {
  return manifest.pages || [];
}

/**
 * Alias for getAllWorkbookPages.
 */
export function getAllWorkbookManifestPages(): WorkbookManifestPage[] {
  return manifest.pages || [];
}

/**
 * Retrieves a specific workbook page by physical page number.
 */
export function getWorkbookManifestPage(
  pageNumber: number,
): WorkbookManifestPage | undefined {
  return manifest.pages.find((p) => p.pageNumber === pageNumber);
}

/**
 * Retrieves all workbook pages belonging to a specific lesson number (1..24).
 */
export function getWorkbookPagesForLesson(
  lessonNumber: number,
): WorkbookManifestPage[] {
  return manifest.pages.filter((p) => p.lessonNumber === lessonNumber);
}

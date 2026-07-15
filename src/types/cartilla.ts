/**
 * Central type re-exports for the Cartilla domain. Import from here in new
 * code; existing components still import directly from the underlying modules
 * and do not need to be migrated (zero behavior change).
 */

export type {
  BookFaithfulLesson,
  SightWordEntry,
  EditorialNote,
  BookMeta,
  ClosingExerciseKind,
} from "@/lib/book-faithful";

export type {
  VowelLesson,
  VocabWord,
  MatchPair,
  CheckboxItem,
  MiamiQuestion,
} from "@/lib/cartilla-content";

export type { CatalogEntry, ConsonantLessonData } from "@/lib/lesson-catalog";

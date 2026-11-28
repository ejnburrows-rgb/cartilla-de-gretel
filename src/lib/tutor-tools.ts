/**
 * Typed, allowlisted application tools for Gretel Tutor (Milestone 7).
 *
 * Security & correctness invariants:
 * - Only the 17 allowlisted commands on canonical curriculum IDs may execute.
 * - Strictly student-only role (`role === "student"`). Teacher/admin roles
 *   and privileged actions are always rejected.
 * - No arbitrary JavaScript, external URLs, filesystem paths, or database
 *   commands are accepted in any argument.
 * - Printed workbook page numbers are kept strictly separate from PDF sheets,
 *   and pages 86–87 (`absent-in-source`) return `status: "unavailable"`.
 * - Audio playback only accepts owner-approved recordings (never pending,
 *   rejected, or device TTS).
 * - Every call returns an explicit `{ status: "ok" | "error" | "unavailable", ... }`.
 */
import artBoundsJson from "@/data/flipchart-art-content-bounds.json";
import artPlacementJson from "@/data/flipchart-art-placement.json";
import { PAYASO_CHANO_SS } from "@/content/games/payaso-chano-ss";
import { SYLLABLE_BUILDER_PILOT } from "@/content/games/syllable-builder-pilot";
import { CORE_THEMED_GAMES } from "@/content/games/core-games";
import { COMPLETAR_PALABRAS_M } from "@/content/games/completar-palabras";
import { COW_GAMES } from "@/content/games/cow-game";
import { isRejectedAudioSource } from "@/content/tutor-dialogue/schema";
import {
  FLIPCHART_PAGES,
  getFirstFlipchartPageForLesson,
  getFlipchartPagesForLesson,
  type FlipchartPage,
} from "@/lib/flipchart-hd";
import { getReplicaSheet, REPLICA_WIDTH } from "@/lib/flipchart-replica";
import type { GameContent } from "@/lib/games/gameContent";
import {
  ALL_CURRICULUM_LESSONS,
  itemsForLesson,
  lessonGraphFor,
  tutorItems,
  type TutorItem,
  type TutorLessonGraph,
} from "@/lib/tutor-content";
import { getDialogueEntry, getPlayableEntries } from "@/lib/tutor-dialogue-manifest";
import { matchTarget, normalize, type MatchResult } from "@/lib/tutor-match";
import { readTutorProgress, type TutorProgressEvent } from "@/lib/tutor-progress";
import {
  isWorkbookPageSourceBlocked,
  lessonForWorkbookPage,
  WORKBOOK_PAGE_COUNT,
} from "@/lib/workbook-pages";

// ---------------------------------------------------------------------------
// Core allowlists & types
// ---------------------------------------------------------------------------

export const TUTOR_TOOL_NAMES = [
  "getLearningContext",
  "getVerifiedCurriculum",
  "openLesson",
  "openWorkbookPage",
  "openFlipchartSheet",
  "highlightRegion",
  "showIllustration",
  "demonstrateLetter",
  "launchGame",
  "playApprovedRecording",
  "giveHint",
  "checkSupportedAnswer",
  "getAuthorizedProgress",
  "resume",
  "repeat",
  "changeLayout",
  "completeSession",
] as const;

export type TutorToolName = (typeof TUTOR_TOOL_NAMES)[number];

const ALLOWED_TOOL_SET: ReadonlySet<string> = new Set(TUTOR_TOOL_NAMES);

export const TUTOR_LAYOUT_MODES = ["call", "split", "flipchart-pip", "practice"] as const;
export type TutorLayoutMode = (typeof TUTOR_LAYOUT_MODES)[number];
const ALLOWED_LAYOUT_SET: ReadonlySet<string> = new Set(TUTOR_LAYOUT_MODES);

export type TutorSessionPhase =
  | "preparing"
  | "ready"
  | "listening"
  | "thinking"
  | "speaking"
  | "presenting"
  | "waiting"
  | "analyzing"
  | "recovering"
  | "ended";

export type FlipchartCueTiming = "before" | "atStart" | "atWord";
const ALLOWED_CUE_TIMINGS: ReadonlySet<string> = new Set<FlipchartCueTiming>([
  "before",
  "atStart",
  "atWord",
]);

export type TutorToolErrorCode =
  | "forbidden-role"
  | "disallowed-command"
  | "unsafe-argument"
  | "invalid-argument"
  | "invalid-state"
  | "not-found";

export type TutorToolUnavailableCode =
  | "absent-in-source"
  | "audio-not-approved"
  | "answer-key-pending"
  | "no-flipchart-sheet"
  | "no-last-recording"
  | "game-unavailable";

export interface TutorToolOk<T = Record<string, unknown>> {
  status: "ok";
  command: TutorToolName;
  code: "ok";
  message: string;
  data: T;
}

export interface TutorToolError {
  status: "error";
  command: string;
  code: TutorToolErrorCode;
  message: string;
}

export interface TutorToolUnavailable {
  status: "unavailable";
  command: TutorToolName;
  code: TutorToolUnavailableCode;
  message: string;
  data?: Record<string, unknown>;
}

export type TutorToolResult<T = Record<string, unknown>> =
  | TutorToolOk<T>
  | TutorToolError
  | TutorToolUnavailable;

export interface TutorToolContext {
  /** Must be strictly `"student"`; teacher/admin roles are rejected. */
  role: unknown;
  /** Anonymous student session ID (never exposes other learners' progress). */
  sessionId: string;
  /** Active curriculum lesson (1–24). */
  lesson: number;
  /** Current session lifecycle phase. */
  phase: TutorSessionPhase;
  /** Current presentation mode (A: call, B: split, C: flipchart-pip, D: practice). */
  layout: TutorLayoutMode;
  /** Active printed workbook page (1–90), strictly separate from PDF sheets. */
  workbookPage?: number | null;
  /** Active flipchart sheet number (1–62). */
  flipchartSheet?: number | null;
  /** Currently active canonical curriculum item ID. */
  activeItemId?: string | null;
  /** Currently active canonical game ID. */
  activeGameId?: string | null;
  /** Last spoken approved recording lineId (used by `repeat`). */
  lastSpokenLineId?: string | null;
  /** Currently highlighted region ID on the flipchart. */
  highlightedRegionId?: string | null;
}

// ---------------------------------------------------------------------------
// Command discriminated union
// ---------------------------------------------------------------------------

export type TutorToolCommand =
  | { command: "getLearningContext"; args?: Record<string, never> }
  | { command: "getVerifiedCurriculum"; args?: { lesson?: number } }
  | { command: "openLesson"; args: { lesson: number } }
  | { command: "openWorkbookPage"; args: { printedPage: number } }
  | { command: "openFlipchartSheet"; args: { sheetNumber: number } }
  | {
      command: "highlightRegion";
      args: {
        sheetNumber: number;
        regionId?: string;
        word?: string;
        letter?: string;
        cueTiming?: FlipchartCueTiming;
        atSeconds?: number;
        endSeconds?: number;
        lineId?: string;
      };
    }
  | {
      command: "showIllustration";
      args: {
        word: string;
        sheetNumber?: number;
        lesson?: number;
        cueTiming?: FlipchartCueTiming;
      };
    }
  | { command: "demonstrateLetter"; args: { letter: string; lesson?: number } }
  | { command: "launchGame"; args: { gameId: string } }
  | { command: "playApprovedRecording"; args: { lineId: string } }
  | { command: "giveHint"; args: { itemId?: string; level?: 1 | 2 | 3 } }
  | {
      command: "checkSupportedAnswer";
      args: {
        itemId?: string;
        gameId?: string;
        response: string;
        alternatives?: string[];
      };
    }
  | { command: "getAuthorizedProgress"; args?: { lesson?: number } }
  | { command: "resume"; args?: Record<string, never> }
  | { command: "repeat"; args?: { lineId?: string } }
  | { command: "changeLayout"; args: { layout: TutorLayoutMode } }
  | { command: "completeSession"; args?: { reason?: "completed" | "student-exit" | "idle-timeout" } };

// ---------------------------------------------------------------------------
// Verified Flip Chart regions & cue scheduling
// ---------------------------------------------------------------------------

/** [x, y, w, h, score] in 1000-unit-wide sheet coordinates. */
type ArtPlacementTuple = [number, number, number, number, number];
/** [naturalW, naturalH, left, top, width, height] drawn content bounds. */
type ArtContentBoundsTuple = [number, number, number, number, number, number];

const ART_PLACEMENT = artPlacementJson as unknown as Record<string, ArtPlacementTuple>;
const ART_CONTENT_BOUNDS = artBoundsJson as unknown as Record<string, ArtContentBoundsTuple>;

export interface FlipchartHighlightRegion {
  regionId: string;
  sheetNumber: number;
  kind: "art" | "scene" | "letter" | "vowel" | "syllable" | "word" | "verse" | "title";
  label: string;
  /** Sheet-space coordinates (1000-unit width). */
  x: number;
  y: number;
  w: number;
  h: number;
  sheetWidth: number;
  sheetHeight: number;
  /** Responsive overlay percentages (0–100). */
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  src?: string;
  placementScore?: number;
  contentBoundsVerified: boolean;
}

export interface FlipchartChoreographyCue {
  cueId: string;
  sheetNumber: number;
  regionId: string;
  cueTiming: FlipchartCueTiming;
  lineId?: string;
  /** Used when `cueTiming === "atWord"`. */
  atSeconds?: number;
  endSeconds?: number;
  label?: string;
}

export interface FlipchartPlaybackBoundary {
  isPlaying: boolean;
  currentTime: number;
  lineId: string | null;
}

function slugToken(value: string): string {
  return normalize(value).replace(/[^a-zñ0-9]+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
}

function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value * 1000) / 1000));
}

function toPctBox(
  x: number,
  y: number,
  w: number,
  h: number,
  sheetWidth: number,
  sheetHeight: number,
): { xPct: number; yPct: number; wPct: number; hPct: number } {
  return {
    xPct: clampPct((x / sheetWidth) * 100),
    yPct: clampPct((y / sheetHeight) * 100),
    wPct: clampPct((w / sheetWidth) * 100),
    hPct: clampPct((h / sheetHeight) * 100),
  };
}

/**
 * Extract verified highlight regions for a Flip Chart sheet using
 * `flipchart-art-placement.json`, `flipchart-art-content-bounds.json`, and
 * the canonical replica geometry (`getReplicaSheet`).
 */
export function resolveVerifiedFlipchartRegions(sheetNumber: number): FlipchartHighlightRegion[] {
  if (!Number.isInteger(sheetNumber) || sheetNumber < 1 || sheetNumber > 62) return [];
  const sheet = getReplicaSheet(sheetNumber);
  const sheetWidth = sheet?.width ?? REPLICA_WIDTH;
  const sheetHeight = sheet?.height ?? 1380;
  const regions: FlipchartHighlightRegion[] = [];
  const seenIds = new Set<string>();

  const pagePrefix = `/cartilla/art/optimized/flipchart-native/p${String(sheetNumber).padStart(3, "0")}-`;

  // 1. Verified artwork placements from flipchart-art-placement.json + content bounds
  for (const [src, tuple] of Object.entries(ART_PLACEMENT)) {
    if (!src.startsWith(pagePrefix)) continue;
    const [x, y, w, h, score] = tuple;
    const bounds = ART_CONTENT_BOUNDS[src];
    const filename = src.slice(pagePrefix.length).replace(/\.[^.]+$/, "");
    const isScene = filename === "scene";
    const replicaMatch = sheet?.art.find((item) => item.src === src);
    const label = replicaMatch?.word ?? filename;
    const regionId = isScene
      ? `sheet-${sheetNumber}:scene`
      : `sheet-${sheetNumber}:art:${slugToken(filename)}`;
    if (seenIds.has(regionId)) continue;
    seenIds.add(regionId);

    // Content bounds verify the artwork actually contains drawn pixels inside the placement box.
    const contentBoundsVerified = Boolean(
      bounds && bounds[0] > 0 && bounds[1] > 0 && bounds[4] > 0 && bounds[5] > 0,
    );

    regions.push({
      regionId,
      sheetNumber,
      kind: isScene ? "scene" : "art",
      label,
      x,
      y,
      w,
      h,
      sheetWidth,
      sheetHeight,
      ...toPctBox(x, y, w, h, sheetWidth, sheetHeight),
      src,
      placementScore: score,
      contentBoundsVerified,
    });
  }

  // 2. Replica art items not already covered by ART_PLACEMENT (e.g., productionArt overrides)
  if (sheet) {
    for (const art of sheet.art) {
      const slug = art.scene ? "scene" : slugToken(art.word);
      const regionId = art.scene
        ? `sheet-${sheetNumber}:scene`
        : `sheet-${sheetNumber}:art:${slug}`;
      if (seenIds.has(regionId)) continue;
      seenIds.add(regionId);
      const bounds = ART_CONTENT_BOUNDS[art.src];
      const placement = ART_PLACEMENT[art.src];
      const x = placement ? placement[0] : art.x;
      const y = placement ? placement[1] : art.y;
      const w = placement ? placement[2] : art.w;
      const h = placement ? placement[3] : art.h;
      regions.push({
        regionId,
        sheetNumber,
        kind: art.scene ? "scene" : "art",
        label: art.word,
        x,
        y,
        w,
        h,
        sheetWidth,
        sheetHeight,
        ...toPctBox(x, y, w, h, sheetWidth, sheetHeight),
        src: art.src,
        placementScore: placement?.[4],
        contentBoundsVerified: Boolean(bounds && bounds[4] > 0 && bounds[5] > 0),
      });
    }

    // 3. Verified text tokens from the replica sheet (letters, vowels, syllables, words, verses)
    for (const token of sheet.tokens) {
      const kind: FlipchartHighlightRegion["kind"] =
        token.kind === "crescent" || token.kind === "syllable"
          ? "syllable"
          : token.kind === "chip"
            ? "word"
            : token.kind;
      const regionId = `sheet-${sheetNumber}:token:${token.id}`;
      if (seenIds.has(regionId)) continue;
      seenIds.add(regionId);
      const padX = Math.max(8, token.fontSize * 0.25);
      const padY = Math.max(6, token.fontSize * 0.2);
      const x = Math.max(0, token.x - padX);
      const y = Math.max(0, token.y - padY);
      const w = Math.min(sheetWidth - x, Math.max(token.w, token.fitW) + padX * 2);
      const h = Math.min(sheetHeight - y, Math.max(token.h, token.fontSize * 1.15) + padY * 2);
      regions.push({
        regionId,
        sheetNumber,
        kind,
        label: token.text,
        x,
        y,
        w,
        h,
        sheetWidth,
        sheetHeight,
        ...toPctBox(x, y, w, h, sheetWidth, sheetHeight),
        contentBoundsVerified: true,
      });
    }
  }

  return regions;
}

/** Look up a verified region by exact regionId, word, or taught letter on a sheet. */
export function findVerifiedFlipchartRegion(
  sheetNumber: number,
  query: { regionId?: string; word?: string; letter?: string },
): FlipchartHighlightRegion | null {
  const regions = resolveVerifiedFlipchartRegions(sheetNumber);
  if (regions.length === 0) return null;

  if (query.regionId) {
    const exact = regions.find((r) => r.regionId === query.regionId);
    if (exact) return exact;
  }

  if (query.word) {
    const target = normalize(query.word);
    // Prefer verified illustration art first, then word/syllable token.
    const artMatch = regions.find(
      (r) => (r.kind === "art" || r.kind === "scene") && normalize(r.label) === target,
    );
    if (artMatch) return artMatch;
    const tokenMatch = regions.find((r) => normalize(r.label) === target);
    if (tokenMatch) return tokenMatch;
  }

  if (query.letter) {
    const target = normalize(query.letter);
    const letterMatch = regions.find(
      (r) =>
        (r.kind === "letter" || r.kind === "vowel") &&
        (normalize(r.label) === target ||
          normalize(r.label).split(/\s+/).includes(target) ||
          normalize(r.label) === `${target}${target}`),
    );
    if (letterMatch) return letterMatch;
  }

  return null;
}

/**
 * Pure cue scheduler driven by real playback boundaries (`audio.currentTime`).
 * - `"before"`: active immediately (before speech starts and during speech)
 * - `"atStart"`: active as soon as playback begins (`isPlaying` or `currentTime > 0`)
 * - `"atWord"`: active once `currentTime >= (cue.atSeconds ?? 0)` and before `endSeconds`
 */
export function resolveActiveFlipchartCues(
  cues: readonly FlipchartChoreographyCue[],
  playback: FlipchartPlaybackBoundary,
): FlipchartChoreographyCue[] {
  return cues.filter((cue) => {
    if (cue.lineId && playback.lineId && cue.lineId !== playback.lineId) {
      // Allow `"before"` cues to show while preparing the upcoming line even if
      // another lineId has not started yet, but never collide with a different playing line.
      if (playback.isPlaying) return false;
    }

    switch (cue.cueTiming) {
      case "before":
        if (
          typeof cue.endSeconds === "number" &&
          playback.isPlaying &&
          playback.currentTime > cue.endSeconds
        ) {
          return false;
        }
        return true;

      case "atStart":
        if (!playback.isPlaying && playback.currentTime <= 0) return false;
        if (typeof cue.endSeconds === "number" && playback.currentTime > cue.endSeconds) {
          return false;
        }
        return true;

      case "atWord": {
        if (!playback.isPlaying && playback.currentTime <= 0) return false;
        const start = typeof cue.atSeconds === "number" && cue.atSeconds >= 0 ? cue.atSeconds : 0;
        if (playback.currentTime < start) return false;
        if (typeof cue.endSeconds === "number" && playback.currentTime > cue.endSeconds) {
          return false;
        }
        return true;
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Canonical Game Registry (read directly from src/content/games/*)
// ---------------------------------------------------------------------------

export const LIVE_TUTOR_GAMES: readonly GameContent[] = [
  PAYASO_CHANO_SS,
  ...SYLLABLE_BUILDER_PILOT,
  ...CORE_THEMED_GAMES,
  COMPLETAR_PALABRAS_M,
  ...COW_GAMES,
];

const GAMES_BY_ID = new Map<string, GameContent>(LIVE_TUTOR_GAMES.map((g) => [g.id, g]));

export function getTutorGameById(gameId: string): GameContent | undefined {
  return GAMES_BY_ID.get(gameId);
}

export function getTutorGamesForLesson(lesson: number): readonly GameContent[] {
  const graph = lessonGraphFor(lesson);
  if (!graph) return [];
  const games: GameContent[] = [];
  for (const ref of graph.games) {
    const game = GAMES_BY_ID.get(ref.id);
    if (game) games.push(game);
  }
  return games;
}

// ---------------------------------------------------------------------------
// Canonical taught-letter map (Cartilla sequence, Lessons 2–24)
// ---------------------------------------------------------------------------

const CANONICAL_LETTER_LESSON: Readonly<Record<string, number>> = {
  o: 2,
  a: 3,
  i: 4,
  u: 5,
  e: 6,
  m: 7,
  p: 8,
  s: 9,
  t: 10,
  d: 11,
  l: 12,
  n: 13,
  c: 14,
  q: 14,
  r: 15,
  rr: 16,
  b: 17,
  v: 17,
  f: 18,
  g: 19,
  j: 20,
  h: 21,
  ñ: 22,
  ch: 23,
  ll: 23,
  y: 23,
  z: 24,
  k: 24,
  w: 24,
  x: 24,
};

// ---------------------------------------------------------------------------
// Safety & validation helpers
// ---------------------------------------------------------------------------

const UNSAFE_STRING_PATTERN =
  /(?:https?:\/\/|javascript:|data:|vbscript:|file:\/\/|\/\/|\.\.[\\/]|<script|\beval\s*\(|\bFunction\s*\(|\bdrop\s+table\b|\bdelete\s+from\b|\binsert\s+into\b|\bupdate\s+\w+\s+set\b|;\s*--)/i;

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function hasSqlSelectFrom(value: string): boolean {
  const selectMatch = /\bselect\s/i.exec(value);
  if (!selectMatch) return false;
  const tail = value.slice(selectMatch.index + selectMatch[0].length);
  return /\sfrom\b/i.test(tail);
}

function containsUnsafeInput(value: unknown, depth = 0): boolean {
  if (depth > 6) return true;
  if (typeof value === "string") {
    return UNSAFE_STRING_PATTERN.test(value) || hasSqlSelectFrom(value);
  }
  if (Array.isArray(value)) {
    return value.some((item) => containsUnsafeInput(item, depth + 1));
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (FORBIDDEN_KEYS.has(key)) return true;
      if (containsUnsafeInput((value as Record<string, unknown>)[key], depth + 1)) {
        return true;
      }
    }
  }
  return false;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function isValidLesson(lesson: unknown): lesson is number {
  return (
    typeof lesson === "number" &&
    Number.isInteger(lesson) &&
    lesson >= 1 &&
    lesson <= ALL_CURRICULUM_LESSONS.length
  );
}

const FLIPCHART_PAGE_BY_NUMBER = new Map<number, FlipchartPage>(
  FLIPCHART_PAGES.map((p) => [p.flipchartPage, p]),
);

const ITEM_BY_ID = new Map<string, TutorItem>(tutorItems.map((item) => [item.id, item]));

// ---------------------------------------------------------------------------
// Host interface for TutorCallShell wiring
// ---------------------------------------------------------------------------

export interface TutorToolHost {
  onOpenLesson?: (lesson: number) => void;
  onOpenWorkbookPage?: (printedPage: number, lesson: number) => void;
  onOpenFlipchartSheet?: (sheetNumber: number, lesson: number) => void;
  onHighlightRegion?: (cue: FlipchartChoreographyCue, region: FlipchartHighlightRegion) => void;
  onShowIllustration?: (payload: {
    src: string;
    word: string;
    sheetNumber: number;
    region: FlipchartHighlightRegion | null;
    cueTiming: FlipchartCueTiming;
  }) => void;
  onDemonstrateLetter?: (payload: {
    letter: string;
    lesson: number;
    flipchartSheet: number | null;
    region: FlipchartHighlightRegion | null;
  }) => void;
  onLaunchGame?: (game: GameContent, lesson: number) => void;
  onPlayApprovedRecording?: (payload: {
    lineId: string;
    text: string;
    src: string;
    visemes: string | null;
  }) => void;
  onChangeLayout?: (layout: TutorLayoutMode) => void;
  onResume?: () => void;
  onRepeat?: (lineId: string) => void;
  onCompleteSession?: (payload: {
    sessionId: string;
    lesson: number;
    reason: "completed" | "student-exit" | "idle-timeout";
  }) => void;
}

// ---------------------------------------------------------------------------
// Pedagogical hint helper (grounded strictly in canonical curriculum item)
// ---------------------------------------------------------------------------

function buildBoundedHint(item: TutorItem, level: 1 | 2 | 3): {
  level: 1 | 2 | 3;
  itemId: string;
  hintText: string;
  visualCue: string;
} {
  const clean = item.text.trim();
  const firstChar = Array.from(clean)[0] ?? "";
  if (item.kind === "vowel") {
    if (level === 1) {
      return {
        level,
        itemId: item.id,
        hintText: `Escucha con calma el sonido de la vocal "${clean}".`,
        visualCue: clean,
      };
    }
    if (level === 2) {
      return {
        level,
        itemId: item.id,
        hintText: `Mira la forma de la letra ${clean.toUpperCase()} ${clean.toLowerCase()} y repítela despacio.`,
        visualCue: `${clean.toUpperCase()} ${clean.toLowerCase()}`,
      };
    }
    return {
      level,
      itemId: item.id,
      hintText: `Di conmigo: "${clean}".`,
      visualCue: clean,
    };
  }

  if (level === 1) {
    return {
      level,
      itemId: item.id,
      hintText: `Fíjate en el primer sonido: empieza con "${firstChar}".`,
      visualCue: `${firstChar}…`,
    };
  }
  if (level === 2) {
    const prefix = Array.from(clean).slice(0, Math.min(2, clean.length)).join("");
    return {
      level,
      itemId: item.id,
      hintText: `Empieza con "${prefix}" y sigue leyendo hasta el final.`,
      visualCue: `${prefix}…`,
    };
  }
  return {
    level,
    itemId: item.id,
    hintText: `Escucha y repite conmigo: "${clean}".`,
    visualCue: clean,
  };
}

// ---------------------------------------------------------------------------
// Main executor
// ---------------------------------------------------------------------------

function err(command: string, code: TutorToolErrorCode, message: string): TutorToolError {
  return { status: "error", command, code, message };
}

function unavail(
  command: TutorToolName,
  code: TutorToolUnavailableCode,
  message: string,
  data?: Record<string, unknown>,
): TutorToolUnavailable {
  return data
    ? { status: "unavailable", command, code, message, data }
    : { status: "unavailable", command, code, message };
}

function ok<T>(command: TutorToolName, message: string, data: T): TutorToolOk<T> {
  return { status: "ok", command, code: "ok", message, data };
}

const ENDED_BLOCKED_COMMANDS: ReadonlySet<TutorToolName> = new Set([
  "openLesson",
  "openWorkbookPage",
  "openFlipchartSheet",
  "highlightRegion",
  "showIllustration",
  "demonstrateLetter",
  "launchGame",
  "playApprovedRecording",
  "giveHint",
  "checkSupportedAnswer",
  "repeat",
  "changeLayout",
]);

/**
 * Execute one allowlisted tutor tool command with strict student-only role
 * enforcement, argument validation, canonical ID checks, and explicit status.
 */
export function executeTutorTool(
  rawCommand: unknown,
  context: TutorToolContext,
  host?: TutorToolHost,
): TutorToolResult {
  // 1. Validate command envelope & allowlist
  if (!isPlainRecord(rawCommand) || typeof rawCommand.command !== "string") {
    return err("unknown", "invalid-argument", "El comando debe ser un objeto con un nombre válido.");
  }

  const commandName = rawCommand.command;
  if (!ALLOWED_TOOL_SET.has(commandName)) {
    return err(
      commandName,
      "disallowed-command",
      `Comando no permitido: "${commandName}". Solo se aceptan comandos canónicos del tutor.`,
    );
  }
  const command = commandName as TutorToolName;

  // 2. Enforce student-only role (never teacher/admin)
  if (!context || context.role !== "student") {
    return err(
      command,
      "forbidden-role",
      "Las herramientas del tutor son solo para el rol de estudiante.",
    );
  }

  if (typeof context.sessionId !== "string" || context.sessionId.trim().length === 0) {
    return err(command, "invalid-state", "La sesión del estudiante requiere un sessionId válido.");
  }

  // 3. Reject arbitrary JS, URLs, path traversal, SQL, or prototype pollution
  const rawArgs = rawCommand.args;
  if (rawArgs !== undefined && !isPlainRecord(rawArgs)) {
    return err(command, "invalid-argument", "Los argumentos del comando deben ser un objeto.");
  }
  if (rawArgs !== undefined && containsUnsafeInput(rawArgs)) {
    return err(
      command,
      "unsafe-argument",
      "Argumento rechazado: no se permiten URLs, rutas arbitrarias ni código ejecutable.",
    );
  }
  const args = (rawArgs ?? {}) as Record<string, unknown>;

  // 4. Validate session phase for mutating/interactive commands
  if (context.phase === "ended" && ENDED_BLOCKED_COMMANDS.has(command)) {
    return err(
      command,
      "invalid-state",
      "La sesión ya terminó. Usa 'resume' antes de continuar.",
    );
  }

  // 5. Dispatch allowlisted commands
  switch (command) {
    case "getLearningContext": {
      const graph = lessonGraphFor(context.lesson);
      const activeItem = context.activeItemId ? ITEM_BY_ID.get(context.activeItemId) ?? null : null;
      return ok(command, "Contexto de aprendizaje actual.", {
        role: "student",
        sessionId: context.sessionId,
        lesson: context.lesson,
        lessonTitle: graph?.title ?? null,
        phase: context.phase,
        layout: context.layout,
        workbookPage: context.workbookPage ?? null,
        flipchartSheet: context.flipchartSheet ?? null,
        activeItemId: activeItem?.id ?? null,
        activeItemText: activeItem?.text ?? null,
        activeGameId: context.activeGameId ?? null,
        highlightedRegionId: context.highlightedRegionId ?? null,
        lastSpokenLineId: context.lastSpokenLineId ?? null,
      });
    }

    case "getVerifiedCurriculum": {
      const targetLesson = args.lesson !== undefined ? args.lesson : context.lesson;
      if (!isValidLesson(targetLesson)) {
        return err(command, "invalid-argument", "El número de lección debe ser un entero entre 1 y 24.");
      }
      const graph = lessonGraphFor(targetLesson);
      if (!graph) {
        return err(command, "not-found", `No se encontró el currículo de la Lección ${targetLesson}.`);
      }
      return ok(command, `Currículo verificado de la Lección ${targetLesson}.`, {
        ...graph,
      });
    }

    case "openLesson": {
      const lesson = args.lesson;
      if (!isValidLesson(lesson)) {
        return err(command, "invalid-argument", "openLesson requiere un número de lección entero (1–24).");
      }
      const graph = lessonGraphFor(lesson);
      if (!graph) {
        return err(command, "not-found", `Lección ${lesson} no encontrada.`);
      }
      const firstFlipchart = getFirstFlipchartPageForLesson(lesson);
      const firstWorkbookPage =
        graph.printedWorkbookPages.pages.find((p) => !isWorkbookPageSourceBlocked(p)) ?? null;
      host?.onOpenLesson?.(lesson);
      return ok(command, `Lección ${lesson} abierta.`, {
        lesson,
        lessonId: graph.lessonId,
        title: graph.title,
        firstWorkbookPage,
        firstFlipchartSheet: firstFlipchart,
        itemCount: itemsForLesson(lesson).length,
      });
    }

    case "openWorkbookPage": {
      const printedPage = args.printedPage;
      if (
        typeof printedPage !== "number" ||
        !Number.isInteger(printedPage) ||
        printedPage < 1 ||
        printedPage > WORKBOOK_PAGE_COUNT
      ) {
        return err(
          command,
          "invalid-argument",
          `openWorkbookPage requiere una página impresa entera entre 1 y ${WORKBOOK_PAGE_COUNT}.`,
        );
      }
      if (isWorkbookPageSourceBlocked(printedPage)) {
        return unavail(
          command,
          "absent-in-source",
          `La página impresa ${printedPage} está marcada como absent-in-source en las fuentes originales.`,
          { printedPage, status: "absent-in-source" },
        );
      }
      const lesson = lessonForWorkbookPage(printedPage);
      const graph = lessonGraphFor(lesson);
      const pageNode = graph?.pages.find((p) => p.printedPage === printedPage) ?? null;
      host?.onOpenWorkbookPage?.(printedPage, lesson);
      return ok(command, `Página impresa ${printedPage} del cuaderno abierta.`, {
        printedPage,
        pdfSheet: pageNode?.pdfSheet ?? null,
        lesson,
        exerciseId: pageNode?.exerciseId ?? null,
        exerciseKind: pageNode?.exerciseKind ?? null,
      });
    }

    case "openFlipchartSheet": {
      const sheetNumber = args.sheetNumber;
      if (typeof sheetNumber !== "number" || !Number.isInteger(sheetNumber)) {
        return err(command, "invalid-argument", "openFlipchartSheet requiere un número entero de lámina.");
      }
      const page = FLIPCHART_PAGE_BY_NUMBER.get(sheetNumber);
      if (!page) {
        return err(
          command,
          "not-found",
          `Lámina de rotafolio ${sheetNumber} fuera de rango canónico (1–62).`,
        );
      }
      const regions = resolveVerifiedFlipchartRegions(sheetNumber);
      host?.onOpenFlipchartSheet?.(sheetNumber, page.lesson);
      return ok(command, `Lámina ${sheetNumber} del rotafolio abierta.`, {
        sheetNumber,
        lesson: page.lesson,
        regionCount: regions.length,
      });
    }

    case "highlightRegion": {
      const sheetNumber = args.sheetNumber;
      if (typeof sheetNumber !== "number" || !Number.isInteger(sheetNumber)) {
        return err(command, "invalid-argument", "highlightRegion requiere sheetNumber entero.");
      }
      if (!FLIPCHART_PAGE_BY_NUMBER.has(sheetNumber)) {
        return err(command, "not-found", `Lámina de rotafolio ${sheetNumber} no encontrada.`);
      }
      const cueTimingRaw = args.cueTiming ?? "before";
      if (typeof cueTimingRaw !== "string" || !ALLOWED_CUE_TIMINGS.has(cueTimingRaw)) {
        return err(
          command,
          "invalid-argument",
          'cueTiming debe ser "before", "atStart" o "atWord".',
        );
      }
      const cueTiming = cueTimingRaw as FlipchartCueTiming;
      const regionId = typeof args.regionId === "string" ? args.regionId : undefined;
      const word = typeof args.word === "string" ? args.word : undefined;
      const letter = typeof args.letter === "string" ? args.letter : undefined;
      if (!regionId && !word && !letter) {
        return err(
          command,
          "invalid-argument",
          "highlightRegion requiere regionId, word o letter.",
        );
      }
      const atSeconds = typeof args.atSeconds === "number" && args.atSeconds >= 0 ? args.atSeconds : undefined;
      const endSeconds =
        typeof args.endSeconds === "number" && args.endSeconds >= 0 ? args.endSeconds : undefined;
      const lineId = typeof args.lineId === "string" && args.lineId.trim() ? args.lineId.trim() : undefined;

      const region = findVerifiedFlipchartRegion(sheetNumber, { regionId, word, letter });
      if (!region) {
        return err(
          command,
          "not-found",
          `No existe una región verificada en la lámina ${sheetNumber} para esa consulta.`,
        );
      }
      const cue: FlipchartChoreographyCue = {
        cueId: `${region.regionId}@${cueTiming}`,
        sheetNumber,
        regionId: region.regionId,
        cueTiming,
        ...(lineId ? { lineId } : {}),
        ...(atSeconds !== undefined ? { atSeconds } : {}),
        ...(endSeconds !== undefined ? { endSeconds } : {}),
        label: region.label,
      };
      host?.onHighlightRegion?.(cue, region);
      return ok(command, `Región "${region.label}" resaltada en lámina ${sheetNumber}.`, {
        cue,
        region,
      });
    }

    case "showIllustration": {
      const word = typeof args.word === "string" ? args.word.trim() : "";
      if (!word) {
        return err(command, "invalid-argument", "showIllustration requiere una palabra canónica.");
      }
      const cueTimingRaw = args.cueTiming ?? "before";
      if (typeof cueTimingRaw !== "string" || !ALLOWED_CUE_TIMINGS.has(cueTimingRaw)) {
        return err(command, "invalid-argument", 'cueTiming debe ser "before", "atStart" o "atWord".');
      }
      const cueTiming = cueTimingRaw as FlipchartCueTiming;

      const candidateSheets: number[] = [];
      if (typeof args.sheetNumber === "number" && Number.isInteger(args.sheetNumber)) {
        candidateSheets.push(args.sheetNumber);
      } else {
        const lesson = isValidLesson(args.lesson) ? args.lesson : context.lesson;
        for (const p of getFlipchartPagesForLesson(lesson)) {
          candidateSheets.push(p.flipchartPage);
        }
        if (context.flipchartSheet && !candidateSheets.includes(context.flipchartSheet)) {
          candidateSheets.unshift(context.flipchartSheet);
        }
      }

      let foundRegion: FlipchartHighlightRegion | null = null;
      for (const sheetNum of candidateSheets) {
        const match = findVerifiedFlipchartRegion(sheetNum, { word });
        if (match && match.src) {
          foundRegion = match;
          break;
        }
      }

      // Fallback search across all sheets if not on the current lesson's sheet
      if (!foundRegion && args.sheetNumber === undefined) {
        for (const page of FLIPCHART_PAGES) {
          const match = findVerifiedFlipchartRegion(page.flipchartPage, { word });
          if (match && match.src) {
            foundRegion = match;
            break;
          }
        }
      }

      if (!foundRegion || !foundRegion.src) {
        return err(
          command,
          "not-found",
          `No hay ilustración verificada en el rotafolio para "${word}".`,
        );
      }

      host?.onShowIllustration?.({
        src: foundRegion.src,
        word: foundRegion.label,
        sheetNumber: foundRegion.sheetNumber,
        region: foundRegion,
        cueTiming,
      });
      return ok(command, `Ilustración "${foundRegion.label}" mostrada.`, {
        src: foundRegion.src,
        word: foundRegion.label,
        sheetNumber: foundRegion.sheetNumber,
        region: foundRegion,
        cueTiming,
      });
    }

    case "demonstrateLetter": {
      const rawLetter = typeof args.letter === "string" ? args.letter.trim() : "";
      const normLetter = normalize(rawLetter);
      if (!normLetter || !(normLetter in CANONICAL_LETTER_LESSON)) {
        return err(
          command,
          "invalid-argument",
          `Letra no reconocida en el currículo canónico: "${rawLetter}".`,
        );
      }
      const lesson = isValidLesson(args.lesson) ? args.lesson : CANONICAL_LETTER_LESSON[normLetter]!;
      const flipchartSheet = getFirstFlipchartPageForLesson(lesson);
      const region = flipchartSheet
        ? findVerifiedFlipchartRegion(flipchartSheet, { letter: normLetter })
        : null;
      host?.onDemonstrateLetter?.({
        letter: normLetter,
        lesson,
        flipchartSheet,
        region,
      });
      return ok(command, `Demostración de la letra "${normLetter}" (Lección ${lesson}).`, {
        letter: normLetter,
        lesson,
        flipchartSheet,
        region,
      });
    }

    case "launchGame": {
      const gameId = typeof args.gameId === "string" ? args.gameId.trim() : "";
      if (!gameId) {
        return err(command, "invalid-argument", "launchGame requiere un gameId canónico.");
      }
      const game = GAMES_BY_ID.get(gameId);
      if (!game) {
        return err(command, "not-found", `Juego no encontrado en el registro canónico: "${gameId}".`);
      }
      host?.onLaunchGame?.(game, context.lesson);
      return ok(command, `Juego "${game.id}" iniciado en modo práctica.`, {
        gameId: game.id,
        gameType: game.type,
        letter: game.letter,
        wordCount: game.words.length,
        recommendedLayout: "practice" as TutorLayoutMode,
      });
    }

    case "playApprovedRecording": {
      const lineId = typeof args.lineId === "string" ? args.lineId.trim() : "";
      if (!lineId) {
        return err(command, "invalid-argument", "playApprovedRecording requiere un lineId canónico.");
      }
      const entry = getDialogueEntry(lineId);
      if (!entry) {
        return err(command, "not-found", `No existe línea de diálogo con lineId "${lineId}".`);
      }
      const src = entry.audio.src;
      if (entry.status !== "approved" || !src || isRejectedAudioSource(src)) {
        return unavail(
          command,
          "audio-not-approved",
          `La línea "${lineId}" no tiene grabación aprobada disponible (solo texto).`,
          { lineId, text: entry.text, status: entry.status },
        );
      }
      const payload = {
        lineId: entry.id,
        text: entry.text,
        src,
        visemes: entry.audio.visemes ?? null,
      };
      host?.onPlayApprovedRecording?.(payload);
      return ok(command, `Grabación aprobada "${entry.id}" lista para reproducir.`, payload);
    }

    case "giveHint": {
      const itemId =
        typeof args.itemId === "string" && args.itemId.trim()
          ? args.itemId.trim()
          : context.activeItemId ?? "";
      const item = itemId ? ITEM_BY_ID.get(itemId) : undefined;
      if (!item) {
        return err(
          command,
          "not-found",
          "giveHint requiere un itemId canónico activo del currículo.",
        );
      }
      const levelRaw = args.level ?? 1;
      if (levelRaw !== 1 && levelRaw !== 2 && levelRaw !== 3) {
        return err(command, "invalid-argument", "El nivel de pista debe ser 1, 2 o 3.");
      }
      const hint = buildBoundedHint(item, levelRaw);
      return ok(command, `Pista nivel ${levelRaw} para "${item.text}".`, hint);
    }

    case "checkSupportedAnswer": {
      const response = typeof args.response === "string" ? args.response.trim() : "";
      if (!response) {
        return err(command, "invalid-argument", "checkSupportedAnswer requiere una respuesta de texto.");
      }
      const alternatives = Array.isArray(args.alternatives)
        ? args.alternatives.filter((a): a is string => typeof a === "string")
        : [];

      // Check if gameId explicitly refers to an activity without a verified answer key (e.g. completar-palabras-m)
      if (typeof args.gameId === "string" && args.gameId.trim()) {
        const gameId = args.gameId.trim();
        const graph = lessonGraphFor(context.lesson);
        const gameRef = graph?.games.find((g) => g.id === gameId);
        if (gameId === COMPLETAR_PALABRAS_M.id || gameRef?.answerKeyStatus === "source-pending") {
          return unavail(
            command,
            "answer-key-pending",
            `La actividad "${gameId}" aún no tiene clave de respuestas verificada.`,
            { gameId, answerKeyStatus: "source-pending" },
          );
        }
      }

      const itemId =
        typeof args.itemId === "string" && args.itemId.trim()
          ? args.itemId.trim()
          : context.activeItemId ?? "";
      const item = itemId ? ITEM_BY_ID.get(itemId) : undefined;
      if (!item) {
        return err(
          command,
          "not-found",
          "checkSupportedAnswer requiere un itemId canónico con respuesta verificada.",
        );
      }
      const match: MatchResult = matchTarget(item, response, alternatives);
      return ok(command, match.pass ? "Respuesta correcta." : "Respuesta aún no coincide.", {
        itemId: item.id,
        expectedText: item.text,
        pass: match.pass,
        rule: match.rule,
        distance: match.distance,
      });
    }

    case "getAuthorizedProgress": {
      if (args.lesson !== undefined && !isValidLesson(args.lesson)) {
        return err(command, "invalid-argument", "El filtro de lección debe ser un entero entre 1 y 24.");
      }
      // Strictly filter to ONLY this student's own sessionId.
      const allOwn: TutorProgressEvent[] = readTutorProgress().filter(
        (ev) => ev.session_id === context.sessionId,
      );
      const events =
        args.lesson !== undefined
          ? allOwn.filter((ev) => ev.lesson_id === String(args.lesson))
          : allOwn;
      const correctCount = events.filter(
        (ev) => ev.result === "correct" || ev.result === "correct_after_retry",
      ).length;
      const missedCount = events.filter((ev) => ev.result === "missed").length;
      return ok(command, "Progreso autorizado del estudiante.", {
        sessionId: context.sessionId,
        lessonFilter: args.lesson ?? null,
        totalEvents: events.length,
        correctCount,
        missedCount,
        events,
      });
    }

    case "resume": {
      host?.onResume?.();
      return ok(command, "Sesión reanudada.", {
        sessionId: context.sessionId,
        lesson: context.lesson,
        previousPhase: context.phase,
        nextPhase: "ready" as TutorSessionPhase,
      });
    }

    case "repeat": {
      const requestedId =
        typeof args.lineId === "string" && args.lineId.trim()
          ? args.lineId.trim()
          : context.lastSpokenLineId ?? "";
      if (!requestedId) {
        return unavail(
          command,
          "no-last-recording",
          "No hay una intervención reciente para repetir.",
        );
      }
      const entry = getDialogueEntry(requestedId);
      if (!entry) {
        return err(command, "not-found", `No existe línea con lineId "${requestedId}".`);
      }
      const playable = getPlayableEntries().some((p) => p.id === entry.id);
      host?.onRepeat?.(entry.id);
      return ok(command, `Repitiendo "${entry.id}".`, {
        lineId: entry.id,
        text: entry.text,
        hasApprovedAudio: playable,
      });
    }

    case "changeLayout": {
      const layout = args.layout;
      if (typeof layout !== "string" || !ALLOWED_LAYOUT_SET.has(layout)) {
        return err(
          command,
          "invalid-argument",
          'changeLayout requiere "call", "split", "flipchart-pip" o "practice".',
        );
      }
      const nextLayout = layout as TutorLayoutMode;
      host?.onChangeLayout?.(nextLayout);
      return ok(command, `Diseño cambiado a "${nextLayout}".`, {
        previousLayout: context.layout,
        layout: nextLayout,
      });
    }

    case "completeSession": {
      const reasonRaw = args.reason ?? "completed";
      if (
        reasonRaw !== "completed" &&
        reasonRaw !== "student-exit" &&
        reasonRaw !== "idle-timeout"
      ) {
        return err(
          command,
          "invalid-argument",
          'reason debe ser "completed", "student-exit" o "idle-timeout".',
        );
      }
      host?.onCompleteSession?.({
        sessionId: context.sessionId,
        lesson: context.lesson,
        reason: reasonRaw,
      });
      return ok(command, "Sesión finalizada.", {
        sessionId: context.sessionId,
        lesson: context.lesson,
        reason: reasonRaw,
        nextPhase: "ended" as TutorSessionPhase,
      });
    }
  }
}

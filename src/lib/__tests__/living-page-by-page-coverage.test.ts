import { describe, it, expect } from "vitest";
import { LIVING_ACTORS, getLivingActor, LivingActorAction, LivingActorPart } from "../living-actor-registry";
import boardData from "../../../docs/art-board/board-data.json";
import staleMotionArt from "@/data/stale-motion-art.json";
import flipchartProductionArt from "@/data/flipchart-production-art.json";
import fs from "node:fs";
import path from "node:path";

interface BoardRow {
  id: string;
  book: string;
  page: number;
  label: string;
  group: string;
  current: string;
  appLabel: string;
  cover: boolean;
}

const ALLOWED_PART_NAMES: Set<LivingActorPart["name"]> = new Set([
  "wings",
  "head",
  "tail",
  "ears",
  "trunk",
  "legs",
  "crest",
  "foliage",
  "shimmer",
  "flame",
  "steam",
  "glint",
]);

const ALLOWED_ACTIONS: Set<LivingActorAction> = new Set([
  "breathe",
  "crawl",
  "flutter",
  "swim",
  "hover",
  "glide",
  "roll",
  "spin",
  "hop",
  "wag",
  "nod",
  "sway",
  "float",
  "wave",
  "shimmer",
  "flame",
  "steam",
  "glint",
]);

describe("living-page-by-page-coverage contract test", () => {
  const rows = boardData.rows as BoardRow[];
  const activeRows = rows.filter((r) => Boolean(r.current));
  const workbookRows = activeRows.filter((r) => r.book === "Workbook");
  const flipchartRows = activeRows.filter((r) => r.book === "Flip Chart");

  it("verifies total active placement counts match the authoritative art board", () => {
    expect(rows.length).toBe(330);
    expect(activeRows.length).toBe(328);
    expect(workbookRows.length).toBe(160);
    expect(flipchartRows.length).toBe(168);
  });

  it("asserts 100% of Student Workbook placements resolve to an active living actor", () => {
    for (const row of workbookRows) {
      const src = row.current.replace(/^public/, "");
      const actor = LIVING_ACTORS[src];
      expect(actor, `Workbook row ${row.id} (p${row.page}: ${row.label} at ${src}) must resolve in LIVING_ACTORS`).toBeDefined();
      expect(actor?.src).toBe(src);
      expect(ALLOWED_ACTIONS.has(actor!.action)).toBe(true);
      expect(actor?.reducedMotion).toBe("static");
      expect(typeof actor?.meaning).toBe("string");
      expect(actor?.meaning.length).toBeGreaterThan(0);

      // Verify getLivingActor runtime behavior respects stale motion quarantine
      const isStale = Object.prototype.hasOwnProperty.call(staleMotionArt, src);
      if (isStale) {
        expect(getLivingActor(src)).toBeNull();
      } else {
        // Replaced stills must retain their quarantine, even with a registry entry.
      expect(getLivingActor(src)).toEqual(Object.hasOwn(staleMotionArt, src) ? null : actor);
      }
    }
  });

  it("asserts 100% of Teacher Flip Chart placements resolve to an active living actor", () => {
    for (const row of flipchartRows) {
      const src = row.current.replace(/^public/, "");
      const actor = LIVING_ACTORS[src];
      expect(actor, `Flip Chart row ${row.id} (p${row.page}: ${row.label} at ${src}) must resolve in LIVING_ACTORS`).toBeDefined();
      expect(actor?.src).toBe(src);
      expect(ALLOWED_ACTIONS.has(actor!.action)).toBe(true);
      expect(actor?.reducedMotion).toBe("static");
      expect(typeof actor?.meaning).toBe("string");
      expect(actor?.meaning.length).toBeGreaterThan(0);
      // Replaced stills must retain their quarantine, even with a registry entry.
      expect(getLivingActor(src)).toEqual(Object.hasOwn(staleMotionArt, src) ? null : actor);
    }
  });

  it("asserts 100% of runtime Flip Chart production art references resolve to an active living actor", () => {
    const prodArtPages = Object.values(flipchartProductionArt as Record<string, { scene?: { src: string }; vocab?: Array<{ src: string }> }>);
    const prodPaths = new Set<string>();

    for (const page of prodArtPages) {
      if (page.scene?.src) prodPaths.add(page.scene.src);
      if (page.vocab) {
        for (const v of page.vocab) {
          if (v.src) prodPaths.add(v.src);
        }
      }
    }

    expect(prodPaths.size).toBeGreaterThan(100);
    for (const src of prodPaths) {
      const actor = LIVING_ACTORS[src];
      expect(actor, `Production art ${src} must resolve in LIVING_ACTORS`).toBeDefined();
      expect(actor?.src).toBe(src);
      expect(ALLOWED_ACTIONS.has(actor!.action)).toBe(true);
      expect(actor?.reducedMotion).toBe("static");
      // Replaced stills must retain their quarantine, even with a registry entry.
      expect(getLivingActor(src)).toEqual(Object.hasOwn(staleMotionArt, src) ? null : actor);
    }
  });

  it("asserts 100% of physical native Flip Chart files resolve to an active living actor", () => {
    const nativeDir = path.resolve(__dirname, "../../../public/cartilla/art/optimized/flipchart-native");
    const nativeFiles = fs.readdirSync(nativeDir).filter((f) => /\.(png|webp)$/i.test(f) && !f.endsWith("-alive.svg"));
    // Seven retained pre-PDF WebP crops are archive files, not runtime placements.
    const retainedArchives = new Set(["elefante", "ema", "erizo", "escalera", "espejo", "estrella", "scene"].map(word => `p006-${word}.webp`));
    expect(nativeFiles.length).toBe(174);
    const runtimeSources = new Set([
      ...flipchartRows.map(row => row.current.replace(/^public/, "")),
      ...Object.values(flipchartProductionArt as Record<string, {scene?: {src: string}; vocab?: Array<{src: string}>}>).flatMap(page => [page.scene?.src, ...(page.vocab ?? []).map(item => item.src)]),
    ]);

    for (const file of nativeFiles) {
      const src = `/cartilla/art/optimized/flipchart-native/${file}`;
      if (retainedArchives.has(file)) {
        expect(runtimeSources.has(src), `Archived crop ${src} must not replace the full PDF crop`).toBe(false);
        continue;
      }
      const actor = LIVING_ACTORS[src];
      expect(actor, `Physical native file ${src} must resolve in LIVING_ACTORS`).toBeDefined();
      expect(actor?.src).toBe(src);
      expect(ALLOWED_ACTIONS.has(actor!.action)).toBe(true);
    }

    const fixesDir = path.resolve(__dirname, "../../../public/cartilla/art/approved/flipchart-fixes");
    if (fs.existsSync(fixesDir)) {
      const fixFiles = fs.readdirSync(fixesDir).filter((f) => /\.(png|webp)$/i.test(f));
      for (const file of fixFiles) {
        const src = `/cartilla/art/approved/flipchart-fixes/${file}`;
        const actor = LIVING_ACTORS[src];
        expect(actor, `Physical fix file ${src} must resolve in LIVING_ACTORS`).toBeDefined();
        expect(actor?.src).toBe(src);
      }
    }
  });

  it("enforces ground stability and anatomical part compliance across all living actors", () => {
    for (const row of activeRows) {
      const src = row.current.replace(/^public/, "");
      const actor = LIVING_ACTORS[src];
      expect(actor).toBeDefined();

      // An actor must either:
      // 1) have an owner-authored SVG with self-contained natural motion (aliveSrc), OR
      // 2) have a part rig (parts) that keeps ground/foundation fixed and moves only anatomical regions, OR
      // 3) be an explicitly permitted gentle whole-vehicle motion (glide/roll/float for airplanes/cars/globes).
      const hasAliveSrc = Boolean(actor?.aliveSrc);
      const hasPartRig = Boolean(actor?.parts && actor.parts.length > 0);
      const isAllowedVehicleMotion =
        actor?.creature === false &&
        (actor?.action === "glide" || actor?.action === "roll" || actor?.action === "float");

      expect(
        hasAliveSrc || hasPartRig || isAllowedVehicleMotion,
        `Actor for ${src} must have aliveSrc, a ground-stable part rig, or be a permitted vehicle motion`,
      ).toBe(true);

      if (actor?.parts) {
        for (const part of actor.parts) {
          expect(ALLOWED_PART_NAMES.has(part.name), `Invalid part name ${part.name} in ${src}`).toBe(true);
          expect(part.clipPath.startsWith("inset("), `clipPath in ${src} must be an inset(...) definition`).toBe(true);
          expect(typeof part.transformOrigin).toBe("string");
          expect(part.transformOrigin.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

// Type declarations for validate-art-color.mjs so the vitest guard
// (src/content/__tests__/art-color-completeness.test.ts) type-checks against
// the single source of truth without a build step for the script itself.

export function collectSrcs(obj: unknown, into?: Set<string>): Set<string>;
export function collectWiredSrcs(): string[];
export const COLOR_MIN_SPREAD: number;
export const DUOTONE_ALLOWLIST: Set<string>;
export function meanColorSpread(rel: string): Promise<number>;
export function findGrayscaleArt(): Promise<Array<{ rel: string; spread: number }>>;
export const CONFIRMED_ABSENT: Set<string>;
export function findUntriagedGaps(): string[];
export function findStaleAbsent(): string[];

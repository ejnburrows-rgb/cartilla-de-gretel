# Archived: orphaned root-level scratch files

Moved here 2026-07-16, out of the repo root, so they no longer get linted or
confused for real source. Not deleted — per repo policy, files are
moved/archived, never deleted.

Why: `temp_BookPageFlip.tsx` and `current_BookPageFlip.tsx` were UTF-16
scratch/debug copies (confirmed via `file` — not real UTF-8 TypeScript
source), and `capture_art.mjs` a one-off script, all three accidentally
committed to the repo root alongside real feature work in commit `8c18267`
("feat(ui): add escuchar instruction button to student exercises", 2026-07-15).
None are imported anywhere (confirmed via repo-wide grep) and none were ever
part of `tsconfig.json`'s `include` (`src/**/*` only) — they only ever
affected the repo by breaking a full `pnpm lint` pass (`temp_BookPageFlip.tsx`
throws a hard parsing error as a non-UTF-8 file), which was blocking Task 1.1
(getting the GitHub `Verify` check green).

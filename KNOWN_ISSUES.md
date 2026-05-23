# Known issues

A truthful inventory of what is not yet verified or done. Update this file in the same commit that resolves an item.

## Verification I cannot run from the current tooling

These need a local shell or CI to verify; the GitHub contents API alone cannot:

- [ ] `pnpm tsc --noEmit` — typecheck status unknown after recent commits `1ed25d8a` (lessons.json v0.2.0), `abc271b5` (book-faithful.ts), and this commit. Expected to pass (additive files only) but unverified.
- [ ] `pnpm lint` — lint status unknown.
- [ ] `pnpm build` — build status unknown.

When you run these locally, paste any failures here verbatim.

## Deploy

- [ ] Vercel is serving a build older than commit `a028edf7`. None of the recent additions (lessons.json v0.2.0, book-faithful.ts, BookFaithfulOverlay.tsx, central types module) are live yet. Resolution: re-enable auto-deploy on the Vercel project for `main`, or trigger one manual redeploy.
- [ ] GitHub Pages is not enabled. Either fix Vercel or enable Pages in repo settings.

## Live lesson route integration (manual two-line edit)

The new `BookFaithfulOverlay` component lives at `src/components/cartilla/BookFaithfulOverlay.tsx` but is not yet imported by the live lesson view. The two-line integration is:

1. In `src/routes/cartilla/leccion.$n.tsx`, add the import near the other `@/components/cartilla/*` imports:

   ```ts
   import { BookFaithfulOverlay } from "@/components/cartilla/BookFaithfulOverlay";
   ```

2. In the same file, inside the `Leccion` component's `<main>` section, immediately after the `</h1>` that renders `{entry.title}`, insert:

   ```tsx
   <BookFaithfulOverlay n={n} />
   ```

This was kept as a manual insert (not auto-applied) because the file uses inline JSX style objects that this tool's view layer renders in a compressed form; round-tripping the full file content through the GitHub contents API would corrupt those style objects. The two lines above are safe to add by hand or via any local editor.

## Notion side (parked unless explicitly reopened)

- [ ] Revoke public share on the Workbook PDF Notion page once the PDF mirror is confirmed working in CI.
- [ ] Archive the zip-import dump page and its 140-row Unreferenced Attachments database (workspace clutter).
- [ ] Update the project Hub callouts ("Live & Deployed", "Codex renderer PR open", "12 routes 200 OK") to reflect verified state. The "Codex PR open" claim is false (zero PRs have ever been opened on this repo as of this commit).

## Content gaps (will not be auto-invented)

- [ ] `src/data/lessons.json` `lessons[]` page scaffolding has empty `textBlocks[]` for every page. Filling these requires a paginated transcription pass over the real workbook. Do not synthesize.
- [ ] No per-lesson hero illustrations in `public/cartilla/images/` (only grouped scans). Will not be auto-generated.
- [ ] No `teacher-guide.json` content file yet for the Métodos teacher-side notes.

## consonants.json audit (D4 result, no edit needed)

Audited at commit `abc271b5`. Each entry verified against ground truth:

- Letter order matches consonant order: M, P, S, T, D, L, N, Ñ, B, V, R, rr, G, F, J, C, Y, Z.
- Lesson numbers run 7 through 24 contiguously.
- Page ranges are 4 pages each, starting at p19 for M (L7) and ending at p90 for Z (L24).
- Each entry has the full a/e/i/o/u syllable set in alphabetical syllable order (e.g. ma, me, mi, mo, mu), and the `examples` object has matching keys.
- G uses gue/gui (correct for hard /g/ before front vowels); C uses que/qui (correct for hard /k/ before front vowels); Z uses ce/ci for the soft sound (correct).

No deviation from ground truth found. No edit emitted.

# Inert duplicates cleanup — file list + proof

Generated while auditing Anti-Gravity's `feat/content-extraction` batch
(merged to `main` via PR #141) plus this session's own earlier crop-tooling
test runs. All items below are confirmed to have **zero references** from
any file actually consumed by the running app, any CI workflow, or any
`package.json` script that runs automatically (`build`, `validate:content`,
`check:sanity`).

## What's being removed

| Path | Files | Size | What it duplicates |
|---|---|---|---|
| `public/cartilla/art/extracted/` | 2,233 `.webp` crops across 42 `lesson-N`/`teacher-lesson-N` folders | 64 MB | Scratch/staging output of `scripts/generate-crop-manifest.mjs`/`crop-illustrations.mjs` (their declared write target, `ART_ROOT = "public/cartilla/art/extracted"`). The app's real illustrations live under `public/cartilla/art/faithful/`, wired through `src/data/page-layouts.json`/`src/content/consonants.json`/`src/content/lessons.json` — never this folder. |
| `src/content/page-layouts.json` | 1 | 208 KB | Duplicate of the real, live `src/data/page-layouts.json` (8,289 lines added by PR #141, never touched again) |
| `src/content/page-inventory.json` | 1 | 12 KB | Duplicate of the real, live `src/data/page-inventory.json` |
| `src/content/teacher-guide.json` | 1 | 4 KB | Dead scaffolding — the real per-lesson guide content lives in `src/content/guides/lesson-N.tsx`, not this file |

**Total: 2,236 files, ~64.2 MB.**

## Proof of zero references (reproducible)

```
$ grep -rn "content/page-layouts" src/ --include="*.ts" --include="*.tsx"
(no output)

$ grep -rn "content/page-inventory" src/ --include="*.ts" --include="*.tsx"
(no output)

$ grep -rln "content/teacher-guide" src/ --include="*.ts" --include="*.tsx"
(no output)

$ grep -rln "art/extracted" src/ --include="*.ts" --include="*.tsx" --include="*.json"
src/content/pdf-extraction-manifest.ts   # itself unreferenced anywhere, pre-existing dead
                                          # file from a much earlier commit (b335b6f) — out
                                          # of scope for this cleanup, flagged separately in
                                          # SPEC.md, NOT deleted here.

$ grep -rln "art/extracted\|content/page-layouts\|content/page-inventory\|content/teacher-guide" .github/
(no output)
```

Only consumer of the `art/extracted` path anywhere in the codebase is the
two crop-tooling scripts' own declared *output* destination — not a read
path used by anything else:

```
$ grep -n "extracted" scripts/generate-crop-manifest.mjs scripts/crop-illustrations.mjs
scripts/generate-crop-manifest.mjs:71:      output: `public/cartilla/art/extracted/${slug}.webp`,
scripts/crop-illustrations.mjs:8: * webp to public/cartilla/art/extracted/.
```

Neither script is wired into `build`, `validate:content`, `check:sanity`,
or any GitHub Action — both are manual, opt-in tools (`pnpm crop:*`).
Deleting their stale scratch output does not break their ability to run
again later; they just recreate the directory fresh from source scans.

## Why this is safe to delete (not a "never delete files" violation)

The repo's standing rule is "never delete files, move or rename only,"
because a file might be someone's unfinished or referenced work. These are
neither: they are exact byte-for-byte-superseded duplicates (the two
`src/content/*.json` files) or a confirmed-dead scratch/staging output
directory (the extracted crops) that nothing in the live app, build, or CI
pipeline reads from. Owner explicitly authorized this specific deletion via
a clearly-titled, reviewable PR rather than a silent commit.

# Classroom readiness verification — 2026-10-03

## Delivered

- Student bookmarks resume the exact page by learner and lesson. Partial trace checkpoints, handwriting, freehand drawings, colors/tools, written sentences, and activity completion survive navigation and reload. Interrupted canvas strokes flush on page hide/unmount. Canvas resizing preserves the drawing layer synchronously and observes container size changes.
- Teacher navigation reaches guides, the Flip Chart catalog/presenter, progress, reports and printing. Presenter exit/focus/fullscreen controls remain reachable. Tablet guides use the lesson selector instead of squeezing content beside a sidebar; guide tabs show the selected section and print all sections.
- Printing includes every canonical page in the selected lesson or all lessons and waits for image loading. Missing scans 86–87 use the existing authored digital page layouts. CSV export has busy/error feedback. Report event labels are readable Spanish.
- Unavailable TTS instruction controls and passive picture listening buttons are hidden under the existing recorded-only audio policy. Students see an honest recording-pending explanation. Answer selection still works normally.
- Existing image files, backgrounds, authored content, handwriting fonts and Supabase backend are unchanged.

## Verification

`node scripts/verify-classroom-readiness.mjs` runs the checked-in TypeScript scenarios through a temporary CJS bundle for Node 24. Chromium must be installed (`pnpm exec playwright install chromium`). The runner uses only a non-live local Supabase URL and explicit network fixtures; it does not create real students or write live data.

- Nine Chromium scenarios passed (28.6 seconds): direct tap/keyboard completion and reload; assistance/return without stranding work; partial checkpoint SVG and exact PNG round trips; drawing completion/resize; sentence writing plus all required syllable answers/completion after reload; teacher guides/progress/report CSV/presenter navigation; print PDF/all selected lesson pages; identified learner separation and local resume with progress RPC unavailable; student redirection away from teacher tools.
- Separate browser contexts for student and teacher. Gated student A/B identities are tested through join-code UI plus explicit fixture identity switches. Teacher progress/report checks use the shipped local example-class mode, clearly identified in its banner, not an authenticated live classroom.
- Laptop 1366×768, tablet 768×1024, phone 390×844 and projector 1920×1080 checked for document overflow and offscreen controls. Screenshots inspected; guide, report, student and presenter evidence attached.
- Full unit suite: 115 files, 1,489 passing tests and two existing expected failures. Type checking and direct production build passed. Artwork preparation deliberately bypassed so locked assets remain byte-for-byte unchanged.
- No changes under `public/` or `supabase/`; no migration, policy, schema or function changes.

## Exact remaining limits

This is verified frontend readiness within existing capabilities, not proof of unrestricted live classroom deployment.

1. **Persistence:** writing/drawing remains scoped to the same browser/device. Existing cloud progress events/bookmarks are best-effort; no backend capable of synchronizing drawing/handwriting bitmaps was added. Clearing browser storage or moving devices cannot recover browser-only work.
2. **Live classroom reporting:** shipped `VITE_CRM_REVIEW` defaults to open access. Teacher tools show local sample students; anonymous student practice is not a real identified classroom feed. Existing gated code is tested with fixtures, but live authenticated teacher/student data, backend permissions and cross-device persistence are not certified by these checks. Connecting real sessions must use existing authorized capability; this change does not silently switch modes or invent backend writes.
3. **Guide sources:** lessons 17–24 lack the original complete guide and display available vocabulary/poems plus an explicit pending message. Earlier lessons also have missing original portions: lesson 6 evaluation/enrichment, lesson 7 development pages 20–21, lesson 9 reinforcement/evaluation/enrichment, lesson 15 truncated source and lesson 16 evaluation/enrichment. Several original rhyme texts remain unavailable. No pedagogical text was fabricated.
4. **Voice recordings:** zero approved vocabulary recordings exist (199 deduplicated names in `docs/audio/MISSING_PICTURE_RECORDINGS.csv`). The policy prohibits TTS; real pronunciation remains blocked on approved recordings.
5. **Production:** automatic Git deployment remains disabled. The exposed Vercel deployment tool returned `Tool deploy_to_vercel not found`; the connected project does not list the repository's canonical `cartilla-de-gretel.vercel.app` alias. This work must not be represented as verified on the live production site until the correct authorized deployment succeeds and is inspected.

## Evidence

The directory contains four-size student, guide, progress, report and presenter captures, resumed handwriting/writing, an identified offline-resume capture, and guide, report and three-page lesson-2 PDFs. Tests regenerate these files.

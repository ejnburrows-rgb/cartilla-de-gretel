# Lesson 24 WORKLOG — 2026-10-17

## Intake / next: scoped presentation build
Read AGENTS.md, issue #877 and docs/JOBS.md before editing. Existing dedicated branch swarm/lesson-24-20261016 and draft PR #884 reused; collision notice posted to Muse on #877 (comment 6230834187). Prior page agents reported finished; no live overlapping code worker recorded. Base 3df90e8851ea63b37e051bf01e113d302f878165. No new branch/PR, merges, deploys or Lesson 3 review.

ALREADY DONE: existing PR corrects lesson-meta.ts to za ze zi zo zu; preserve that prior commit, do not edit the shared file. Actual path: Leccion -> buildPageArray -> NativeLessonViewer -> FaithfulPageRenderer -> shared activity adapters. Page 87 already excluded as SOURCE_BLOCKED.
NEEDS FIX: fit-to-screen rules shrink text/targets and hide overflow; apply Lesson-24-only presentation with source columns intact.
MISSING: matching-edition page 87 source; no invented learner placeholder.
UNVERIFIED: render, interaction, audio, contrast and evidence remain Muse's check.
Tooling: Anti-Churn skill read; no repeated tests authorized. SOFA connected read-only; searched CSS overflow guidance and read post d8203283-2621-4361-9c56-ad4af627ef70. Update advisory returned, read workflows available. Initial JSON inspection assumed pages was an array; it is an object; use keyed access next. No application change from that inspection failure.

## Scoped build pass / next: compile once
Implemented lc-lesson-24 shell in place of fit-to-screen only for n=24. This preserves NativeLessonViewer, completion gates, source regions and existing adapters. Added scoped colors, Andika/Fredoka, 64px syllables, 30px words, 22px instructions, 56px+ controls and 64px navigation. Exact source columns require a 960px page; phone-width conflict is explicitly flagged, with horizontal page scrolling and navigation outside it. Page 87 remains excluded and documented SOURCE_BLOCKED. No page-layout/transcription/art changes.
Reading adapter gives red vowel teaching emphasis in page 88 anchors, page 89 syllable strips and page 90 choices. Existing pencil/eraser, retry state and drag/tap fallback retained; no new feedback engine or amber proposal implemented. Green success glow/star added by scoped CSS. Shared controls permit repeated attempts, including three; no punitive lockout introduced.
Only filename-matched vocabulary hooks for zapato, taza, zorro, zig-zag, Zulema; each also requires existing approved-recording manifest match. Shared speech ownership/mute respected, click again stops, unmount stops, failures stay explicit; never TTS. Other words/instructions/Muy bien remain absent, not substituted. Muse must confirm spoken content and playback. pnpm install --frozen-lockfile --ignore-scripts completed; lockfile unchanged. Next: one Vite compilation (no separate QA/tests/screenshots/video).

## Handoff preparation / next: finish compilation and publish draft
No repeat QA. Final selector specificity correction made during the ongoing Vite build so nested vowel spans inherit syllable size and do not inherit the global syllable-chip border. Final source will be handed to Muse; compilation output alone is not rendered proof. Vite regenerated routeTree.gen.ts with no substantive diff; exclude that generated file from this Lesson 24 commit. Add TypeScript compilation as the remaining ordinary compile stage, once only. No unit/E2E/visual check, screenshots, video or self-approval.

## Compilation result / next: push and hand off #884
- `pnpm exec vite build`: exit 0, output `✓ built in 36.87s`; generated dist/ locally. No deploy. The final nested-vowel CSS specificity correction occurred during this compile invocation; do not use the bundle as proof of the final stylesheet/commit. Muse must build/check the published commit.
- `pnpm exec tsc --noEmit`: exit 0, no diagnostic output, after final source edits.
- No separate tests, rendered review, screenshots or videos run. Full pnpm build pipeline not run. No retry loop.

Handoff: pages 88–90 source text/layout retained, page 87 SOURCE_BLOCKED. Muse must arrange free preview, identify checked SHA, attach 390px screenshots for all three available pages AND short navigation/selection/genuine-audio video on #884. Horizontal 960px original-column surface at 390px is a declared unresolved size/layout constraint, not phone approval. Amber feedback not implemented; owner proposal remains pending. Lesson 3 approval alone never permits Lesson 24 merge. Metadata correction belongs to the pre-existing PR commit, reserved file untouched by this pass. Stop after draft handoff.

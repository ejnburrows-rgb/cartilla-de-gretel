# La Cartilla de Gretel — project completion plan

> **Finish contract:** Read PROJECT_FINISH_DEFINITION.md before planning or declaring Cartilla work complete. It is the canonical definition of what must be true for the entire project to be finished. Compare current verified reality against it and close only real remaining gaps.


**Updated:** 2026-10-05  
**Planning baseline:** `main` at `ad0fb912d62beef0aa7d93cd9bcf45afa0fd0603`  
**Task tracker:** existing GitHub issues/PRs. Do not create duplicate work items.

## Goal

Finish the existing Cartilla product quickly and correctly. Preserve working student/teacher behavior, make visual decisions from rendered evidence, and avoid new prototypes/tools/agents unless they clearly shorten the path.

## Current verified reality

- Public preview: `https://cartilla-de-gretel-psi.vercel.app/cartilla/`. It serves production commit `47b2961`, not current `main`.
- The public Workbook still shows the older scenic presentation and tap/select + `Comprobar`/`Corregir respuestas` feedback. It already has a brief pencil-mark animation on some selections, but not the owner-required shared Pencil/Eraser choreography from PR #476 (draw/hold/success or rotate-to-eraser/erase/retry). PR #476 is not deployed and is not visually accepted.
- Live browser testing on the deployed build confirms picture selection, line matching, freehand/tracing canvases, Borrador, Deshacer, Limpiar, reload persistence of partial canvas work, and completion gating are materially functional. A later `Marca con una x` activity also completed its select → `Comprobar` → `Siguiente` flow. Preserve these working foundations unless a confirmed defect requires change.
- Workbook structured coverage exists for printed pages 1–90. Pages 1–85 and 88–90 are `NATIVE_COMPLETE`; pages 86–87 are `SOURCE_BLOCKED` because the supplied source scan is missing those pages.
- Current `main` still registers scenic Workbook backgrounds for all available pages. The approved clean digital-canvas/cream direction is not rolled out yet.
- PR #501 is the canonical Page 1 golden-reference candidate. Duplicate #506 is closed and must stay closed.
- PR #502 is the canonical living-art motion fix. Duplicate #507 is closed and must stay closed.
- PR #504 fixes the confirmed reversed/over-cropped `uno` asset by pointing production uses to the verified counterpart.
- The current production-art inventory reports 108 referenced production foreground assets, 143 manifest entries, 35 manifest entries currently unreferenced, no duplicate hashes among the 108 active assets, and no tiny active assets. Refresh this inventory before deletion because some recorded reference locations are historical.
- The delivery manifest contains 24 crop/edge/aspect warnings. These are review candidates, not automatically bad assets. `uno` is the one currently confirmed production-visible defect; PR #504 addresses it. `manzana` and `pera` are active inventory entries with `PROVENANCE-UNKNOWN` and require source verification before any replacement/recolor decision.
- Foreground-art issue #454 remains open and controller-owned; Jules is disabled for that lane.
- Release-verification issue #389 remains open and is high leverage because several otherwise-ready PRs depend on trustworthy full release proof.

## Decisions

1. **Finish Pencil/Eraser directly in the existing project.** Do not build it first in Lovable, Google AI Studio, or another prototype. The state/persistence/accessibility architecture already exists in PR #476, so a separate prototype adds translation and integration work.
2. **Use rendered proof in small slices.** Page 1 is the visual gate. Do not start #498 broad Workbook restyling until #501 is shown in a real browser at representative phone/tablet/desktop sizes and accepted.
3. **Do not manually create extra agent lanes.** The existing scheduled Cartilla Jules Supervisor is the default worker-dispatch layer. It may use at most two genuinely independent worker lanes at once, only after confirming the work is not already active and will not conflict with controller-owned visual/Pencil work.
4. **Do not delete art during implementation.** Refresh the current-reference inventory, classify cleanup candidates, then remove only assets proven unused and non-canonical.
5. **Do not deploy production merely for testing.** Use an existing safe branch/runtime verification route; production deployment remains the final authorized release step.

## Phase 1 — highest-leverage blockers

### A. Golden Workbook Page 1 — #496 / PR #501

**Owner:** controller for visual acceptance; bounded worker changes only if a rendered defect is found.

- Render exact current #501 head in the actual app.
- Show phone, tablet and desktop screenshots before further visual change.
- Verify Page 1 alone loses scenic wallpaper, instruction treatment is quiet/native, Gretel is subordinate, all 20 source illustrations and ordering remain intact, and later pages do not inherit Page 1-only rules.
- Verify #504's `uno` correction alongside Page 1 before final visual acceptance.
- Run exact-head controller review, Sonar and task-specific verification.

**Exit:** Page 1 is visibly accepted. Only then may #498 start.

### B. Living-art runtime — #497 / PR #502

**Existing worker lane / verification target.** Do not create a duplicate Jules task or PR.

- Keep the narrow CSS root-cause fix already isolated in #502.
- Prove eligible living art moves in normal mode inside the real Workbook.
- Prove reduced-motion remains static and no layout/hit-target shift occurs.
- Do not reopen #507 or touch unrelated renderer paths.

**Exit:** rendered normal/reduced-motion proof + exact-head review and verification.

### C. Direct release gate — #389

**Supervisor-owned optional lane.** Before dispatch, verify no current Jules session/branch/PR is already doing #389.

- Reproduce current `pnpm verify:release` failure/hang from a clean current-main checkout.
- Repair only genuine harness/baseline defects.
- Do not add GitHub Actions, paid runners or Vercel-as-test-runner.
- Preserve fake/local Supabase test isolation.

**Exit:** a clean checkout can run `pnpm verify:release` and get a trustworthy result.

### D. Foreground art defect — #454 / PR #504

**Owner:** controller, not Jules.

- Render #504 and compare `uno` against the authoritative Workbook source.
- Merge only after orientation/crop is visibly correct and no other uses regress.
- Keep #454 open after this narrow repair until the active production asset set is classified.

## Checkpoint 1

Do not advance broad visual rollout until:
- #501 is visually accepted;
- #502 is proven in-browser;
- #504 is visibly verified or its remaining defect is explicit;
- #389 supplies a trustworthy release gate.

## Phase 2 — shared student feedback foundation

### Shared Pencil/Eraser — #445 / PR #476

**Owner:** controller; a worker may implement one narrow visual repair on the existing PR only.

The public app currently shows the old tap/select + whole-page check/correct behavior. PR #476 is therefore a candidate, not a finished visual feature.

- Reconcile #476 against accepted Page 1/current `main`.
- Complete the missing visible choreography in the shared kernel: real pencil draw, restrained hold, success mark, pencil-to-eraser transition, erase, retry.
- Keep feedback shared; do not build page-local copies.
- Test correct/incorrect p1/p2 interactions, keyboard access, reduced motion, persistence/restore, completion events and navigation gating.
- Show rendered result before any later activity-family conversion.

**Exit:** #445/#476 is visually accepted, functionally tested and merged.

## Phase 3 — remaining activity families, sequential

Dependency chain:

`#445 → #446 → #447 → #448 → #449`

Do not parallelize these because they adapt the same shared interaction language.

1. **#446 — Pencil Line:** pages 3, 5, 8, 11, 14, 17. Replace current tap/connect presentation with approved pencil-drawn line interaction.
2. **#447 — tracing/handwriting/drawing:** preserve existing working canvas, save/restore, eraser/undo/clear and gating; change only what is needed to match Progressive Fade / Premium Simple Pencil Box.
3. **#448 — syllable circles:** reuse shared pencil-mark language.
4. **#449 — word completion and sentence handwriting:** reuse the same writing kernel and persistence.

For every issue:
- test the actual interaction, not just rendering;
- show representative rendered proof;
- preserve source wording and existing learner state;
- do not start the next issue until the previous one is merged.

## Phase 4 — accepted Workbook surface rollout

### #498 — clean digital-canvas rollout

Start only after #501 acceptance.

Roll out by page family:
- dense picture grids;
- line matching;
- handwriting/tracing;
- drawing;
- syllable circles;
- complete-word/fill-in;
- sentence writing;
- reading/vocabulary pages.

For each family:
- preserve source structure/content/art;
- remove full scenic wallpaper where it competes with learner work;
- reuse accepted cream/clean Page 1 surface and instruction hierarchy;
- keep Gretel/chrome subordinate;
- verify representative phone/tablet/desktop pages before moving to the next family.

Do not modify Flip Chart presentation from this issue.

## Phase 5 — foreground art verification and cleanup

### #454 — production foreground art

Controller classifies only production-required slots as:
`PASS / CROP FIX / WRONG SOURCE / VERIFIED COLOR TRANSFER / OPTIMIZATION ONLY / PENDING NO VERIFIED SOURCE`.

- Do not regenerate source-locked art.
- Use source-preserving color transfer only with an exact verified counterpart.
- Keep pages 86–87 explicitly source-blocked rather than inventing art/content.

### Cleanup pass

Before deleting anything:
1. refresh the production-art inventory against current `main`;
2. verify every candidate with repository-wide current references;
3. distinguish canonical source/reference art from dead delivery copies;
4. produce a removal list for owner approval.

The 35 currently reported unreferenced manifest entries are cleanup candidates, not deletion-approved assets.

## Phase 6 — independent existing PRs

As the release gate becomes reliable, finish exact-head review/verification for:
- #477 Gretel behavior/motion discipline;
- #479 physical Workbook/Flip Chart page turns;
- #505 picture-name recording wiring;
- #478 welcome media code integration.

The final owner-approved 5–6 second silent welcome MP4 remains an external asset dependency for #478; do not fabricate it.

## Phase 7 — assembled-product gates

1. **#450:** full Student Workbook regression across activity families, save/restore, page turns, Gretel, reduced motion, responsive fit and final art.
2. **#457:** final teacher/Flip Chart validation.
3. **#391:** measured first-paint performance repair after functional/art lanes stabilize.
4. **#458:** final assembled-product proof, exact-head dual review, clean `pnpm verify:release`, representative browser/device proof, then intentional production deployment.

## Parallel work policy

Do not ask the owner to launch or supervise additional agents. The scheduled Cartilla Jules Supervisor is the default background dispatcher and the fallback watchdog handles stalled lanes.

At most two genuinely independent worker lanes may be active, and only when they shorten the critical path without overlapping files or ownership.

**Current preferred allocation:**
- Worker lane 1: exact-head verification of canonical PR #502 only; do not reopen duplicate #507.
- Worker lane 2: #389 release harness only if the supervisor confirms no existing worker is already active for it.
- Controller: #501 rendered visual acceptance, #504 art proof, then #476 shared Pencil/Eraser visual repair/acceptance.

**Must stay sequential:**
- #501 acceptance before #498.
- #445 → #446 → #447 → #448 → #449.
- #450 after final Workbook interaction/art/visual state.
- #458 after all final gates.

## Definition of finished

The canonical, owner-locked definition of finished is PROJECT_FINISH_DEFINITION.md.

This plan must close the real gaps against that file. It must not redefine or weaken the finish criteria.

# Independent material review — PR #1247 continuation

Status: **WAITING — material holds; no merge recommendation yet.**

Reviewer: Codex independent review worker, separate from implementation and integration. Reviewed commit: `d613b78ba553c3c5786afdf7d589305a3080f1cf`; base: `01e3168540ad5a90a57353e12f85420fe46a7358`. Review worktree/branch is isolated and contains no implementation edits. This report is technical review evidence, not a GitHub approval or an independent authenticated GitHub identity.

## Material findings

1. **Replaced Lesson 4 artwork still uses old part masks.** The seven p006 PNGs were replaced and their dimensions/content bounds changed. Only the elephant is included in `stale-motion-art.json`; the other six still resolve to the old part rigs in `src/lib/living-actor-registry.ts:576–581`. On the new 520×650 `p006-erizo.png`, the registered head mask `inset(0 25% 45% 10%)` covers x52–390/y0–357.5: primarily the upper blue background/foliage, while the sea urchin is mostly below it. `LivingIllustration` duplicates that region and `living-part-head` moves it independently of the fixed base. The new p006 scene also uses the former top-55-percent head region after changing from a padded 560×560 crop to a 950×1250 full scene. Preserve these corrected stills and hold dependent motion until geometry is revalidated. No new motion is requested. This follows the existing dependency rule in `PERMANENT_PROJECT_INTEGRITY_WORKFLOW.md` rather than requiring another broad artwork audit.

2. **p006 source provenance remains inconsistent with installed bytes.** The prior source repair ledger binds Ema to the HD page-006 crop `[1869,1591,2336,2199]`, dimensions467×608 and SHA256 `b7bfa21fd4d69e1df405b8e78f22597b6f49198af69a86f4d6c422ad067c76a3`. This candidate installs500×540 replacement bytes. The committed full-suite result records the resulting exact-hash failure. `additional-source-repairs.json` provides source rectangles/output hashes for pages26/29/32/38/62, but not the seven p006 replacements. Reconcile p006 with the actual original and a reproducible crop/pixel comparison, retaining historical evidence. Updating hashes alone would not establish authenticity.

3. **Full qualification is still failing, with a hook blind spot.** Published `full-suite-results.json` has2154 passing/30 failing/7 skipped assertions and11 failed result files. It lists30 assertion failures but no assertion-level entry for the failed performance hook or archived WelcomeSplash file. The completion report correctly does not call the full suite green. Repair/reconcile the specifically failing suites, preserve untracked historical stress tests, capture hook failures separately, and then run one frozen-head complete gate. A focused pass does not clear this hold.

## Reviewed areas without another identified blocker

- Vite's cwd realpath/alias/setup-file changes preserve the expected project root in the ordinary root-directory invocation and intentionally normalize a Windows junction path. No material regression identified by source review. This review did not run an alternate-root CLI matrix.
- Existing WelcomeSplash media/navigation assertions are retained; new assertions check the single canvas, coordinate frame and cover-entry audio. The older still/video tests now exercise the hidden fallback subtree and should not be described as proving the visible WebGL cover. The existing real-route proof separately records reduced-motion, absent-WebGL and missing-cover behavior. No coverage-removal finding.
- Outward turn signs agree across `living-motion.ts`, drag updates and CSS keyframes in both directions. Existing click-based browser evidence covers an advance and return; the failed first navigation recording is accurately distinguished from passing proof. Real-touch evidence remains the targeted runtime lane's job.
- The five additional restored scenes carry `motionDisabled:true`, which is propagated into `FlipchartReplicaSheet`'s `LivingIllustration static` property. Their source rectangles, hashes and label-exclusion areas are explicitly recorded. Their existing browser observations report ambient none/natural false; this is not a claim to have independently rerun pixel extraction.
- Existing built phone presentation and desktop fullscreen screenshots were visually inspected: sheet, captions and controls are visible; the demo launcher is above the bottom navigation. This does not prove a physical phone/projector or every turn mode.
- Owner merge and CC0 OwlStorm sound approval are already recorded and remain accepted. Disabled automatic deployment remains a boundary.

## Formal review reconciliation

Graphify `review_status` was queried for this PR. It returned only a completed static review at `61a6bd7b279f261254573ddc5a8ffef18df98283`, created2026-11-02. Its `superseded:false` field does not make it current against GitHub head `d613b78b`. The available Graphify connector can read review status but cannot start/rerun one. The prior GitHub request reported success but no queued reviewer. No duplicate review request or author self-approval was submitted. An independent authenticated formal GitHub review of the final frozen head is still required.

## Evidence and limits

Inspected: complete application/config/data diff against the PR base; source dependency policy; `COMPLETION-CHECK.md`, `additional-source-repairs.json`, full failure JSON, prior Ema source ledger; exact installed p006 erizo/scene images; published Lesson4 sheet, phone presentation and desktop fullscreen captures; current motion registration/rendering code; Graphify's provider receipt. Reused existing results instead of rerunning clean suites or recapturing60 sheets. No tests/build/browser flow was newly executed by this reviewer, and no physical device/projector was available. Source recovery for pages35/41/47/53 remains separately owned.

Next: implementation owner resolves the material holds; reviewer reassesses changed files and new evidence at the frozen implementation head. Changed head invalidates affected conclusions, not every unchanged earlier artifact. This preliminary report is not final-head acceptance.

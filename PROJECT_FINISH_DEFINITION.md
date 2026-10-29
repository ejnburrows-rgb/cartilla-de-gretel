# PROJECT_FINISH_DEFINITION.md — canonical definition of finished

This file defines **what complete means**, not agent dispatch or today's PR statuses. For execution use [AGENTS.md](AGENTS.md); for live assignments and evidence use [GitHub #877](https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877). No historical note or task lowers the finish requirements below.

## Finished product

The finished product is a **school-pilot-ready digital classroom edition of La Cartilla de Gretel** containing BOTH. Under the current deferred live-auth/Supabase scope, that finish line permits demo/pilot use only with non-real student data until real-data security/privacy blockers are resolved:

- the complete Student Workbook experience; and
- the complete teacher / Flip Chart experience required to run the classroom product.

Finishing only one side does not finish the project.

## 1. Student Workbook — REQUIRED

The Student Workbook is finished only when:

- the physical Workbook's lesson order, wording, educational intent, exercise structure, page sequence, and recognizable page composition are preserved;
- the owner-approved clean digital-canvas presentation is consistently applied where appropriate;
- the owner-locked eight-family Workbook visual system in `WORKBOOK_ARCHETYPE_STANDARD.md` is applied consistently to every matching recurring exercise while each page remains faithful to its own physical source;
- all required student activity families work end to end in the real rendered application;
- approved Pencil/Eraser behavior is used consistently rather than activity-local substitutes;
- approved handwriting/tracing, drawing, syllable-marking, word-completion, and sentence-writing treatments are implemented where the source requires them;
- Gretel behaves according to the approved shared interaction system and does not distract from active learner work;
- approved living-art motion works only where permitted and respects reduced motion;
- approved physical Workbook page-turn behavior works without bypassing state, gating, or source fidelity;
- learner work, progress, drawing/writing, completion, and resume/restore behavior are reliable;
- navigation/completion gates work correctly;
- keyboard accessibility and required reduced-motion behavior work;
- representative phone, tablet, laptop/desktop, and projector views have been verified;
- no known student-facing defect remains, including cosmetic/visual defects.

## 2. Teacher / Flip Chart experience — REQUIRED

The teacher side is finished only when all currently planned classroom-required teacher capabilities work, including:

- faithful digital Flip Chart presentation;
- teacher lesson/navigation tools;
- required progress views;
- required printing/report flows;
- source-faithful teacher material presentation;
- approved physical Flip Chart top-bound page-turn behavior;
- representative classroom/projector verification;
- no known teacher-facing defect remains, including cosmetic/visual defects.

The teacher experience may not be deferred simply because the Student Workbook is complete.

## 3. Source fidelity and artwork — REQUIRED

The finished product must preserve the authoritative source books.

Required:

- source book structure/content wins when implementation disagrees;
- active artwork must use the correct source identity, orientation, crop, composition, object count, and educational meaning;
- no active fabricated, guessed, look-alike, regenerated, or provenance-unknown substitute may remain where source fidelity is required;
- source-preserving color transfer is allowed only from an exact verified canonical counterpart under ASSET_FIDELITY_POLICY.md;
- foreground art is never altered merely to solve a layout problem;
- no known active wrong-source, reversed, over-cropped, badly cropped, or unverified production artwork defect remains.

### Source-blocked Workbook pages 86–87

The project **may still be declared finished** if pages 86–87 are conclusively proven unavailable in the authoritative supplied source, are explicitly documented as SOURCE_BLOCKED, and no content or artwork is invented to fill the gap.

A conclusively documented source absence is not a product defect.

## 4. Gretel voice / audio — PREMIUM VOICE REQUIRED

The owner requires verified authentic Gretel recording playback before the project is finished; new TTS generation or provider selection is not an open task. Continue existing #769 recording recovery, heard transcription and page/event matching.

Therefore, before final completion:

- the selected authentic-recording direction must have actually recovered/verified source assets and correct phrase mappings;
- the implemented voice must be appropriate for the intended early-learning Spanish experience;
- its behavior must integrate cleanly with Gretel's approved interaction system;
- it must not create duplicate, conflicting, or distracting speech;
- it must be tested in the real application.

The source direction is selected, but until original audio has verified playback and event/page correctness, the project is **not finished**.

## 5. Welcome video — NOT REQUIRED FOR COMPLETION

The owner-approved 5–6 second silent welcome loop is desirable but **does not block technical/classroom completion**.

The product may be declared finished without the final welcome video if:

- welcome-media code/fallback behavior is safe; and
- the missing final owner-supplied creative asset is clearly documented.

If the approved asset later becomes available, it may be integrated without reopening the definition of finished.

## 6. Live Supabase authentication / multi-user backend — DEFERRED FOR DEMO/NON-REAL-DATA PILOT ONLY

Full live Supabase authentication / multi-user backend expansion is currently deferred and does **not** block completion of the current demo/non-real-data classroom pilot product.

That deferral does **not** authorize a production or school pilot using real child/student data while known security/privacy blockers remain unresolved. Real-data pilot readiness requires those blockers to be resolved and verified; they cannot be waived merely by calling Supabase work deferred.

Agents must not invent retention periods, licensing rules, or security-policy choices during ordinary implementation. Those remain owner-policy decisions.

A later owner decision may create a broader backend phase, but it does not retroactively change the demo/non-real-data finish line described here.

## 7. Accessibility, reliability, and performance — REQUIRED

Before completion:

- required keyboard interaction works;
- reduced-motion behavior is correct;
- key responsive layouts are usable at representative target sizes;
- no known serious accessibility regression remains;
- no known reliability defect remains in the classroom-critical flows;
- measured performance work required by the current completion plan is complete;
- the product is stable enough for the currently authorized demo/non-real-data classroom pilot; real-data school use additionally requires resolution of the known real-data security/privacy blockers.

## 8. Defect standard — ZERO KNOWN PRODUCT DEFECTS AT DECLARATION

The owner chose the strict finish bar:

> The project is not "finished" while any known product defect remains, including known visual/cosmetic defects.

Before final declaration, all known defects affecting the implemented product must therefore be resolved and verified.

Exceptions:

- conclusively documented source-blocked content such as Workbook pages 86–87;
- intentionally deferred scope explicitly marked NOT REQUIRED by this file;
- harmless repository housekeeping that does not affect the product, release, safety, fidelity, or agent execution.

Do not hide, relabel, or close a real defect merely to satisfy this gate.

## 9. Repository cleanup — ONLY PRODUCT-RISK CLEANUP IS REQUIRED

Dead, duplicate, historical, or unreferenced repository material does **not** by itself block product completion.

Cleanup becomes a finish requirement only when the material creates a real risk such as:

- wrong active assets;
- ambiguous canonical source selection;
- agent confusion that can cause incorrect work;
- security/privacy exposure;
- release/build problems;
- runtime/product defects.

Do not delay the product merely to achieve aesthetic repository tidiness.

## 10. Final verification — REQUIRED

Before the project can be declared finished:

- every required finish criterion above has objective evidence;
- exact-head independent controller review is complete where required;
- SonarCloud/SonarQube review remains **advisory and non-blocking**: a failed/missing quality gate alone is not a finish or merge blocker. Independently confirmed serious defects must be resolved, and relevant Jules product tests plus required UI proof must pass. A passing Sonar result alone does not establish completion;
- the final clean direct-cloud release verification passes;
- final Student Workbook regression passes;
- final teacher / Flip Chart regression passes;
- final assembled-product browser/device proof is complete;
- no required finish criterion is represented only by a plan, prompt, issue, or unverified worker claim.

## Owner approval proof — CHAT FIRST

Before either required owner approval in this finish contract can count:

- the actual result must be shown to EJN directly in chat;
- visible/visual work must be shown as the real rendered screenshot/image whenever technically possible;
- a GitHub PR, issue, branch, commit, or link is never sufficient owner-facing proof by itself;
- if inline image display is technically impossible, use a directly viewable rendered artifact/preview rather than asking EJN to inspect GitHub;
- approval should be requested as a simple **Yes / No** after the proof is visible;
- if the proof is not visible to EJN, the approval gate is still open.

## 11. Owner approvals — REQUIRED

Owner-visible decisions for the finished product (do not repeat already accepted A–E):

1. **Workbook archetype implementation proof:** the eight recurring visual directions are already owner-locked in `WORKBOOK_ARCHETYPE_STANDARD.md`; each implemented family must visibly match that standard and its exact physical source before whole-family rollout. The numbered teal title bars on the owner's reference board are annotation labels only and must not appear in production.
2. **Final assembled-product approval** before the intentional final production release.

**Merge authorization is separate:** owner acceptances A–E and routine implementation choices are settled, but any merge requires the applicable explicit exact-change authorization and eligible formal GitHub approval under the effective branch-protection rules. Technical review alone does not meet those rules. Hold an unauthorized merge, not unrelated work.

## 12. Production release and final declaration — REQUIRED

An agent may say **"La Cartilla de Gretel is finished"** only when ALL of the following are true:

- every REQUIRED item in this file has objective proof;
- all current real gaps against this file are closed;
- the final verification/release gate passes;
- required owner approvals are recorded;
- the intended final production build is deliberately deployed;
- the deployed production product is inspected after release;
- the deployed result matches the approved assembled-product proof;
- no known product defect remains.

Merged PRs, closed issues, completed Jules sessions, passing unit tests, or a successful build **alone do not equal project completion**.

---

## Gap-closing operating rule

Every controller, coding agent, reviewer, Jules session, watchdog, and future agent must use this sequence:

**FINISHED GOAL → CURRENT VERIFIED STATE → REAL GAPS → PROOF REQUIRED → EXECUTE → VERIFY → CLOSE GAP**

If a newly discovered problem prevents one of the required finish conditions, record/route it into the current canonical execution plan and close it.

Do not expand the finish definition itself without a new explicit owner product decision.

## Conflict rule

If another active document describes current state, priorities, implementation details, or task order differently, use:

- PROJECT_FINISH_DEFINITION.md for **what must ultimately be true**;
- PROJECT_SOURCE_OF_TRUTH.md for **current product state and owner-decided scope**;
- tasks/plan.md and current GitHub reality for **how current gaps are being closed**;
- specialized canonical directives for **how specific work must be implemented**.

No issue, PR, worker prompt, archived document, or stale status report may lower this finish bar.

# Artwork report verification and permanent single-source cleanup

> **LATEST OWNER EXECUTION / PROVISIONAL APPROVAL — October 28, 2026.** Owner: “Go ahead and approve everything for now until you finish. Then anything that I want to change, I will change.” Treat remaining routine visual and implementation decisions within the existing Cartilla completion scope as provisionally approved, including the shown Lesson 3 direction (card E); A–D are already accepted. Continue material work without returning routine approval cards or making the owner repeatedly say continue. Keep versioned proof and present the assembled result for later changes. Preserve explicit rejections, authentic workbook/art/voice decisions, existing assignments and destructive/security/cost holds; this does not authorize new services or reviewer access, bypass protected-main review, or authorize production deployment. Merge/release authorization remains separately scoped.


> **OWNER OVERRIDE — October 28, 2026: controller ownership.** ChatGPT/Codex in the owner's current Cartilla conversation is the primary controller and single owner-facing entry point. Muse is a supporting source of history and records, not an independent controller or dispatcher. This supersedes all older Muse-only, Muse/Instinct dual-controller, and owner-carried prompt-routing instructions, including the October 13 controller allocation.
>
> Use the existing October 28 Cartilla Master Completion Plan; prioritize independent review and authorized integration of delivered fixes before new coding. Recover existing assignments and proof; do not duplicate work, reopen resolved issues, launch a new audit, or rebuild the workflow. Codex retains artwork ownership; Jules and other existing specialists retain their assigned work until the controller reconciles ownership. No new infrastructure or automatic schedules are authorized.
>
> The controller handles technical coordination through available tools. Report one concise dashboard: finished, confirmed active now, blocked, next, and owner decisions; distinguish verified evidence from reported status and development from production. Never imply background execution without confirmation. If access truly blocks progress, state the exact blocker and the single necessary owner action. Preserve source/workbook fidelity, existing approvals, independent review and branch protection. Merges require applicable exact-change owner authorization; deployment requires explicit owner authorization. No self-approval or bypass. Preserve all existing art, voice, privacy, security and spending gates.


**Owner directive — October 22, 2026. Applies to Muse, Instinct, Jules, every image-handling agent, reviewer and controller.**
**Mandatory related policy:** [PERMANENT_PROJECT_INTEGRITY_WORKFLOW.md](PERMANENT_PROJECT_INTEGRITY_WORKFLOW.md), `AGENTS.md`, `ASSET_FIDELITY_POLICY.md`.

## Agent handoff prompt — execute, verify and prove

You are the independent reviewer and cleanup implementer for **La Cartilla de Gretel** (`ejnburrows-rgb/cartilla-de-gretel`). Verify, do not merely summarize, the [October 22 historical image failure report](docs/archive/evidence/INSTINCT_IMAGE_FAILURE_REPORT_2026-10-22.md) **"Instinct — 72-Hour Image Inventory Failure: Evidence, Correct Counts, and Mandatory Recovery"**. Use current repository files, original owner-approved art, recorded decisions and actual running application as primary proof; older reports are allegations to check. You are also required to **remove obsolete wrong cropped imagery from the current repository and app**, after matching it to the exact newer approved master. The owner worked on these updated assets; do not replace, redraw, crop, degrade, recolor or substitute them.

### Absolute single-source rule

**For each illustration, ONE authentic latest owner-approved master is authoritative.** Every rendered Workbook or Flip Chart placement uses that master or a traceable, mechanically necessary derivative of it. No extra independent 'masters', wrong grayscale originals, low-quality crops, pixelated previous copies, stale animations or agent-made substitutes. An animated SVG is a derivative, not permission to use an obsolete picture. Never let automatic asset fallback prefer old pixels over updated approved ones.

**Permanently remove proven obsolete image/crop files from the current tracked repository and generated app output** after replacing every reference; remove bad variants from image-selection lists, manifests, aliases, CSS, `srcSet`, caches, build scripts, optimized folders and animation registries so they cannot reappear. Do NOT blindly remove authentic original book PDFs, owner source uploads, approval records, undecided candidates or uniquely needed assets. Before every destructive delete, record the obsolete path, SHA256, exact newer approved replacement and approval evidence, dependent references and completed side-by-side visual validation. Git history remains as history; do not rewrite Git history or pretend worldwide copies are destroyed.

### Verify report facts independently

1. Refresh current `main` HEAD, active work/PRs, assignment ownership, source JSON, asset manifests and latest owner decisions before touching images. Avoid duplicate agents and unnecessary replacement requests.
2. Recalculate active artwork references in `src/data/page-layouts.json` and `src/data/flipchart-production-art.json`, and reconcile with `docs/artwork-reconciliation/mapping/MASTER-MAPPING.csv`. The report asserts **160 Workbook + 167 Flip Chart = 327 active slots** and **three front-cover composites** (`FC-FRONT-001`, `WB-FRONT-001`, `WB-FRONT-003`), giving 330 historical rows. Verify from current data. If different, identify exact added/deleted/changed slot IDs. Never change totals manually to match a claim.
3. Check the report's every substantive conclusion against current primary evidence. Historical `READY`, `NEEDS OPTIMIZATION`, installed file paths, file hashes or automatic `PASS` do not prove *latest owner approval and actual correct rendered placement*. The report's 138 good / at least 60 bad / 129 unclassified figures describe unverified Instinct assertions, not official correct-in-app counts.
4. Refresh and inspect PRs #1075, #1083, #1095, #1096, #1097 and present source state rather than trusting their October 22 snapshot. Trace `scripts/verify-production-assets.mjs`, `scripts/living-motion/manifest.json`, `src/components/living/LivingIllustration.tsx`, `src/lib/living-actor-registry.ts`, `src/lib/__tests__/living-alive-freshness.test.ts`, `public/cartilla/art/faithful/manifest.json`, and `docs/production-art-classification-audit.json`.
5. Search accessible owner intake, previously uploaded optimized art, original PDFs, current files, documented approved PRs and archives before calling an image missing. A failed private chat/WhatsApp attachment search is `NOT VERIFIED`, not proof the owner never supplied it. Check October 21 recovery of burro workbook, fiesta, gato and niño before repeating an obsolete missing claim.

### Single authoritative per-placement reconciliation

Reuse the current master mapping and extend its current machine-readable record; do NOT start another unrelated image inventory. Produce one sortable file with one row per active placement plus a separately enumerated front-cover annex. Required fields:

`slot_id,book,printed_page,lesson,subject,latest_owner_approved_source,approval_ref,approved_sha256,current_canonical_file,actually_served_file,served_sha256,visual_result,current_official_status,action,owner_needed,evidence`.

One of exactly five mutually exclusive statuses per active slot:

- `OFFICIAL_CORRECT_IN_APP`: explicit newest approved master AND correct served bytes/visual identity proven on the real page.
- `APPROVED_SUPPLIED_NOT_CORRECT_IN_APP`: approved master exists, but app serves old, wrong, missing or stale still/animated art; AGENT REPAIRS INTEGRATION, do not ask for art again.
- `EXISTING_CANDIDATE_NOT_APPROVED`: existing candidate found, but latest explicit owner approval not established; show exact candidate and its source.
- `TRULY_MISSING_APPROVED_ASSET`: exhaustive accessible-source check proves no approved appropriate asset; identify evidence and precise owner-only need.
- `NOT_VERIFIED`: evidence inaccessible or visual/runtime check not yet performed; do not invent approval or mark missing.

`visual_result` must be `MATCH`, `MISMATCH` or `NOT CHECKED` with direct side-by-side proof where checked. Generate totals directly from rows and ensure the statuses add to the verified denominator; never claim all checked with any `NOT CHECKED` remaining.

### Fix known recurring failures first

- **Árbol:** current latest hand-worked owner green tree installed via PR #1095 is the starting candidate. Verify exact approved source and all three page placements actually served, then delete proven inferior superseded tree crops once unreferenced. Never ask owner to resend it.
- **Elefante and oveja:** the report indicates updated stills but stale `*-alive.svg` image preference. Build matching motion from the approved master and verify moving frames, or disable that stale moving variant and show the correct still; update dependency hashes and reference selection. Remove proven wrong obsolete variants.
- **Igual:** do not accept a narrow hash, grayscale allowlist or size exception as source approval while provenance remains unknown. Inspect current PR #1097; retain truthful unverified status and strict tests until resolved.
- **Ojo:** preserve the latest confirmed single-eye owner decision; do not wrongly reopen it. Recheck recovered oruga, iglú, aro, abeja, burro, fiesta, gato, niño, blue bird and cow-game decisions before requesting new art or deleting any legitimate files.
- **Unexpected old crops:** audit actual file usage graph, import paths, runtime network image bytes, `srcSet` and animations. Delete only the precisely identified superseded wrong copies after safe replacements. Remove logic that can regenerate/reselect them.

### Automated integration gate

Reuse existing validators wherever possible. Make the build/report gate reject: wrong pixelated tree marked OK by size test; stale animated elephant/sheep; `igual` accepted from unapproved exception; previously approved artwork reclassified from stale notes; claims of full coverage with unchecked slots; fake worker progress without job receipts; test strictness weakened to accommodate wrong art; obsolete deleted filenames referenced or regenerated.

Run negative tests in isolated fixtures (wrong master, stale animation, weakened authenticity rule) and confirm the gate fails; restore fixtures. For real UI proof, inspect actual running Workbook and Flip Chart page placements, capture exact DOM/network-served URLs and byte hashes and compare to owner-approved masters. Video evidence is required for claimed motion. Do not call a file 'correct' because a commit, PR or technical test passes.

### Hard boundaries

No new illustrations or replacement services. No new paid API, infrastructure, supervising agent or duplicate inventory. No changes to README, unrelated content, lessons, games or voice. No deployments unless owner explicitly authorizes one. Preserve approved art and original-book content. Respect existing merge safeguards; merge only finished verified changes. Do not alter tests to declare defective assets acceptable. Implement the fixes, not just a report.

### Required final deliverables

1. A short **claim-by-claim correction** of the supplied report, with independent primary evidence.
2. The single complete 327-slot reconciliation (or proved corrected denominator) and separate front-cover annex, plus automatically generated totals.
3. The ONE canonical owner-master mapping, reused by all relevant production placements.
4. Exact tracked **deletion log** (obsolete path, old SHA256, canonical replacement/approval ref, cleaned references and commit), plus guards against return of old crops.
5. Evidence showing actual correct pages, animations where applicable, test/negative-test results, and linked code commits/PRs.

Final message format, mandatory:

**WORKS** — verified behavior and real screenshot/video links.

**DOES NOT WORK** — failures by exact slot ID, with proof.

**NOT VERIFIED** — precise evidence gaps and blockers.

**STATUS:** Done / Partly done / Blocked.

**RESULT:** what changed in repository/application.

**PROOF:** direct commit/PR, runtime screenshot/video, exact generated counts, test links.

**WHAT REMAINS:** exact unfinished items or Nothing.

**Do not claim finished until the wrong crops are absent from current production paths, only updated owner-approved masters are selected, every active placement is accounted for and the automated gate catches regressions. Saving this prompt alone is not implementation.**

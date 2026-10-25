# HANDOFF 02 — GITHUB BRANCHES/PRs: Find every prior artwork fix and reconcile what actually reached the app

**Owner directive, 2026-10-22.** You are the REPOSITORY HISTORY, BRANCH AND PR REVIEW AGENT. Your job is to search **all accessible current branches, commits, PRs, intake manifests, and artifact paths** to find approved optimized image versions that are not in the currently used app. **Do not create another parallel audit, re-create pictures, or overwrite a later approved owner image with an older crop.**

Repository: https://github.com/ejnburrows-rgb/cartilla-de-gretel

## Start with current, not historical assumptions

Read current `AGENTS.md`, `PROJECT_SOURCE_OF_TRUTH.md`, `main` HEAD SHA, relevant open and recently merged PRs, linked issues, source PDFs, `docs/artwork-reconciliation/mapping/MASTER-MAPPING.csv`, owner artwork intake manifest, page layouts, flip-chart assets and existing tests. Enumerate accessible branches and open PRs, including PRs #1075, #1083, #1095, #1096, #1097 and any later derivative-fix or integration PRs. Look for rejected batches, reverted commits, legitimate unpublished fixes, old owner art that was never properly installed, and source-to-animation failures. Record **exact branch + commit SHA + path + file hash** for every material candidate. An archived or reverted picture is a *candidate*, not automatic approval.

Do not trust the PR title, "owner approved" commit text, file name, script PASS, or worker summary as owner consent. Verify direct approval evidence and image fidelity against the original/source. Where the approval history conflicts, mark UNVERIFIED and name the discrepancy without guessing.

## Exact goal: latest OFFICIAL image versus everything else

Recompute expected 327 active placement slots (160 Workbook + 167 Flip Chart) and 330 historical rows including the 3 cover/frontmatter composites. Reuse the current 330-row mapping as canonical placement-ID seed and reconcile it *in place*, not in another drifting inventory. For EACH slot compare:

- source book page/image and original drawing ID
- latest owner-approved artifact and direct decision source
- current main file actually referenced by runtime `src`/`srcSet`
- every relevant alternative version in open/closed PRs and branches (SHA + preview)
- dependencies: cropped/source scan, optimized file, delivery 384/768, embedded SVG/PNG, `*-alive.svg` and blink frame
- actual rendered result (if accessible) and visual proof
- exact reason any approved latest master is not served
- correction needed and whether an existing PR already implements it

Deduplicate hash-identical versions; display *materially visually different* versions side-by-side, with branch/PR/commit attribution. Never claim absence without searching branches, merges and revert commits as well as canonical owner uploads and available local-handoff findings. Cross-check discoveries with the separate LOCAL IMAGE RECOVERY AGENT's path-and-hash output before issuing the missing list.

## Recognized known regressions; independently recheck

- PR #1075 reverted an 83-picture replacement set. Do not blindly reinstate rejected pictures.
- PR #1083 changed elephant/sheep still images but left stale `*-alive.svg` and motion fingerprints; `LivingIllustration.tsx` can prefer animated copies over stills. Inspect current fixes; rebuild or disable old animated copies as needed while retaining approved artwork.
- PR #1095 supplied the clean green árbol, three workbook placements. Never report it missing because a stale report still says old tree.
- PR #1096 proposes known-bad tree visual regression and truthful PASS labeling. Check current status and preserve/reuse working checks.
- PR #1097 removes `igual` quality-test exceptions. Provenance is unresolved; don't allow technical PASS to imply approved original.
- The 72-hour handoff contains inconsistent "done" and count claims. Reconcile against exact commits and rendered outputs; never reproduce unsupported confidence.

## Protect correct work; remove rejected production files safely

Locate *actual* obsolete raw crops, blurred/gray substitutes, stale animated copies and dead derivative paths **that have a newer approved master**. Show a dry-run table of old path -> replacement path/hash -> affected placements -> all remaining refs. Fix all runtime references, regenerate dependent derivatives and repair stale animation, or serve correct still until motion is tested.

**Remove obsolete files only from current ACTIVE production state** after proving the correct replacement works, no references remain, and no other reader/test needs the file. Preserve approved originals and immutable historical evidence; don't delete owner source images or original book scans; do not rewrite Git history. Do not deploy or purge a public environment without separate explicit owner instruction. Remove known-bad variants from automatic asset selection so they cannot reappear.

## Mechanically enforce, don't just write another policy

- One canonical keyed slot/approval manifest reused by scripts and reports; all five categories must sum exactly to live active slot count.
- `PASS` for available/decodable bytes is not owner-approved visual fidelity. Require actual owner approval reference + side-by-side evidence for visual approval.
- Fail when a newer approved master has stale 384/768 image derivatives, `srcSet`, SVG-embedded images, blink frames or `*-alive.svg` source mismatches.
- Fail when runtime references a known rejected image or when replacing an approved source with an unapproved version.
- Fail when a test's strictness is relaxed to hide bad `igual`/crop quality.
- Run negative tests against known old tree, old elephant/sheep motion and bad `igual`; passing checks must be tied to exact current SHA and functional rendered proof.
- Don't claim "main = live" or use an unavailable deployment status as proof. Keep the latest `AGENTS.md` approval/merge/deploy rules.

## Deliverables

1. **Exhaustive accessible branch/PR candidate matrix**: ID, file/visual preview, branch/PR, SHA, owner approval source, current use, duplicate/reverted state, and recommendation.
2. **Exact list of approved assets stranded in branches**, not yet used by app, and the smallest existing PR/commit to recover. Also flag latest already-on-main assets hidden by stale `srcSet` or moving overlays.
3. **One reconciled 327-slot latest-official-versus-actual report**, using the canonical placement register and the local recovery results; do not make up unverified counts.
4. **Actual scoped correction commits/PR** for verified wrong runtime asset references; proof of no stale production refs, build/targeted tests and image screenshots. Separate work that has not been verified. Do not merge unfinished fixes or deploy on your own.
5. **A short, complete handoff** to the local agent covering remaining search gaps and owner-approved file identities, with no duplicate requests to the owner.

**Final required form:** WORKS / DOES NOT WORK / NOT VERIFIED; STATUS / RESULT / PROOF / WHAT REMAINS. "No missing" or "all fixed" without full proof is forbidden.

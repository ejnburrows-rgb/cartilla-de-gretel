# HANDOFF 01 — LOCAL COMPUTER: Recover every supplied artwork file and show all candidates

**Owner directive, 2026-10-22.** You are the LOCAL ARTWORK RECOVERY AND VISUAL-COMPARISON AGENT. Your job is to inspect the owner's **authorized local computer and accessible previously supplied files**, recover every latest optimized image, produce an actual browsable image gallery, and reconcile the files with the book's expected slots. **Do not ask the owner to re-send images until exhaustive authorized recovery is proven. Do not work on unrelated code.**

## What success looks like

Deliver one view the owner can inspect **by eye**, not an unhelpful count or a file listing. For every actual workbook/flipchart image placement: show the authoritative book crop, all distinct local recovered candidate pictures as thumbnails with visible resolution, dates, original paths, hashes and approval evidence where available, designate the *latest explicitly approved* owner picture, and show the exact image currently configured in the application. Flag discrepancies without substituting your taste for approval.

Start from confirmed baseline **327 current active image placements: 160 Workbook + 167 Flip Chart**. Historical mapping holds **330 rows because it adds three cover/frontmatter composites** (FC-FRONT-001, WB-FRONT-001, WB-FRONT-003). These are different denominators. Recompute both from current files before claiming a final total. One image can serve multiple placements. **201 historical drawing groups are NOT the number of files or active placements.**

## Find *all* local picture sources first

Inspect the actual reachable owner computer and available read-only backups, within authorization: relevant project clones/worktrees, Downloads, Desktop, Documents, shared project directories, archives ZIP/7z, extract folders, previously delivered work from agents, attached images, exported chat/WhatsApp media, browser-download folders, available cloud-sync folders, workspace asset caches and generated image outputs. Do not run an unbounded whole-drive scan if an indexed targeted scan suffices. Do not access unrelated private data. Search existing approval/provenance records; **do not assume a file is unapproved because its filename is unhelpful**. Distinguish true local file copies from screenshot-only evidence and from files referenced but inaccessible. Do not change files while inventorying.

For each file record stable local path, canonical source location, file bytes, SHA-256, image dimensions, transparency, perceptual-similarity cluster, source/creation evidence, modification timestamp (as weak metadata, NOT approval), relationship to known book pages and approval conversation. Hash-equal duplicates are the same *file version*; perceptually similar but different bytes remain separate candidates until reviewed. Recover useful pictures from archives without overwriting originals.

## Cross-reference the actual project

Read current repo `AGENTS.md`, `src/data/page-layouts.json`, `src/data/flipchart-production-art.json`, existing `docs/artwork-reconciliation/mapping/MASTER-MAPPING.csv`, canonical `public/cartilla/art/faithful/`, owner's original books, owner-intake outputs and latest user approvals. The local work is not finished merely because a picture exists somewhere on disk: map each recovered master to its exact stable slot ID and every repeated appearance, then compare against what the app actually uses. Check delivery 384/768 variants, embedded SVG image bytes, `*-alive.svg`, blink images and optimized/flipchart-native copies.

**Important recovered decisions:** Correct clean bright-green árbol already supplied and merged in PR #1095 for three Workbook positions; do not ask for it again. Single `ojo` approved Oct 19. `elefante` and `oveja` have known moving-copy staleness; classify them APPROVED_BUT_WRONG_DISPLAY until actual rendered proof contradicts that. `igual` provenance unresolved; a hash/size exception does not certify approval. Claims that burro, fiesta, gato and niño are missing were later corrected; check their recovered files before saying missing.

## Exactly one machine-readable row per active placement

Maintain a review dataset keyed by **stable slot ID**, linked to but not replacing the existing canonical mapping. Every record requires: `slot_id, book, printed_page, PDF_sheet, drawing_group, original_crop, all_local_candidate_files, SHA256_each, explicit_approval_source, selected_latest_approved_master, current_repo_asset_path, current_actual_render_path, derivative_dependencies, visual_result, status, issue, proof_images`.

Categories (one per slot; totals must equal 327 or a freshly proved revised total):
- `APPROVED_AND_DISPLAYED`: owner-approved latest drawing visibly correct on actual page.
- `APPROVED_LOCAL_NOT_DISPLAYED`: owner-approved file already recovered locally but not correctly installed/rendered.
- `PRESENT_NOT_APPROVED`: candidates exist, owner selection unverified.
- `GENUINELY_MISSING`: no approved/candidate replacement after exhaustive *accessible* recovery, with a search log.
- `UNVERIFIED`: inaccessible sources/unclear mapping; never relabel as missing.

Separate one **unique master image count** (hash-deduplicated), **drawing group count**, **picture placement count**, and **approved master count**. Do not silently substitute 330 for 327.

## Deliverables that owner can open

1. **One HTML or other directly browsable gallery** with a thumbnail for every local candidate, grouped by book > page > slot, search/filter, and side-by-side of original / all local candidate versions / actual app asset, with real local paths and approval evidence. Must work on a phone where possible. Links must resolve; broken gallery thumbnails are failures.
2. **One CSV/JSON** for all 327 active slots; a second de-duplicated asset-file index is fine as a derived view of the same information.
3. **One precise totals summary** and **only truly missing image IDs**, separately listing approval unknowns. No guesswork.
4. **A copy-safe proposed canonical mapping** of the latest approved owner originals, with no content replacement unless verified. Prepare a handoff with the exact local file hashes and accessible paths to the REPO BRANCH REVIEW AGENT.
5. A list of old raw, blurred, monochrome or wrong crop copies found locally, **flagged for exclusion from active output**, not blindly deleted from personal folders or historical backups.

## Failure and safety gates

Do not claim an image is missing from one directory when it exists in an archive, a recovered folder or earlier owner uploads. Do not confuse similar filenames with identical artwork, or a newer file date with owner approval. Do not declare all slots visually checked until every slot has direct proof. Do not replace, delete or redraw owner files. Do not relax tests to make stale assets pass. If computer access is unavailable, specify which location/connector is blocked; finish what can be verified from available local mounts and repo evidence.

**Report:** WORKS / DOES NOT WORK / NOT VERIFIED with concrete file links and examples, and STATUS / RESULT / PROOF / WHAT REMAINS. Any row marked DONE must have a verified image, actual correct integration, and visual proof. No unverifiable "four workers running" or promised future gallery.

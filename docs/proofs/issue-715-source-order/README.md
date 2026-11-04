# #715 — active Flip Chart source-order proof

## Verified conclusion
The historical raw-Y syllable-order defect is not reproduced. Merged #734 grouped syllable rows; merged #744 installed the active positional replica. Sheets10/16/19 match their source rows, and sheet10 has a separate centered `y` between15 vocabulary words and six reading lines. Do not repair the active screen based on a legacy-fallback-only diagnosis.

Verified product snapshot: `64666e84aa5e3e080de1fde6c1366f1f30b8aa50`.
Latest main checked: `35645c3ecbb88a62bb380800abb5c980cda563c7`.
No affected Flip Chart model/data/renderer/styles/presenter/package/config changes; reuse the focused proof. Tests/screenshots were not rerun on the newer Workbook-only revision.

## Publication scope
Owner explicitly requested pushing the test-only patch and evidence. This branch contains **no product implementation changes**, no merge/deploy, and no issue closure. `src/lib/__tests__/flipchart-715-source-order.test.ts` is the proposed narrow regression addition, independently reviewed. It is not integrated into main yet.

Existing focused tests:39/39 passed (native coverage11, active replica order3, plate fidelity25). New active-renderer tests:4/4 passed. Logs are included. No full-release test claim.

## All pages: same implementation is not all-page clearance
A fresh read-only geometry check on main35645c3 confirms all60 instructional sheets (source indexes3–62) satisfy the active replica's source text/frame requirement. They share the paper/spiral/pink presentation renderer. Covers/source indexes1–2 use separate frontmatter rendering. This is implementation/style coverage, NOT full rendered/fidelity approval for every sheet.

All53 source JPEGs9–61 were visually compared with the active model for sequence and structural word positions. The original PDF binary was not independently downloaded or byte-certified. Source indexes are not printed pages: printed=index−2.

## Remaining exact-source findings — proposals, not applied fixes
- Sheet29: preserve source stanza boundary before `Nada, nada mi patito`; source baseline gap~87.06 units, current replica64.64.
- Sheet47: preserve source stanza boundary before `–Gatita gordita`; source gap87.70, regular66.16, replica66.15 throughout.
- Sheet44: source final `arrebatado.` loses its period; native coverage currently locks `arrebatado`.
- Sheet60: source label `zepelin` becomes `zepelín`; sheet61 DOES print accented `zepelín`.
- Sheet50 normalizes three printed dots to an ellipsis glyph; not an order swap. Preserve source52 `le espuma de jabón.` and source55 `El vive` without grammar cleanup.

Smallest safe follow-up: explicit source-confirmed stanza boundaries for29/47 in the replica, preserving each second stanza's first source baseline; one-token source corrections44/60 plus focused tests. Do NOT globally lower evenLines'1.45 threshold, alter native row sorting again, change scans/art, or broaden into F15/redesign. #715 remains open.

## Repository evidence
- `source-9-35.json` and `source-36-61.json`:53 distinct per-sheet records, source identity/image hashes, independent expected sequences, raw source text and active-model coordinates, verification limits and isolated fallback-only observations.
- `source-9-35-report.md` / `source-36-61-report.md`:specialist reports.
- `browser-dom.json` / `browser-checks.json`:actual browser token order/bounds and sequence/centering assertions for10/16/19. No page errors. Browser y text center960.203125px vs viewport center960px.
- `coverage-summary.json`:coverage and no-product-change summary.
- `active-focused-tests.log` / `new-regression-tests.log`:actual prior execution logs.
- `capture-current-main.cjs`:reproducible actual-route capture script. Local Vite worker and Playwright required; dead-local Supabase configuration follows the repository harness; no real student data used.
- `sheet-10.html`, `sheet-16.html`, `sheet-19.html`:**self-contained browser proof files**. Download/open them for original-source side-by-side comparisons and untouched1920×1080 Chromium PNG captures. Each capture is embedded without recompression with SHA-256; comparison previews are resized JPEGs, not synthetic app renders. No external network request is needed to display the proof.

The full16MB session archive additionally contains source contact sheets/decisive crops, standalone PNG captures, additional browser29/44/47/60 evidence, and inspection scripts. Those archive-only files are not claimed to be individual files in this branch. The original source scans already exist in the repository at `public/cartilla/art/hd/flipchart/page-009.jpg` through `page-061.jpg`.

Durable issue checkpoint: https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/715#issuecomment-6167189770
Full raw archive was delivered in the owner's original Notion session: https://app.notion.com/chat?t=3f9844c1b46280808d0500a9e7eefb99

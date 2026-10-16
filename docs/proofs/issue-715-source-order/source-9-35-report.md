# Cartilla #715 — source fidelity, sheets 9–35

**Verified:** read-only comparison of all 27 actual source scans with the active replica model at main `64666e84aa5e3e080de1fde6c1366f1f30b8aa50`. **Rendered application acceptance remains unverified in this specialist lane.** Nothing changed in the repository, GitHub, Notion, account configuration, artwork, or source scans.

## Source identity and availability

- Individually viewed scans: `public/cartilla/art/hd/flipchart/page-009.jpg` through `page-035.jpg`, inclusive. Nine three-sheet contact sheets were viewed, plus sheet29 stanza zoom. Every sheet has a SHA-256, git blob, image dimensions, and visual evidence identifier in `evidence.json` / `per-sheet.csv`.
- These scan filenames denote **PDF/scan sheet**, not printed page: sheet9=printed7; sheet35=printed33. All 27 printed-page identifiers were visually checked.
- `teacher-flipchart.json` maps these scan paths; `CARTILLA_DIGITAL_DIRECTIVE.md`, `AGENTS.md`, and source-color extraction scripts identify physical Flip Chart/PDF renders as source authority. The canonical original is `La Cartilla de Gretel Flip Chart.pdf`.
- Original PDF binary was not found among tracked repo PDFs; those four PDFs are generated lesson/report artifacts. Scoped Notion searches for Production Hub / 00 Sources did not locate it. `tasks/plan.md` points to **Google Drive** Production Hub/00 Sources, whereas older AGENTS text says 01 Source Documents. This specialist cannot claim a byte-level match to the original PDF.

## Active renderer, not legacy fallback

`FlipchartNativeBoard.tsx:502,530–533` selects `FlipchartReplicaSheet` whenever `hasReplicaSheet` is true. **All 27 audited sheets satisfy that condition.** The active text source is `getReplicaSheet` / `replicaReadingOrder`, not `native.words` / `native.body` flow cards.

Results against independent visual transcriptions:

- **27/27 exact full text-token sequences match**: taught letter, syllables, vocabulary, key words, titles and reading lines.
- All **18 applicable syllable sheets** match; sheets10,16,19 have the correct top row and scrambled second row.
- All **18 applicable vocabulary sheets**, **18 reading sheets**, and **9 key-bar/button sheets** retain exact source text and order.
- Sheet10 **y** is a dedicated centered `chip`, not an appended word-grid cell: active center `500.355` in a 1000-unit frame; source chip panel center approximately500.357. It remains between vocabulary and the first reading line. No active-model centered-y defect is established.
- Active sheets28/34 retain the complete narrative fragments. The legacy fallback loses Napi. / La bola sube / la bola con el, but **that fallback is not rendered on these sheets**. No fix justified from those fallback defects.

## One active position discrepancy

**Sheet29, printed27 — stanza separation.** The source visibly separates the two four-line stanzas after `pide Nené con amor.` and before `Nada, nada mi patito`. Raw source-derived baseline gap is87.060 units (top-box gap90.280); active `evenLines` reduces it to64.644, exactly the ordinary line pitch.

Cause: `evenLines` detects a break only above median baseline pitch×1.45. Estimated descender baselines put this real source break below that threshold; the entire poem becomes one uniformly spaced run. Wording and line order remain correct.

Proposal: preserve the scan-confirmed boundary before `Nada, nada mi patito`, through explicit source geometry/boundary evidence. Do not blindly lower a global threshold or redesign the page. Verify the source side-by-side at a real viewport before declaring the visible defect fixed.

## Evidence and remaining gates

- `evidence.json`: primary active-model report, all raw text items, active token geometry, source IDs, independent expected sequences and isolated fallback-only observations.
- `per-sheet.csv`: all27 sheets, expected vs active syllables/vocabulary/key/reading, findings and browser-verification status.
- `word-positions.csv`:492 active tokens with coordinates, source-run coordinates and expected position role.
- `active-replica.json`: evaluated active model and reading order.
- `current-model.json` / `fallback-*`: legacy native/fallback diagnostics only, not current screen findings.
- `sources-9-11.jpg` … `sources-33-35.jpg`; `source-29-stanzas.jpg`; focus crops10/28/34.

Remaining: controller real-browser proof, original PDF provenance if required, and separate specialist coverage36–61. This report makes **no all-sheet fidelity, artwork, production, or release claim**.

## Controller checkpoint — 2026-10-14 11:20 UTC

Controller reports new main `35645c3ecbb88a62bb380800abb5c980cda563c7`, with zero changes to FlipChart model/data/board/replica/styles/package/vite since the audited head. **NO MATERIAL DELTA — REUSE PROOF.** No specialist reruns performed. Controller browser check confirms the flattened sheet29 stanza gap; controller also reports source/runtime comparisons10/16/19 and43 passing focused tests. These are explicitly controller-reported results, not new independent browser checks by this specialist. No code fix or push is proposed as executed; diagnosis/proposal lane is finished. Original PDF provenance remains unverified.

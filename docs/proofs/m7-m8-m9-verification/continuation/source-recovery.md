# Four unresolved Flip Chart scenes — bounded source recovery

Owner: Codex source_recovery. Baseline: `d613b78ba553c3c5786afdf7d589305a3080f1cf`, existing PR #1247. **WAITING** for clean source or a source-specific placement decision. No production assets, metadata, text, audio or motion changed.

This extends the existing [completion checkpoint](../COMPLETION-CHECK.md); its full original PDF, archive-hero and rendered-page findings are reused. It does not restart the 62-page audit. The full PDF hash remains `d7fb3dff4e63caf3443226e57a9ef700f8974acd4ad8f08f44e2792e13cc4930`.

## Additional sources actually examined

- Supplied Downloads archive `flipchart_all_separate_images_remastered.zip`: inspected manifest and all four `original_crops` scene candidates. The files named `modernized` are not clean original masters and were not selected.
- Supplied `la_cartilla_de_gretel_complete_package.zip`: visually inspected all 46 PNG/JPEG entries. They are Gretel pose/cover variants, not these four scenes.
- `UNMATCHED-613-art-files.zip` and `cartilla-gretel-assets.zip`: inspected archive entry listings for page/story matches; matching hero/scanned-page paths add no verified clean scene master. The existing archive-hero comparison remains applicable; no new claim of exhaustive visual review of every anonymous file is made.
- `Documents/Cartilla_Colored_Artwork_Library_2026-10-21`: checked its README, subject index and provenance scope. Its own README calls its Library alternatives unapproved and warns of changed anatomy/composition; its named subjects do not identify these four full scenes. No substitution.
- Connected Google Drive: searched Cartilla/Gretel, Sube/Jabela and exact separate-sheet names; inspected the `La Cartilla Images` folder listing. Retrieved four original separate-sheet PDFs from the existing source folder. Each is one flattened JPEG scan with zero extractable text, not separate clean art/text layers. Exact source URLs, file SHA256, image dimensions and archive-entry hashes are in [results](source-recovery-results.json).

![Separate-sheet scans above; supplied original crops below](source-recovery-comparison.jpg)

## Precise remaining material

| PDF page / lesson | Comparison and gap | Needed next action |
|---|---|---|
| 35 / 15 | `original_crops/p35_story_sube_la_bola_scene.png` cuts Bebo below the torso and trims the cloud/ball. Separate source `33-Bb.pdf` shows the full boy, bat and ground but the caption meets the left ground region; the whole scene is still part of a printed page. | Obtain the untouched complete Bebo/cloud-ball/ground illustration, or an explicit decision to preserve the authentic printed caption/ground relationship in this placement. Do not erase/invent grass. |
| 41 / 17 | `original_crops/p41_story_rosca_manolo_scene.png` cuts the mouse's lower body, lizard and lower flourish. Separate source `39-Rr inicial.pdf` retains the scene but the printed title crosses the yellow-ground/lizard region. | Obtain clean mouse/rose/wheel/lizard/full-flourish source, or approve a specific caption-preserving placement. No inferred hidden pixels. |
| 47 / 19 | `original_crops/p47_story_gato_enamorado_scene.png` cuts the large cat and food dish and trims ground. Separate source `45-Gg.pdf` retains both cats and dish but the title intersects the scene/ground region. | Obtain both cats, flowers, dish and full ground without overprinted caption, or approve a specific placement that retains the genuine source relationship. |
| 53 / 21 | `original_crops/p53_story_jicotea_jabela_scene.png` retains more of the lower bath/feet but clips the bee and upper dotted trail. Separate source `51-Jj.pdf` contains the scene and title/ground region together in a flattened scan. | Obtain the entire girl/turtle/bee/tub/ground illustration without overprint, or approve a source-specific caption-preserving placement. |

The separate-sheet PDFs have higher raster dimensions than the known full-PDF pages, but higher resolution alone does not remove caption overlap or establish a clean source. Their colors/compression were not certified against approved masters, and they were not installed.

## Limits and next action

**DONE but not live:** additional source locations, hashes, page mapping and visual comparisons are recorded. **WAITING:** the four clean full illustrations or the precise placement decisions above. **NOT TESTED:** any replacement in the app; no replacement was made. This bounded search does not prove that no clean owner original exists elsewhere, and it does not repeat completed motion, page-fit or runtime audits.

The integration owner should retain the existing four source holds and route only these exact missing-material/placement items to the artwork owner. No new art generation or broad screenshot recapture is justified by this finding.

## Continuation delta receipt — 2026-11-03

**WAITING**, unchanged. Reconciled source branch `cec30be6b72a6535cac64046e2517ccab43fac27` against its remote ref; the worktree was clean. The new continuation attachment contains only `Pasted text.txt`, not an image, PDF or source archive.

One new connected-location check was limited to accessible Google Drive image/PDF/ZIP files modified after this source receipt's commit time, `2026-11-03T13:19:42Z`. Provider metadata search returned **zero results**. This is a bounded delta search, not proof that no clean original exists elsewhere. No prior flattened PDF, archive candidate or full-page audit was repeated.

The four page-specific requests in **Precise remaining material** above remain the actionable handoff: complete Bebo/cloud-ball/ground (35), mouse/rose/wheel/lizard/flourish (41), both cats/flowers/dish/ground (47), and girl/turtle/bee/tub/ground (53), or an explicit source-specific placement decision preserving each genuine printed caption/ground relationship. A generic permission to proceed does not identify a clean source or settle placement.

No replacement was accepted or installed. Changed files in this delta: this evidence document only. Existing Lesson-4 provenance, static-scene holds and Workbook 86–87 restrictions remain untouched. Next action: artwork owner supplies the specific clean original or the source-preserving placement decision for each page; implementation then requires explicit file assignment and comparison/runtime proof.

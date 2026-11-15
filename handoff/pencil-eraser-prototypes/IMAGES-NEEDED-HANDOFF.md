# Images needed — evidence and next-agent instructions

No new book illustration was generated for these prototypes. They contain authentic repository source Workbook pages7/8 and Flip Chart samples5/7. These source scans demonstrate transitions only; production must retain its native source-faithful rendering.

## Confirmed preview assets
- Wooden pencil-tip geometry: extracted/adapted from PencilShape in src/components/cartilla/WorkbookPencilMark.tsx. Both candidates use the same underlying geometry; B is28% larger. The SVG is a source-derived preview export, not a newly owner-approved master.
- Pink eraser geometry and palette: same component; preview adapts the existing eraser end into a close-up tool. Final asset selection remains Emilio's decision.
- Original pages: public/cartilla/art/source/workbook/page-007.jpg and page-008.jpg; public/cartilla/art/hd/flipchart/page-005.jpg and page-007.jpg.
- Paper sound: public/audio/page-turn-soft.mp3. It is audio, not an image request.
- No missing new image is required to open the supplied prototypes.

## What is NOT established
There is no honest verified list yet of every absent or below-required-quality production image. The file IMAGE-QUALITY-REVIEW-QUEUE.csv is a concrete129-reference starting list, combining current page-layout references with108 assets from the checked-in production inventory. Inventory dimensions/hashes are repository evidence, not freshly measured served-image evidence. The old pencil.png path returned404 and was not used; this does not establish a broken runtime image because the mounted pencil is SVG code. An empty connector response for one large sheet was not classified as a missing source.

## Required final image-defect file
For each mounted placement: identify currentSrc, file bytes/hash, dimensions, CSS display width/height, DPR, original approved master and crop. Compare at actual phone/desktop/projector size. Check sharpness, correct image identity, transparency, clipping, ringing, stretch and source fidelity. Use intrinsic-size/DPR as an upscale warning, not an automatic aesthetic verdict. SVGs do not have the same raster resolution limit. Small file size alone is not low quality.

Write one defects-only CSV with: image ID; book/page; route; exact served path; exact approved master/hash; delivered pixels; rendered pixels/DPR; confirmed defect; screenshot comparison; recoverable original; exact correction; owner asset genuinely required or not. Keep a separate NOT VERIFIED status for gaps. Do not request materials already present elsewhere in the repo or approved source archive. Do not wholesale regenerate artwork or discard preserved originals.

Exclude pages86–87 permanently: they do not exist. Loading placeholders from the earlier audit are not proof that their images are absent. Recover and render before classifying.

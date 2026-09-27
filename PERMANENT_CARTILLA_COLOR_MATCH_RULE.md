# PERMANENT CARTILLA RECONSTRUCTION RULE

This is the governing rule for Cartilla workbook reconstruction and supersedes the older blanket color-transfer workflow.

## Canonical data
- Workbook ↔ Flip Chart reference source: `src/data/reconstruction/student-to-flipchart-284.json` (98 workbook PDF-sheet records, 284 Flip Chart links).
- PDF-sheet ↔ printed-page source: `src/data/reconstruction/pdf-sheet-to-printed-page.json`.
- Do not regenerate, reinterpret, or silently replace either mapping.

## Priority order

For every mapped workbook illustration:

### 1. Exact colored counterpart first
If the mapped Flip Chart contains the exact same illustration/drawing as the Workbook, verified by:
- subject identity and subject count;
- pose/action;
- anatomy;
- silhouette;
- proportions;
- face/expression;
- linework/internal geometry;
- props/accessories;
- orientation;
- composition;
- educational meaning;

then:
- extract/crop that already-colored Flip Chart illustration;
- remove or exclude Flip Chart-only text, backgrounds, scenery, borders, decorations, unrelated characters, and unrelated objects;
- reuse the authentic colored illustration directly in the corresponding Workbook illustration slot;
- preserve the Workbook slot's position, dimensions/aspect ratio, surrounding text/art, grid/borders, curriculum, and page geometry;
- do not redraw or regenerate the illustration.

### 2. Color-transfer fallback only
If the mapped Flip Chart illustration is related but is not geometrically identical:
- preserve the exact Workbook drawing;
- transfer only the verified Flip Chart colors/finish onto that Workbook drawing;
- do not alter line art, anatomy, pose, proportions, expression, props, composition, geometry, or educational content;
- if a deterministic color transfer cannot be verified, leave the item `COLOR_TRANSFER_REQUIRED` rather than substituting a similar image.

### 3. Never use a merely similar substitute
A similar bear, elephant, object, character, pose, or composition is not an acceptable replacement.

## Reconstruction placement rule
The real Workbook page pixels are the destination source of truth.
- locate the exact Workbook illustration region;
- replace only that region;
- never add a floating colored overlay near the target;
- never cross unrelated cell/grid boundaries;
- never leave the old grayscale counterpart visible underneath or beside the replacement;
- never alter unrelated text, labels, lines, boxes, or surrounding artwork.

## Finish
After reconstruction is correct, a separate optimization pass may improve only:
- watercolor/pigment richness;
- paper texture;
- subtle relief/pop-out depth;
- natural contact shadow;
- cleanup/resolution/print polish.

Optimization may not change content or geometry.

## Approval rule
Rendered pixels are the evidence. Metadata, manifests, coordinates, or status labels alone cannot establish PASS.

# Cartilla Artwork Optimization Standard

## Governing Rule
The Libro del alumno illustration is the authoritative source for **content and design**. Production may improve the rendering and physical-media finish, but it must not redesign the illustration.

## What Must Stay Identical
Preserve the original workbook drawing's:
- subject identity;
- number of subjects;
- pose and action;
- proportions and silhouette;
- facial expression and identifying features;
- existing props and their relationships;
- composition and layout;
- educational meaning;
- recognizable line/drawing structure.

## What May Be Optimized
The rendering may be transformed to a polished production finish:
- authentic watercolor and pigment appearance;
- intended colors supported by the Flip Chart where applicable;
- tactile real-paper texture;
- watercolor bleed/granulation where appropriate;
- dimensional cut-paper or embossed relief;
- subtle pop-out depth;
- natural paper/contact shadows;
- improved resolution, edge clarity, contrast, and scan cleanup.

## Critical Distinction
**Change the finish, not the drawing.**

This is a style/material/rendering transformation only. It is not permission to redraw, reinterpret, redesign, or replace the original character.

## Prohibited Changes
Do not:
- alter anatomy, proportions, pose, face, expression, or silhouette;
- add or remove characters, props, scenery, flowers, borders, or objects;
- substitute a different mascot/cartoon interpretation;
- turn the subject into a newly designed toy/3D character;
- copy unrelated composition or content from the Flip Chart;
- change educational meaning;
- invent missing visual information.

## Reference Hierarchy
1. **Authoritative Libro ↔ Flip Chart mapping** — `src/data/reconstruction/student-to-flipchart-284.json` is the allowed page-reference source of truth. Do not invent or remap references.
2. **Libro del alumno** — authoritative for the destination page, illustration slot, identity, geometry, composition, subject count, pose, expression, props, and educational design.
3. **Flip Chart** — when a mapped illustration is geometrically identical to the Libro drawing, the already-colored Flip Chart pixels may be reused directly after removing unrelated Flip Chart-only content. When geometry is not identical, the Flip Chart supplies only verified color/finish reference.
4. **Approved style references** — control only watercolor/paper/material/relief/lighting/finish characteristics, never content.

PDF-sheet numbering and printed-page numbering are separate. Use `src/data/reconstruction/pdf-sheet-to-printed-page.json` to translate between them; never infer page identity from an offset.

## Prompt Requirement
Every production prompt must explicitly state:
> Preserve the original drawing exactly in content and geometry. Transform only rendering, color finish, watercolor texture, paper material, depth, relief, lighting, and presentation.

## Validation Gate
An optimized asset passes only when side-by-side comparison with the source confirms that no subject feature, object, pose, proportion, composition, or educational meaning changed.


## Source-image requirement for every model edit

- Never generate a Cartilla workbook asset from text alone.
- The actual Libro del alumno crop must be attached as the PRIMARY image input for every optimization/generation.
- If the source crop is not physically attached to the image-edit operation, stop; do not generate.
- Text-only reconstructions automatically fail, even if visually attractive or conceptually similar.
- The image model may transform only finish/rendering; it may not reconstruct or reinterpret the subject from prose.
- Flip Chart inputs remain secondary, purpose-scoped references; approved style references remain finish-only.

This requirement was added after two failed text-only generations changed the workbook bear/elephant designs. Those outputs are permanently invalid for Cartilla production.

## Non-negotiable execution rule — no avoidable user handoff

- If a required action can be performed with connected tools, Remote Desktop Commander, Lovable, existing files, PDFs, mappings, browser state, repo state, Linear, or available automation, the assistant must perform it directly.
- The assistant must not ask the user to upload, copy, paste, re-enter, map, verify, click, navigate, move files, or perform any step that the assistant can execute itself with the connected capabilities.
- Before requesting user action, exhaust the existing project state, connected tools, current files, prior mappings, repo, browser/desktop state, and automation paths.
- Only a genuinely external action that cannot be performed through any connected capability may be requested from the user.
- Continue execution until the current prompt is verified complete or a true external blocker requiring user action is proven.

## Cartilla hard execution gate — added after repeated source-preservation failures

This rule overrides any convenience, image-generation shortcut, or ambiguous request to "generate", "redo", "optimize", or "show" Cartilla artwork.

### Tool-routing rule
- DO NOT use ChatGPT image generation for Cartilla workbook assets.
- DO NOT use any text-to-image path for Cartilla workbook assets.
- DO NOT treat a source image that was merely displayed in chat as proof that an image-generation tool is actually editing that source.
- For Cartilla assets, use only:
  1. deterministic source-preserving image processing on the real Libro crop; or
  2. an external image-edit workflow where the exact Libro crop is visibly attached as the edit target and verified before generation.

### Source lock
Before any Cartilla output is accepted:
- the exact Libro crop must be the pixel/geometry authority;
- pose, proportions, silhouette, face, expression, anatomy, linework, props, composition, and subject count must remain unchanged;
- mapped Flip Chart references may change only their classified property (for these pilots: color);
- style references may affect only finish/material/texture/depth/lighting.

### Mandatory pre-output verification
Before showing or importing an optimized Cartilla asset:
1. compare the result side-by-side against the actual Libro crop;
2. verify the same character geometry and line structure;
3. verify Flip Chart colors come from the mapped reference, not guessed values;
4. reject any output that changes subject design even if it looks attractive;
5. do not call the result APPROVED without explicit user approval.

### User-approval gate
- CAF-0002 and CAF-0003 remain REVIEW until the user explicitly approves the displayed comparison.
- The assistant must never self-approve Cartilla pilot artwork.
- "Looks correct to me" is not an approval event.

### Failure-stop rule
If a tool produces a redesigned subject even once:
- stop using that tool/path for Cartilla;
- do not retry the same path with another prompt;
- switch to the source-preserving pipeline;
- do not claim confidence until the source-vs-output comparison is visibly shown.



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

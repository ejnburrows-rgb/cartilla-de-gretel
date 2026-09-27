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
1. **Libro del alumno** — authoritative for identity, geometry, composition, subject count, pose, expression, props, and educational design.
2. **Flip Chart** — may supply intended color/content facts only where applicable; it never overrides the Libro drawing's geometry or composition.
3. **Approved style references** — control only watercolor/paper/material/relief/lighting/finish characteristics, never content.

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



# PERMANENT CARTILLA COLOR-MATCH RULE

This is the governing rule for Cartilla artwork and must not be reinterpreted.

## The task
For every workbook illustration:
1. Use the EXACT corresponding colored illustration from the Flip Chart as the color authority.
2. Use the EXACT workbook illustration as the shape/geometry/content authority.
3. Match the correct Flip Chart illustration to the correct workbook illustration.
4. Transfer the Flip Chart colors onto the workbook drawing.
5. Preserve the workbook drawing exactly.

## Do not change
- subject identity
- number of subjects
- pose/action
- anatomy
- silhouette
- proportions
- facial expression
- linework
- props
- composition
- educational meaning

## Do not invent
- new characters
- new objects
- new scenery
- new decorations
- new patterns
- new anatomy
- new poses
- new compositions

## Finish
After the correct colors are transferred, only finish-level enhancement is allowed:
- watercolor/pigment richness
- paper texture
- subtle relief/pop-out depth
- natural contact shadow
- cleanup/resolution/print polish

## Absolute rule
THE FLIP CHART PROVIDES THE COLORS.
THE WORKBOOK PROVIDES THE DRAWING.
DO NOT REDRAW THE WORKBOOK.
DO NOT GENERATE A SUBSTITUTE.
DO NOT USE A SIMILAR CHARACTER.
DO NOT APPROVE UNTIL THE USER VISUALLY APPROVES.

If a tool cannot preserve the exact workbook drawing while applying the exact mapped Flip Chart colors, do not use that tool.


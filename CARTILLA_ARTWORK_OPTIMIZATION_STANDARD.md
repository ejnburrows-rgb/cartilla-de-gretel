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

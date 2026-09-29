# Cartilla Artwork Standard

## Governing Rule — SUPERSEDED BY AGENTS.md EXACT REPLICA RULE
**DO NOT touch the images.** They are already fixed and cropped. Never modify,
redraw, regenerate, "improve," or modernize any artwork image. The only
permitted work is placements, layout, and CSS positioning — ONLY to make each
page match the physical book exactly.

The "modernize the finish" direction below is VOID. It is preserved here for
historical reference only. The authoritative rule is in AGENTS.md: EXACT REPLICA.

---

## Historical reference (void — do not follow)

## Canonical visual direction — Gretel 2.0 / La Cartilla
The approved visual target for Gretel, Workbook, Flip Chart, characters, animals, objects, educational illustrations, and decorative elements is:

**ORIGINAL IN ITS DNA + MODERN IN ITS FINISH + DIGITAL IN ITS EXECUTION + FAITHFUL TO LA CARTILLA IN ITS IDENTITY.**

Preserve the original La Cartilla visual DNA:
- pintura country / tole influence;
- child-friendly folk-art language;
- doll-like proportions where present in the source;
- saturated cheerful color;
- warm brown / sienna outlines;
- floral and dotted decorative details already present in the source;
- handcrafted warmth and recognizable original identity.

Modernize only the finish:
- cleaner edges and higher screen clarity;
- subtle painted texture;
- controlled soft shading;
- small highlights;
- light dimensionality;
- improved color balance;
- consistent digital polish;
- animation readability when the source is later animated.

Do not make the artwork look like an old scan. Do not flatten it into generic vector art. Do not turn it into photorealism, 3D/CGI, Pixar, anime, manga, chibi, generic modern cartoon, preschool mascot art, concept art, or contemporary nursery art.

## What Must Stay Identical
Preserve the original workbook drawing's:
- subject identity;
- number of subjects and objects;
- species;
- pose and action;
- orientation;
- proportions and silhouette;
- facial expression and identifying features;
- existing props and their relationships;
- composition and layout;
- educational meaning;
- recognizable line/drawing structure.

## What May Be Optimized
Only:
- intended color supported by the mapped Flip Chart/reference source;
- cleanup, resolution, edge clarity, and contrast;
- warm brown/sienna line treatment consistent with the original;
- subtle hand-painted texture;
- controlled highlights and gentle dimensionality;
- print/screen polish;
- separability of real movable parts for later animation, without changing the drawing.

## Critical Distinction
**Change the finish, not the drawing.**

This is a style/material/rendering transformation only. It is not permission to redraw, reinterpret, redesign, replace, or modernize the subject itself.

## Prohibited Changes
Do not:
- alter anatomy, proportions, pose, face, expression, silhouette, or line structure;
- add or remove characters, animals, props, scenery, flowers, borders, or objects;
- substitute a similar mascot/cartoon;
- modernize the physical design of an object;
- copy unrelated content from the Flip Chart;
- change educational meaning;
- invent missing visual information;
- use heavy black outlines, muted/pastel palettes, distressed vintage effects, muddy paint, or heavy cinematic shading.

## Reference Hierarchy
1. **Authoritative Workbook ↔ Flip Chart mapping** — `src/data/reconstruction/student-to-flipchart-284.json`.
2. **Libro del alumno** — authoritative for destination slot, identity, geometry, composition, subject count, pose, expression, props, and educational design.
3. **Flip Chart** — if the mapped illustration is geometrically identical, reuse the authentic colored counterpart after removing unrelated Flip Chart-only content. If not identical, use it only as verified color/finish reference.
4. **Approved Gretel 2.0 / La Cartilla style references** — finish only, never content.

Use `src/data/reconstruction/pdf-sheet-to-printed-page.json` for page translation. Never infer page identity by offset.

## Prompt Requirement
Every production edit must explicitly preserve the original drawing exactly in content and geometry and transform only color/finish, cleanup, subtle painted texture, controlled highlights, light dimensionality, and presentation.

## Source-image requirement
- Never create a Cartilla workbook asset from text alone.
- The exact Libro crop must be the PRIMARY edit target.
- If the source crop is not physically attached to the edit operation, stop.
- The model/tool may transform only finish/rendering, not reconstruct the subject from prose.
- Flip Chart inputs are secondary, purpose-scoped references.
- Gretel 2.0 style references are finish-only.

## Non-negotiable execution rule — no avoidable user handoff
- If a required action can be performed with connected tools, Remote Desktop Commander, existing files, repo state, browser state, mappings, or automation, perform it directly.
- Do not ask the user to upload, copy, paste, map, move, or verify anything the connected workflow can do.
- Exhaust current project state and connected capabilities before requesting an external action.
- Continue until the task is verified complete or a true external blocker is proven.

## Tool-routing rule
For Cartilla assets use only:
1. deterministic source-preserving processing on the real Libro/Flip Chart crop; or
2. an image-edit workflow where the exact source crop is visibly attached and remains the geometry authority.

Text-only reconstruction is invalid.

## Mandatory pre-output verification
Before importing or promoting any optimized asset:
1. compare it side-by-side with the exact source;
2. verify subject identity, count, pose, silhouette, proportions, face/expression, line structure, props, composition, and educational meaning;
3. verify mapped colors came from the approved reference rather than guesses;
4. reject redesigns even if aesthetically attractive;
5. promotion to production must follow the repository's visual QA/manifest gate.

## Failure-stop rule
If a path redesigns the subject:
- stop using that path;
- switch to the source-preserving pipeline;
- do not retry the same failed generation method with another prompt.

# PERMANENT CARTILLA RECONSTRUCTION RULE

## Canonical data
- Workbook ↔ Flip Chart: `src/data/reconstruction/student-to-flipchart-284.json`.
- PDF sheet ↔ printed page: `src/data/reconstruction/pdf-sheet-to-printed-page.json`.
- Do not regenerate, reinterpret, or silently replace either mapping.

## Priority order

### 1. Exact colored counterpart first
When the mapped Flip Chart contains the exact same illustration/drawing as the Workbook, verified by identity, count, pose/action, anatomy, silhouette, proportions, face/expression, linework, props, orientation, composition, and educational meaning:
- extract/crop that already-colored Flip Chart illustration;
- exclude Flip Chart-only text, background, scenery, borders, decorations, unrelated characters, and unrelated objects;
- reuse the authentic colored illustration directly in the corresponding Workbook slot;
- preserve the Workbook slot position, dimensions/aspect ratio, surrounding text/art, grid/borders, curriculum, and page geometry;
- do not redraw or regenerate the illustration.

### 2. Finish/color-transfer fallback only
If the mapped Flip Chart illustration is related but not geometrically identical:
- preserve the exact Workbook drawing;
- transfer only verified colors and the canonical modernized finish;
- do not alter line art, anatomy, pose, proportions, expression, props, composition, geometry, or educational content;
- if a source-preserving transfer cannot be verified, keep the item pending rather than substituting similar art.

### 3. Never use a merely similar substitute
A similar animal, object, character, pose, or composition is never an acceptable replacement.

## Reconstruction placement rule
The real Workbook page pixels remain the destination authority:
- replace only the exact illustration region;
- never cross unrelated cell/grid boundaries;
- never leave the old grayscale counterpart visible underneath or beside the replacement;
- never alter unrelated text, labels, lines, boxes, or surrounding artwork.

## Final validation rule
There is no owner-approval gate. Do not stop, wait, or ask Emilio to approve generated/remastered artwork before continuing. Legacy approval/status fields are metadata only and never a blocker.

Rendered pixels are the evidence. Metadata, manifests, coordinates, or status labels alone cannot establish PASS.


## Native Flip Chart presentation rule
The final teacher Flip Chart must be a reconstructed native e-learning/classroom presentation, not a PDF-image viewer.

- The original 62-page Flip Chart PDF/JPG scans remain authoritative source/reference/fallback material.
- Completed pages must use native digital text plus high-quality standalone illustration assets in the correct source-faithful positions.
- Remove photographed bindings, scan shadows, page-edge artifacts, and baked-in low-resolution text from the finished presentation.
- Preserve exact lesson wording, educational meaning, illustration identity, composition relationships, page sequence, and Workbook ↔ Flip Chart mapping.
- Apply the canonical Gretel 2.0 / modernized Cartilla finish to recreated artwork without redesigning the source content.
- Import and use already-generated Flip Chart-only assets before generating replacements.
- Do not wait for owner approval between generation, import, mapping, rendering, testing, deployment, or live verification.

# CARTILLA DIGITAL DIRECTIVE — For All AI Agents

**Status:** CANONICAL. This overrides all prior layout/fidelity instructions.
**Last updated:** 2026-10-03 (owner locked premium student interactions + source-preserving color transfer)

---

## The requirement in one paragraph

Build a modern e-learning platform where every page has the **same layout structure as the physical book** — the same elements, in the same arrangement, in the same order, with the same content. It should be immediately recognizable as "that page from the book." But it must feel like a **modern digital product**: clean rendering, smooth interactions, responsive, user-friendly. Do not produce a scanned-PDF look. Do not redesign the page structure. The book defines WHAT goes WHERE. You define HOW it looks and feels as a digital experience.

---

## The three layers (this is the key insight — read carefully)

Every page has three layers. Each has different rules:

### Layer 1: STRUCTURE — Must match the book
This is **fixed**. Do not change it.

- Which elements appear on the page (titles, images, text blocks, exercises)
- Their relative arrangement (what's on top, what's below, what's left/right of what)
- Their reading order (what the eye hits first, second, third)
- The page sequence (page 5 comes after page 4)

**Example:** If the book's vocabulary page has a scene illustration top-left, the big letter top-center, syllables top-right, and a 3-column image grid below — your digital page must have those same elements in that same arrangement.

### Layer 2: CONTENT — Must match the book
This is **fixed**. Do not change it.

- All text: exact words, in the same order
- All images: approved source-faithful files. The only allowed foreground change is the narrow source-preserving color-transfer exception defined below; scenic backgrounds follow `repo.md`.
- All exercises: same questions, same answer choices, same structure

**Example:** If the book says "Completa las palabras" with specific words and syllable options, you use those exact words and options. You do not rewrite, simplify, or add hints.

### Layer 3: PRESENTATION — Modern digital, your judgment
This is **flexible**. Make it excellent.

- Typography: clean, readable digital fonts (does not need to match the book's print font)
- Colors: modern palette inspired by the book (does not need to sample exact print colors)
- Spacing: comfortable digital spacing (does not need to match physical measurements)
- Interactions: animations, transitions, tap/click feedback, audio playback
- Responsiveness: adapt gracefully to different screen sizes
- Accessibility: sufficient contrast, touch targets, readable sizes

**Example:** The book's word labels are bold rounded print. Your digital version can use a clean modern sans-serif, bold, well-spaced. It does not need to replicate the exact print typeface.

---

## The recognition test

When you're done with a page, ask: **"Would the teacher recognize this as that page from the book?"**

- ✅ YES → "That's the Las Hermanitas Vocales page — scene on top, the verse panel, the 6 pictures below." → You got it right.
- ❌ NO → "This looks like a nice literacy app but I can't tell which book page it's supposed to be." → Wrong. Fix the structure.

The test is about **structure and content**, not visual style. A modern-looking page that has the right elements in the right places passes. A pixel-perfect scan replica that feels clunky and unusable fails the "modern, user-friendly" requirement.

---

## Concrete DO and DON'T

### DO
- ✅ Arrange elements to match the book's page structure
- ✅ Use all the book's text content verbatim
- ✅ Place the approved images where the book places them
- ✅ Make interactions smooth and premium. Student Workbook interaction behavior must follow `STUDENT_INTERACTION_STANDARD.md`.
- ✅ Use clean modern typography and spacing
- ✅ Adapt layout responsively (stack on mobile, expand on desktop) while preserving element order
- ✅ Add digital-native features that serve the book's pedagogy (audio read-aloud, answer checking, progress tracking)
- ✅ Create a new scenic background environment for a Workbook or Flip Chart page only when it follows `repo.md` (see Image Lock → Sole exception)

### DON'T
- ❌ Rearrange the page structure (move the grid above the header, put exercises in a different order)
- ❌ Add new content not in the book (extra exercises, new characters, new text)
- ❌ Remove content that's in the book (skip a verse, drop an image)
- ❌ Modify source artwork except for the explicitly authorized source-preserving color-transfer or background-only workflows below
- ❌ Produce a "scanned page" aesthetic (paper texture, scan artifacts, rigid print layout)
- ❌ Chase pixel-perfect measurements (matching the book's exact margins in millimeters)
- ❌ Replicate print limitations digitally (if the book's layout was constrained by print, you're free to use the screen better — as long as the structure matches)

---

## Image Lock (still in force)

> Owner clarification (EJN, 30 Sep 2026): the exact list of allowed technical cleanup and Google Flow motion, and what stays forbidden, is in `ASSET_FIDELITY_POLICY.md`. That file is the active art rule; `IMAGE_GENERATION_BAN.md` and `docs/GOOGLE_FLOW_PROMPTS.md` are historical only.
>
> Owner clarification (EJN, updated 3 Oct 2026): `repo.md` is the authoritative method for background-only generation. The two narrow owner-approved exceptions to the source lock are verified source-preserving foreground color transfer under `ASSET_FIDELITY_POLICY.md` and background-only generation under `repo.md`.

The approved/corrected/cropped book images remain source-locked.

DO NOT:
- regenerate or redraw them;
- replace them with similar artwork;
- remaster or stylistically modernize them;
- change line art, geometry, pose, proportions, composition, object count, identity, or educational meaning;
- guess or invent colors.

### Authorized foreground exception: source-preserving color transfer

Owner-approved on 2026-10-03. For an existing Workbook drawing, verified colors may be transferred from an exact mapped Flip Chart/canonical counterpart only when the Workbook drawing itself is preserved exactly. Preserve line art, geometry, pose, proportions, composition, object count, meaning, and content. Do not import Flip Chart-only scenery, labels, action marks, or objects. If a source-preserving transfer cannot be verified, leave the asset pending rather than substituting or inventing art.

### Authorized background exception: background-only generation (`repo.md`)

New scenic backgrounds may be created for Workbook and Flip Chart pages only when they follow `repo.md`. This applies only to the environment behind the original content. Foreground illustrations, characters, objects, text, lesson content, educational meaning, composition, and page structure remain unchanged.

### Image acceptance rule

Newly generated or creatively altered artwork still requires owner/ChatGPT visual approval before production use. Technical source-faithful operations — verified crop correction, transparency cleanup, lossless optimization, and the authorized source-preserving color-transfer workflow — may be executed by Jules or another implementation agent when the exact source is identified and the required before/after/provenance proof is supplied. No agent may invent replacement art.

---

## Student interaction standard

`STUDENT_INTERACTION_STANDARD.md` is the owner-approved source of truth for student-facing Workbook behavior and motion. It defines Pencil Retry, real Workbook marks, pencil-drawn matching lines, progressive-fade tracing, premium pencil/eraser drawing tools, real pencil syllable circles, pencil-written word completion, and direct sentence handwriting. Older lasso/red-X/game-like treatments are superseded.

## Reference materials

- **Layout structure:** `~/workspace/cartilla-reference/flipchart.pdf` (62 pages) and `~/workspace/cartilla-reference/workbook.pdf` (92 pages) — these define WHAT goes WHERE
- **Detailed specs:** `~/workspace/cartilla-reference/flipchart-layout-spec.md` and `workbook-layout-spec.md` — element-by-element placement guides
- **The book wins on structure.** If your implementation's structure doesn't match the book's structure, the book is right.

---

## Summary for quick reference

| Aspect | Rule |
|---|---|
| Page structure (what goes where) | MUST match the book |
| Text content | MUST match the book (verbatim) |
| Foreground images | MUST remain source-faithful; verified source-preserving color transfer is allowed under `ASSET_FIDELITY_POLICY.md` |
| Scenic backgrounds (Workbook + Flip Chart) | MAY be newly created — background environment only, following `repo.md` |
| Page sequence | MUST match the book |
| Visual style | MODERN digital (your judgment) |
| Typography | MODERN readable (not print replica) |
| Spacing/measurements | COMFORTABLE digital (not inch-for-inch) |
| Interactions | SMOOTH, delightful, expected |
| Responsiveness | YES, adapt to screen |
| New content | NO |
| Removed content | NO |

---

**If you're unsure:** Match the book's structure. Make the digital experience excellent. When in doubt about a visual detail, choose the modern user-friendly option — the owner explicitly said inch-for-inch identity is not required.

### Directive protection

`CARTILLA_DIGITAL_DIRECTIVE.md` is the standing owner directive. Do not modify, soften, reinterpret, or supersede it without the owner's explicit instruction in chat. If you find a file that contradicts it, the directive wins — update the contradicting file, not the directive. If you believe the directive is wrong, raise it with the owner in chat and wait for their decision. Do not unilaterally change it.

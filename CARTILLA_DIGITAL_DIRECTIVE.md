# CARTILLA DIGITAL DIRECTIVE — For All AI Agents

**Status:** CANONICAL. This overrides all prior layout/fidelity instructions.
**Last updated:** 2026-09-29 (owner clarified: same layout, modern digital, not inch-for-inch)

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
- All images: the approved files, unmodified (see Image Lock below)
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
- ✅ Make interactions smooth and delightful (page turns, tap feedback, audio)
- ✅ Use clean modern typography and spacing
- ✅ Adapt layout responsively (stack on mobile, expand on desktop) while preserving element order
- ✅ Add digital-native features that serve the book's pedagogy (audio read-aloud, answer checking, progress tracking)

### DON'T
- ❌ Rearrange the page structure (move the grid above the header, put exercises in a different order)
- ❌ Add new content not in the book (extra exercises, new characters, new text)
- ❌ Remove content that's in the book (skip a verse, drop an image)
- ❌ Modify any image file (see Image Lock)
- ❌ Produce a "scanned page" aesthetic (paper texture, scan artifacts, rigid print layout)
- ❌ Chase pixel-perfect measurements (matching the book's exact margins in millimeters)
- ❌ Replicate print limitations digitally (if the book's layout was constrained by print, you're free to use the screen better — as long as the structure matches)

---

## Image Lock (unchanged — still in force)

> Owner clarification (EJN, 30 Sep 2026): the exact list of allowed technical cleanup and Google Flow motion, and what stays forbidden, is in `ASSET_FIDELITY_POLICY.md`. That file is the active art rule; `IMAGE_GENERATION_BAN.md` and `docs/GOOGLE_FLOW_PROMPTS.md` are historical only.

The approved/corrected/cropped book images are final.

DO NOT:
- regenerate, redraw, recolor, remaster, or "modernize" them
- optimize their visual style
- recrop or substitute them
- change their internal geometry

Use the existing approved image files unchanged. Place them according to the book's layout structure.

### Image acceptance rule

Only images uploaded by ChatGPT are accepted into the repo. ChatGPT is the agent that handles image work correctly. No other agent (Muse, Jules, Qwen, or any other) may add, replace, or modify image files in the repo. If image work is needed, it goes through ChatGPT.

---

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
| Images | MUST use approved files, unmodified |
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

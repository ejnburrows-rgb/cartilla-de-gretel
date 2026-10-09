# ASSET FIDELITY POLICY — La Cartilla de Gretel

> **Finish contract:** Read PROJECT_FINISH_DEFINITION.md before planning or declaring Cartilla work complete. It is the canonical definition of what must be true for the entire project to be finished. Compare current verified reality against it and close only real remaining gaps.


**Owner decisions (EJN), 30 Sep 2026 and 3 Oct 2026. This is the active rule for artwork, images, color transfer, and animation.**
**Two narrow source-safe exceptions exist:** verified source-preserving color transfer for eligible Workbook foreground art, and background-only generation under `repo.md`.
It replaces `IMAGE_GENERATION_BAN.md` and `docs/GOOGLE_FLOW_PROMPTS.md`, which are kept only as history and must not guide any agent.

## The one-line rule

**Keep the approved art. Preserve the source drawing. Verified color transfer may add only source-backed color; Google Flow is for MOTION, not redesign.**

## ALLOWED

- Clean up an approved source image (dust, scan noise, jagged edges).
- Remove a bad black, gray, or checkerboard background.
- Preserve or create real transparency.
- Improve resolution or file format (for example PNG → WebP) without changing the art.
- Apply verified source-preserving color transfer to an existing Workbook drawing when an exact mapped Flip Chart/canonical counterpart exists and geometry/linework/content remain unchanged.
- Create motion from an approved static source image.
- Use Google Flow to subtly animate approved art.
- Create a new scenic background for an explicitly approved Workbook or Flip Chart context, background environment only, following `repo.md`. Creation permission does not require rendering it behind dense Student Workbook exercises.

## Source-preserving color-transfer exception

Owner-approved on 2026-10-03.

For an existing Workbook illustration, verified colors may be transferred from an exact mapped Flip Chart/canonical counterpart only when all of the following remain exactly preserved: line art, geometry, pose, proportions, expression, composition, object count, lesson meaning, and content. Do not import source-only scenery, labels, action marks, or extra objects. If an exact/source-preserving transfer cannot be verified, leave the item pending.

## Background-only exception (`repo.md`)

New scenic backgrounds may be created for explicitly approved Workbook or Flip Chart contexts when they follow `repo.md`. Dense Student Workbook exercises use the clean digital-canvas presentation and do not render full scenic wallpaper by default. Existing scenic assets remain preserved for the teacher Flip Chart and other approved contexts. This exception applies only to the background environment. Original foreground illustrations, characters, objects, text, lesson content, educational meaning, composition, and page structure remain unchanged.

## NOT ALLOWED

- Invent replacement illustrations.
- Redraw art to make it "prettier".
- Change the composition.
- Change a character's identity (face, hair, clothes, proportions) or invent/guess colors. Verified source-preserving color transfer is not an identity change.
- Add or remove objects.
- Change the educational meaning of a picture.
- Bulk-convert art to a generic 3D / polymer-clay / toy style.

## Gretel

The master is confirmed and locked.

- Machine-readable identity: `src/data/gretel-approved-master.json`.
- Production master: `public/cartilla/images/gretel/gretel-approved-master.png`.
- Original approved source: `Folk Art Girl with Red Bow.png`, selection A / left.
- Preserve the approved face, blonde hair, red bow, large blue eyes, doll-like proportions, striped blouse, blue dress, floral/country-tole details, and warm handcrafted finish.
- Never substitute a legacy pose or create a third Gretel style.

## Pages with no pictures

If the printed book page has no picture, the digital page adds no picture: do not add illustrations, characters, objects, or decorative art to the page content. A scenic background environment is permitted only when that surface/context is explicitly approved and it follows `repo.md`; dense Student Workbook pages otherwise keep the clean digital canvas.

## Motion

### Welcome video
- The current owner-approved production target is **one** 5–6 second silent welcome loop, not 31 lesson clips.
- It starts from the exact owner-approved final welcome still and approved Gretel identity.
- Motion is restrained: gentle wave, subtle breathing, natural blink, warm smile; scene and identity remain stable.
- Keep the approved still as poster/fallback and respect reduced motion/data-saving/load failure.

### In-app Gretel
- Lesson interaction uses the existing approved Gretel master/state system rather than generating a separate video/pose set.
- Motion must be purposeful and restrained. Per owner decision of 2026-10-09, living pictures move continuously, gently, and smoothly while the student works.
- Follow `STUDENT_INTERACTION_STANDARD.md` for student feedback motion.

## Before any image, source-preserving color transfer, or clip goes into the repo

1. Name the exact approved/canonical source file(s).
2. Show a before/after side by side for any changed production pixels.
3. Confirm: same line art/character, same objects, same composition, same meaning; for color transfer also prove the mapped color source.
4. If any answer is "no" or "not sure", do not commit it — leave pending or ask EJN.

For a new scenic background made under `repo.md`:

1. Name the Workbook or Flip Chart page and the original foreground illustration and text it sits behind.
2. Show the page side by side without and with the new background, with the original foreground composited unchanged.
3. Confirm: the background follows `repo.md`, and the foreground illustrations, characters, objects, text, lesson content, educational meaning, composition, and page structure are unchanged.
4. If any answer is "no" or "not sure", do not commit it — ask EJN.


## Page-turn motion and asset fidelity

The owner-approved Workbook/Flip Chart page-turn effect is a UI/runtime transform of the complete rendered page surface, not an artwork edit.

- Do not pre-warp, curl, redraw, regenerate, or permanently distort source images to create the effect.
- Workbook page turning may temporarily transform the rendered page plane and show a paper-colored underside/shadow.
- Flip Chart turning may temporarily transform the rendered sheet plane upward over the top binding/rings.
- Source illustration pixels, crop, geometry, colors, composition, text, and background assets remain unchanged before and after the transition.

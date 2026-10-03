# ASSET FIDELITY POLICY — La Cartilla de Gretel

**Owner decision (EJN), 30 Sep 2026. This is the active rule for artwork, images, and animation.**
**Source-preserving color transfer (when a verified matching source exists) and background-only generation (`repo.md`) are the authorized artwork exceptions** (see details below).
It replaces `IMAGE_GENERATION_BAN.md` and `docs/GOOGLE_FLOW_PROMPTS.md`, which are kept only as history and must not guide any agent.

## The one-line rule

**Keep the approved art. Clean it up, never redesign it. Google Flow is for MOTION, not redesign.**

## ALLOWED

- Clean up an approved source image (dust, scan noise, jagged edges).
- Remove a bad black, gray, or checkerboard background.
- Preserve or create real transparency.
- Improve resolution or file format (for example PNG → WebP) without changing the art.
- Create motion from an approved static source image.
- Use Google Flow to subtly animate approved art.
- Source-preserving color transfer for Workbook foreground artwork when a verified matching Flip Chart/canonical source exists. Preserve the exact Workbook drawing: line art, geometry, pose, proportions, composition, object count, educational meaning, and content. Transfer only verified colors.
- Create a new scenic background for a Workbook or Flip Chart page, background environment only, following `repo.md`.

## Source-preserving color transfer rule

Source-preserving color transfer IS allowed for Workbook foreground artwork when a verified matching Flip Chart/canonical source exists.
Preserve the exact Workbook drawing: line art, geometry, pose, proportions, composition, object count, educational meaning, and content. Transfer only verified colors. Do not redraw, regenerate, replace, modernize, or guess colors. If a valid counterpart cannot be verified, leave the asset pending.

## Background-only exception (`repo.md`)

New scenic backgrounds may be created for Workbook and Flip Chart pages when they follow `repo.md`. This exception applies only to the background environment. Original foreground illustrations, characters, objects, text, lesson content, educational meaning, composition, and page structure remain locked and may not be recreated, replaced, redrawn, recolored, modified, or invented.

Every NOT ALLOWED rule below still applies to all original art.

## NOT ALLOWED

- Invent replacement illustrations.
- Redraw art to make it "prettier".
- Guess colors or recolor artwork when no verified matching Flip Chart/canonical source exists.
- Change the composition.
- Change a character's identity (face, hair, clothes, colors, proportions).
- Add or remove objects.
- Change the educational meaning of a picture.
- Bulk-convert art to a generic 3D / polymer-clay / toy style.

## Gretel

- The master reference is the FIRST approved modernized **Gretel 2.0**: blonde hair, red bow, large blue eyes, doll-like face, blue dress, striped blouse, floral / country-tole details, warm brown or sienna outlines, bright clean digital finish. Not generic 3D.
- Do not pick a master by filename (for example `gretel-autentica.png`). If the master is not confirmed by EJN, stop and show EJN only the viable candidates side by side.
- Never create a third Gretel style.

## Pages with no pictures

If the printed book page has no picture, the digital page adds no picture: do not add illustrations, characters, objects, or decorative art to the page content. The only permitted addition is a scenic background environment that follows `repo.md` (see "Background-only exception").

## Motion (Google Flow)

- Only a small approved subset of clips (about 31).
- A clip plays once when the page opens, then rests on the static approved image.
- Always keep the static image as the fallback, and respect "reduced motion".
- Every clip must start from an approved static image and must not change what the image shows.

## Before any image or clip goes into the repo

1. Name the approved source file it came from.
2. Show a before/after side by side.
3. Confirm: same character, same objects, same composition, same meaning.
4. If any answer is "no" or "not sure", do not commit it — ask EJN.

For a new scenic background made under `repo.md`:

1. Name the Workbook or Flip Chart page and the original foreground illustration and text it sits behind.
2. Show the page side by side without and with the new background, with the original foreground composited unchanged.
3. Confirm: the background follows `repo.md`, and the foreground illustrations, characters, objects, text, lesson content, educational meaning, composition, and page structure are unchanged.
4. If any answer is "no" or "not sure", do not commit it — ask EJN.

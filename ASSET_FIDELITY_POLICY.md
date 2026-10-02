# ASSET FIDELITY POLICY — La Cartilla de Gretel

**Owner decision (EJN), 30 Sep 2026. This is the ONLY active rule for artwork, images, and animation.**
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

## NOT ALLOWED

- Invent replacement illustrations.
- Redraw art to make it "prettier".
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

If the printed book page has no picture, the digital page has no picture. Do not add decorative art to book pages.

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

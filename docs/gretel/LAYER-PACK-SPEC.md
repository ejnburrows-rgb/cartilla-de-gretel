# Gretel layer pack — free, no paid tools (spec §17)

Goal: a layered Gretel puppet with **zero paid tools**, keeping the most
original pixels. Approach: **cut first, generate only what's missing**.

## Step A — the builder cuts layers from the approved master (free, in code)

Source: `public/cartilla/images/gretel/gretel-approved-master.png`
(1086×1448, transparent). Python + Pillow/OpenCV are in the agent sandbox.

Same canvas size and same pixel position for every layer. Layers stack back
to front:

1. hair-back
2. legs + socks + shoes
3. skirt
4. torso (blouse, pinafore, clasped hands)
5. neck
6. head-skin
7. eyes-open
8. brows
9. mouth-rest (her current smile)
10. hair-front-left
11. hair-front-right
12. bow

Pixels that are visible in the master are copied exactly. Nothing is
repainted.

## Step B — only the pieces that don't exist in the master are generated

Use any free image tool the owner already has, with the master attached, and
paste this prompt **verbatim**:

> Use the attached image as the exact, locked reference. It is "Gretel", a folk-art girl with a red bow, wavy blonde hair, blue eyes, orange-and-red striped long sleeves, a blue pinafore dress with a red/orange flower and yellow-dot trim, white knee socks with red stitching, and black Mary Jane shoes. Do not change her face shape, proportions, colors, line style, brush texture, or outfit in any way. Do not create a new character or a new style.
>
> Produce separate PNG pieces on a fully transparent background (real alpha, no checkerboard, no white or black box). Each piece must be the same canvas size as the reference (1086×1448) and sit in exactly the same position it would occupy on her, so the pieces stack perfectly on top of the original:
> 1. Eyelids half-closed, and eyelids fully closed (for blinking), matching her skin and lash style.
> 2. Nine mouth shapes in her exact lip color and line style, same size and position as her current smile: closed lips (M/B/P), slightly open, open, wide open, rounded "o", small puckered "u", top teeth on lower lip (F/V), tongue tip behind teeth (L), and her current resting smile.
> 3. A happy expression: eyes gently smiling, matching her current eyes.
> 4. Her right arm raised in a slow friendly wave (striped sleeve, same hand style), as its own piece.
> 5. Her right arm pointing gently to her left side, as its own piece.
> 6. The parts of her face, neck, and blouse that are hidden behind her hair and hands, filled in to match, so pieces can move without leaving holes.
>
> Keep everything flat folk-art painting, exactly like the reference. No 3D, no shading changes, no new accessories, no background.

## Step C — owner approval before anything lands

- The builder shows each new piece **side by side with the master**, plus a
  short **screen recording** of the puppet using it at **1280×800** and
  **390×844**.
- The owner answers **Yes/No per piece**.
- Only **"Yes"** pieces go into `layers/manifest.json` with an approval
  reference.
- **"No"** pieces stay out, and the puppet keeps the matching part still.

### Approval checklist (one row per piece)

| Piece | Side-by-side shown | Recording 1280×800 | Recording 390×844 | Owner decision (Yes/No) | In layers/manifest.json |
|---|---|---|---|---|---|
| Eyelids half-closed | ☐ | ☐ | ☐ | ☐ | only if Yes |
| Eyelids fully closed | ☐ | ☐ | ☐ | ☐ | only if Yes |
| Mouth: closed lips (M/B/P) | ☐ | ☐ | ☐ | ☐ | only if Yes |
| Mouth: slightly open | ☐ | ☐ | ☐ | ☐ | only if Yes |
| Mouth: open | ☐ | ☐ | ☐ | ☐ | only if Yes |
| Mouth: wide open | ☐ | ☐ | ☐ | ☐ | only if Yes |
| Mouth: rounded "o" | ☐ | ☐ | ☐ | ☐ | only if Yes |
| Mouth: small puckered "u" | ☐ | ☐ | ☐ | ☐ | only if Yes |
| Mouth: top teeth on lower lip (F/V) | ☐ | ☐ | ☐ | ☐ | only if Yes |
| Mouth: tongue tip behind teeth (L) | ☐ | ☐ | ☐ | ☐ | only if Yes |
| Mouth: current resting smile | ☐ | ☐ | ☐ | ☐ | only if Yes |
| Happy expression | ☐ | ☐ | ☐ | ☐ | only if Yes |
| Right arm: wave | ☐ | ☐ | ☐ | ☐ | only if Yes |
| Right arm: point | ☐ | ☐ | ☐ | ☐ | only if Yes |
| Fills (face/neck/blouse behind hair + hands) | ☐ | ☐ | ☐ | ☐ | only if Yes |

## Fallback rule

If a free tool can't keep her identical, the fallback is **approved master +
whole-figure motion only. No off-model piece is ever used.**

## Puppet motion (only once approved layers exist)

| Motion | Timing |
|---|---|
| Breathing | 3.5 s loop, about 1% torso scale |
| Blink | every 3–6 s, random, 120 ms |
| Head tilt (listening) | 6°, 600 ms ease |
| Hair and skirt | follow-through, 150–250 ms lag |
| Wave | 2 slow cycles |
| Point | then hold |
| Cheer | gentle hop of 8 px |

- Reduced motion: static poses, mouth still, swaps without tweening.
- Asset rules: WebP/PNG under the existing asset-fidelity rules, and
  `verify:assets` must pass.
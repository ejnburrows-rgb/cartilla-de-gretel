# Chano Hand Caps

These hand caps are strictly derived from the original arm SVGs. No painting, drawing, or pixel generation was performed. They use a precise SVG `clipPath` bounding polygon to isolate the hand/glove and ruffle while leaving the rest of the arm transparent.

## Left Arm (`chano-arm-left.svg`)
- **Source**: `public/cartilla/art/chano-scene/chano-arm-left.svg`
- **Cap Output**: `public/cartilla/art/chano-scene/hand-cap-left.svg`
- **Clip Region**: `<polygon points="0,0 135,0 135,80 125,110 95,123 75,128 45,125 35,110 0,80" />`
- **Registration Box**: `{x:69, y:467, w:192, h:221}` (Same as `armLeft` in `layout.ts`)
- **Hand Center (Scene Coords)**: `(136, 524)`

## Right Arm (`chano-arm-right.svg`)
- **Source**: `public/cartilla/art/chano-scene/chano-arm-right.svg`
- **Cap Output**: `public/cartilla/art/chano-scene/hand-cap-right.svg`
- **Clip Region**: `<polygon points="25,0 175,0 175,125 145,115 105,100 70,85 45,55 25,30" />`
- **Registration Box**: `{x:574, y:516, w:175, h:206}` (Same as `armRight` in `layout.ts`)
- **Hand Center (Scene Coords)**: `(684, 569)`

## Verification
A visual inspection script was run to composite the new hand cap files over the original arm images.
The cap files use the identical `<image>` elements with identical embedded base64 `href`s and the exact same `viewBox` scale as the source.
The clipping was implemented via standard SVG `<clipPath>` nodes. This ensures that the cap pixels natively register with the exact same pixel-perfect sub-coordinate system and dimensions, without any scale skew or shifting, rendering exactly what the source arms render at the clip locations, and 100% transparent pixels everywhere else.

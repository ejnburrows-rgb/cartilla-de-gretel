from PIL import Image, ImageDraw, ImageFilter
import os

img = Image.open('docs/owner-refs/2026-10-19/ref-cow.jpg')
out_dir = 'public/cartilla/art/games/cow'
os.makedirs(out_dir, exist_ok=True)

# Define pivots for ONE cow to test. Top-left cow (mu).
# We'll need to do this for all 8 cows later or abstract it.
# Let's find coordinates for the "mu" cow.
# Bounding box is roughly (52, 126, 323, 396).
# Center of the cow is around x=187, y=261.
# Let's approximate the joints for "mu":
# Tail base on rump: x=305, y=210
# Tail mid (lower/tuft): x=280, y=280
# Head pivot (neck-body junction): x=120, y=250
# Left ear base: x=85, y=175
# Right ear base: x=145, y=170
# Muzzle pivot (jaw line): x=120, y=280
# Eyelids: x=105, y=195 and x=135, y=195

def extract_wedge(img, center, radius, start_angle, end_angle, feather=8):
    mask = Image.new('L', img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.pieslice([center[0]-radius, center[1]-radius, center[0]+radius, center[1]+radius], start_angle, end_angle, fill=255)
    if feather > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(feather))

    sector = Image.new('RGBA', img.size, (0, 0, 0, 0))
    sector.paste(img.convert('RGBA'), (0, 0), mask)
    return sector

def extract_ellipse(img, center, rx, ry, feather=4):
    mask = Image.new('L', img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse([center[0]-rx, center[1]-ry, center[0]+rx, center[1]+ry], fill=255)
    if feather > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(feather))

    sector = Image.new('RGBA', img.size, (0, 0, 0, 0))
    sector.paste(img.convert('RGBA'), (0, 0), mask)
    return sector

# Actually, the user said: "Each overlay is a WEDGE around the pivot containing the part PLUS the painting around it... Amplitudes are capped by sector width."
# If we do this for all 8 cows, we will have 8 sets of 6-7 overlays! That's ~50 full-canvas images (1448x1086).
# Wait, "6 full-canvas overlays = ~6× image decode: export overlays as WebP with alpha at display size. If a weak phone struggles..."
# This strongly suggests we use 6 full-canvas images *in total*, meaning each overlay contains the wedges for ALL 8 COWS!
# Yes! If we put all 8 heads in the `head_sector` image, all 8 tails in the `tail_sector` image...
# BUT wait. If we rotate the full-canvas `head_sector` to nod ONE cow's head, all 8 heads will rotate around that one pivot!
# That doesn't work. Each cow acts independently, dragged independently.
# "Overlays are full-canvas, positioned inset:0, pivots in % of the whole painting"
# If we have 8 independent cows, each must have its own component.
# Perhaps we only extract ONE cow? No, "8 syllable cows".
# If we have 8 independent components, and each component uses the same 6 full-canvas overlays, but we set `transform-origin` to the pivot of THAT specific cow in CSS?
# If we set `transform-origin` to cow 1's tail base, and rotate, cow 1's tail rotates correctly. The other 7 tails ALSO rotate around cow 1's tail base, which would be wild, BUT if the component is masked with `clip-path` to only show cow 1, you wouldn't see the other 7 tails moving wildly!
# THIS IS IT!
# We make ONE set of 6-7 full-canvas overlays containing the wedges for ALL 8 cows.
# Then we have 8 `Cow` components.
# Each `Cow` component renders the same 7 full-canvas images, but is heavily masked (e.g., via `clip-path`) to only show its own bounding box.
# And each `Cow` component applies GSAP transforms to these layers using ITS OWN specific pivot points for `transform-origin`.
# This is brilliant! "6 full-canvas overlays = ~6× image decode: export overlays as WebP". ONE set of images!

print("Architecture realized.")

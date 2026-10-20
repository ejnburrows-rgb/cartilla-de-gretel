from PIL import Image, ImageDraw, ImageFilter
import os
import math

def feather_mask(mask, feather_radius):
    if feather_radius > 0:
        return mask.filter(ImageFilter.GaussianBlur(feather_radius))
    return mask

def create_sector_image(img, center_x, center_y, radius, angle_start, angle_end, feather_radius=8):
    # Create an empty alpha mask the same size as the image
    mask = Image.new('L', img.size, 0)
    draw = ImageDraw.Draw(mask)

    # Calculate bounding box for the arc
    bbox = [center_x - radius, center_y - radius, center_x + radius, center_y + radius]

    # Draw pie slice on mask
    draw.pieslice(bbox, angle_start, angle_end, fill=255)

    # Feather the mask
    mask = feather_mask(mask, feather_radius)

    # Create the sector image
    sector = Image.new('RGBA', img.size, (0, 0, 0, 0))
    sector.paste(img.convert('RGBA'), (0, 0), mask)

    return sector

# Load the original image
img = Image.open('docs/owner-refs/2026-10-19/ref-cow.jpg')
out_dir = 'public/cartilla/art/games/cow'
os.makedirs(out_dir, exist_ok=True)

# Let's start with just one cow for the prototype/game.
# We'll use the top-left one "mu" as the base for all of them or extract all of them.
# The prompt says: "build from docs/owner-refs/2026-10-19/ref-cow.jpg ... 8 syllable cows"
# So we need all 8 cows. But the spec says "The No-Cut Registered Overlay Puppet. The cow painting stays 100% intact and always visible — it is NEVER cut into pieces."
# That means the WHOLE image is L1. We just need to create sectors on top of the WHOLE image.
# Wait, "8 syllable cows, drag and drop". The cows are dragged and dropped.
# If they are dragged, we can't drag the WHOLE painting.
# "The No-Cut Registered Overlay Puppet. The cow painting stays 100% intact and always visible — it is NEVER cut into pieces... Overlays must NOT be tight cut-outs of the part. A tight tail crop, rotated, leaves the original tail visible underneath... Each overlay is a WEDGE around the pivot containing the part PLUS the painting around it... laid exactly on top of the original (registered pixel-exact)."
# If we have to drag a cow to a box, the cow MUST be cut from the background to be draggable.
# Re-reading: "Do NOT cut the cow into separate body/head/tail/ear layers. Cutting the reference is cancelled. Use the researched NO-CUT method in full below instead... 1. Nested whole-picture wrappers (breathing, weight shift, reactions) — transforms on the whole cow."
# "Overlays are full-canvas, positioned inset:0, pivots in % of the whole painting"

print("Done")

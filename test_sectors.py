from PIL import Image, ImageDraw, ImageFilter
import os

img = Image.open('docs/owner-refs/2026-10-19/ref-cow.jpg')
out_dir = 'public/cartilla/art/games/cow'
os.makedirs(out_dir, exist_ok=True)

# Save the full base painting as WebP
img.save(os.path.join(out_dir, 'cow-base.webp'), 'WEBP', quality=90)

# We'll need to define pivots and sectors for each of the 8 cows!
# This seems unfeasible to do for all 8 manually right now without a script.
# Wait, "8 syllable cows, drag and drop". The game needs 8 cows.
# "The cow painting stays 100% intact... Nested whole-picture wrappers... transforms on the whole cow"
# This implies that maybe each draggable item is the ENTIRE painting wrapped in a clip-path or overflow: hidden?
# Or does the owner want 8 separate draggable items, each being the full canvas but mostly transparent except for the cow?
# No, "Nested whole-picture wrappers... transforms on the whole cow."
# "Overlays are full-canvas, positioned inset:0"
# "The cow painting stays 100% intact and always visible — it is NEVER cut into pieces."
# Does this mean the background is also dragged?
# Let's read carefully: "Skeleton first: field, fence, boxes, 8 syllable cows, drag and drop, win screen."
# "ART: cut cow sprites from the reference pixels (separate layers: body, head, tail, ears). No redrawing." -> OWNER CORRECTION: "Do NOT cut the cow into separate body/head/tail/ear layers. Cutting the reference is cancelled. Use the researched NO-CUT method in full below instead... it produces every required motion... from registered sector overlays of the SAME pixels, painting never cut."
# "Everything else in your task stands: build from docs/owner-refs/2026-10-19/ref-cow.jpg... 8 syllable cows, drag and drop"
# If we don't cut the cow from the background, we can't drag it individually without dragging the background.
# Ah, maybe the owner means "Do NOT cut the cow into separate body/head/tail/ear layers. ... Use the researched NO-CUT method ... painting never cut."
# "The No-Cut Registered Overlay Puppet. The cow painting stays 100% intact and always visible — it is NEVER cut into pieces."
# Maybe he means the COW painting. As in, each cow must not be cut into pieces?
# "Overlays are full-canvas, positioned inset:0, pivots in % of the whole painting"
# Full-canvas means the full reference image.
# If we drag the whole canvas, then 8 cows would be 8 instances of the whole canvas? No, that doesn't make sense for a drag-and-drop game.
# Let's re-read: "The No-Cut Registered Overlay Puppet. The cow painting stays 100% intact and always visible... 1. Nested whole-picture wrappers... transforms on the whole cow."
# "L1: the base painting, untouched"
# "All overlays are full-canvas, positioned inset:0, pivots in % of the whole painting"
# Okay, so we literally use the full 1448x1086 image as the base.
# How do we drag them individually?
# Maybe the 8 cows in the painting ARE the 8 syllable cows!
# Look at the painting: there are 8 cows in it, each with a syllable on it (mu, mo, me, má, ma, mi, mo, mo).
# "Coloca cada vaca en su sílaba" (Place each cow in its syllable)
# The fence has 4 drop boxes: mo, mu, ma, mi, me (wait, there are 5 boxes in the image? mo, mu, ma, mi, me).
# The user said: "8 syllable cows, drag and drop... field, fence, boxes, 8 syllable cows"
# If the whole painting is L1, maybe we use clip-path to isolate each cow for dragging?
# Wait! "Nested whole-picture wrappers (breathing, weight shift, reactions) — transforms on the whole cow."
# If we transform the whole cow, and the overlays are "full-canvas", that means each cow is animated independently?
# If we use clip-path to isolate a cow, the full-canvas overlays will still work if they are inside the same wrapper.
# Or, does "the cow painting" refer to a single cow that has been extracted?
# Original prompt: "ART: cut cow sprites from the reference pixels (separate layers: body, head, tail, ears)."
# Owner correction: "Do NOT cut the cow into separate body/head/tail/ear layers. Cutting the reference is cancelled... The cow painting stays 100% intact and always visible — it is NEVER cut into pieces."
# This means we do NOT cut the cow into body parts.
# BUT do we cut the cows out of the background?
# "The No-Cut Registered Overlay Puppet. The cow painting stays 100% intact... 1. Nested whole-picture wrappers... transforms on the whole cow... 2. Full-canvas 'sector' overlays: duplicate copies of the SAME painting, each showing only a wedge-shaped sector... laid exactly on top of the original (registered pixel-exact)."
# This strongly implies we use the ENTIRE `ref-cow.jpg` image.
# How can we drag 8 cows if they are all on the same image?
# We create 8 "Cow" components. Each Cow component contains:
# - A container with `overflow: hidden` or `clip-path` that shows ONLY that specific cow from the full image.
# - Inside this container, we have L1 (the full image, offset so the cow is visible).
# - We have L2-L8 (the full image overlays, with wedges cut out, registered exactly on top of L1).
# BUT "Overlays are full-canvas, positioned inset:0, pivots in % of the whole painting".
# If we use a `clip-path` on the outer wrapper, the inner elements can still be "full-canvas" and we animate their transforms.
# Let's test this theory.

print("Script parsed")

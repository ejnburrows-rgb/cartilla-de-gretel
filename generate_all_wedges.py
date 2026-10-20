from PIL import Image, ImageDraw, ImageFilter
import os
import json

img = Image.open('docs/owner-refs/2026-10-19/ref-cow.jpg')
out_dir = 'public/cartilla/art/games/cow'
os.makedirs(out_dir, exist_ok=True)

img.save(os.path.join(out_dir, 'cow-base.webp'), 'WEBP', quality=85)

# We need bounding boxes and joint coords for all 8 cows.
# Let's approximate them using crop and visual inspection.
# The image is 1448x1086.
# Row 1 (y approx 110-380):
# C1 "mu": x=50-320
# C2 "mo": x=360-630
# C3 "me": x=690-960
# C4 "má": x=1020-1290
# Row 2 (y approx 400-670):
# C5 "ma": x=200-470
# C6 "mi": x=510-780
# C7 "mo": x=840-1110
# C8 "mo": x=1170-1440

# I'll create a simple interactive HTML to help me find the coords quickly.
# Actually, I can just estimate them based on relative positions since the cows are nearly identical, just placed differently.
# But they have slightly different head angles and tails.
# Wait, let's write an HTML tool and serve it to get the coords perfectly.

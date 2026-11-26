"""Optional owner-reversal sheet for Workbook p.7 ojo (approved: singular ojo with ojo.png,
PROJECT_SOURCE_OF_TRUTH.md) and the p.7 avión comparison (printed page vs files in use vs
existing alternatives). Read-only; writes one comparison image."""
import os, sys
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
from _paths import PROOF
OUT = os.path.join(PROOF, "owner-decisions")
os.makedirs(OUT, exist_ok=True)
A = os.path.join(ROOT, "public/cartilla/art")
scan = Image.open(f"{A}/source/workbook/page-007.jpg").convert("RGB")
rows = [
    ("ojos", scan.crop((32, 812, 200, 975)), [("APPROVED, in use: ojo.png (singular ojo)", f"{A}/approved/lesson-3/ojo.png"),
                                             ("existing ojos.webp (also ONE eye; no two-eye file exists)", f"{A}/faithful/leccion-1/ojos.webp")]),
    ("avion", scan.crop((214, 812, 394, 975)), [("in use: faithful/vocal-a/avion.webp", f"{A}/faithful/vocal-a/avion.webp"),
                                               ("alternative: faithful/leccion-1/pez.webp", f"{A}/faithful/leccion-1/pez.webp")]),
]
cell = 300
sheet = Image.new("RGB", (3 * cell + 20, len(rows) * (cell + 40) + 10), "white")
d = ImageDraw.Draw(sheet)
for r, (word, crop, alts) in enumerate(rows):
    y = r * (cell + 40) + 30
    items = [(f"printed Workbook p.7 ({word})", crop)] + [(cap, Image.open(p)) for cap, p in alts]
    for c, (cap, im) in enumerate(items):
        im = im.convert("RGBA").copy(); im.thumbnail((cell - 10, cell - 10))
        bg = Image.new("RGBA", im.size, (205, 230, 255, 255)); bg.alpha_composite(im)
        sheet.paste(bg.convert("RGB"), (c * cell + 10, y))
        d.text((c * cell + 10, y - 18), cap, fill="black")
sheet.save(os.path.join(OUT, "p007-ojo-approved-avion-comparison.jpg"), quality=88)
print("ok")

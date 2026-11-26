"""Reconcile the seven 'no HD source' Workbook pictures against the 69 owner-intake originals
(public/cartilla/art/owner-intake/2026-10-14/manifest.json), plus igual.

The intake files carry no word names, so the match is visual. This script records the
reviewed result and writes the evidence sheets. Nothing in production is changed.
Outputs: PROOF/owner-intake-reconciliation/{intake-1-36.jpg,intake-37-69.jpg,result.json,igual-options.jpg}
"""
import json, os
from PIL import Image, ImageDraw
from _paths import PROOF, ROOT

OUT = os.path.join(PROOF, "owner-intake-reconciliation")
os.makedirs(OUT, exist_ok=True)
m = json.load(open(os.path.join(ROOT, "public/cartilla/art/owner-intake/2026-10-14/manifest.json")))
files = m["files"]
A = "public/cartilla/art/faithful"

# Visual review result (Hoplite, 2026-11-26) against intake #1-#69 in the sheets below.
REVIEW = {
    "leccion-14-n/nino.webp": {"match": None, "closest": [10, 43], "note": "Seated toddler in red-dotted yellow shirt; intake #10 (boy in wheelchair) and #43 (boy with drum) are different drawings."},
    "leccion-1/pajaro.webp": {"match": None, "closest": [39], "note": "Brown songbird; intake #39 is a yellow chick on a nest, a different drawing."},
    "leccion-1/pera.webp": {"match": None, "closest": [], "note": "No pear in the intake (#12 is an apple)."},
    "leccion-1/taza.webp": {"match": None, "closest": [], "note": "No cup in the intake."},
    "vocal-o/ola.webp": {"match": None, "closest": [25, 60], "note": "Wave; intake #25/#60 are a blowing wind cloud, not a wave."},
    "leccion-1/aguila.webp": {"match": None, "closest": [], "note": "No eagle in the intake."},
    "vocal-a/ardilla.webp": {"match": None, "closest": [], "note": "No squirrel in the intake."},
    "vocal-i/igual.webp": {"match": 1, "closest": [1], "note": "Intake #1 is an owner-supplied equals sign (two dark bars, brown outline), 1254x1254. Same subject, different finish from the 106x61 Workbook crop (plain bars); usable only with owner approval."},
}

cell, cols = 170, 12
for part, (a, b) in enumerate([(0, 36), (36, 69)]):
    sub = files[a:b]; rows = (len(sub) + cols - 1) // cols
    s = Image.new("RGB", (cols * cell, rows * (cell + 16)), "white"); d = ImageDraw.Draw(s)
    for k, f in enumerate(sub):
        im = Image.open(os.path.join(ROOT, f["path"])).convert("RGBA")
        bg = Image.new("RGBA", im.size, (255, 255, 255, 255)); bg.alpha_composite(im)
        t = bg.convert("RGB"); t.thumbnail((cell - 8, cell - 8))
        x, y = (k % cols) * cell, (k // cols) * (cell + 16)
        s.paste(t, (x + 4, y + 16)); d.text((x + 4, y + 2), f"#{a + k + 1}", fill=(200, 0, 0))
    s.save(os.path.join(OUT, f"intake-{a + 1}-{b}.jpg"), quality=80)

def tile(path, cap, size=300):
    im = Image.open(os.path.join(ROOT, path)).convert("RGBA")
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255)); bg.alpha_composite(im)
    t = bg.convert("RGB"); t.thumbnail((size, size))
    out = Image.new("RGB", (size + 10, size + 30), "white"); out.paste(t, (5, 25))
    ImageDraw.Draw(out).text((5, 5), cap, fill="black"); return out

igual_cur = tile(f"{A}/vocal-i/igual.webp", "in use: igual.webp 106x61")
igual_up = tile("docs/proofs/image-inspection-2026-11-26/recrop-candidates/igual-candidate.webp", "option A: same file enlarged 4x + sharpened")
igual_owner = tile(files[0]["path"], "option B: owner intake #1 (1254x1254)")
sheet = Image.new("RGB", (3 * 310, 330), "white")
for i, t in enumerate((igual_cur, igual_up, igual_owner)):
    sheet.paste(t, (i * 310, 0))
sheet.save(os.path.join(OUT, "igual-options.jpg"), quality=88)

result = {"intakeManifest": "public/cartilla/art/owner-intake/2026-10-14/manifest.json", "intakeCount": len(files),
          "method": "visual comparison against numbered contact sheets intake-1-36.jpg / intake-37-69.jpg",
          "pictures": {k: {**v, "closestPaths": [files[i - 1]["path"] for i in v["closest"]]} for k, v in REVIEW.items()},
          "scope": "Only the 2026-10-14 intake folder (69 originals) is compared here. Absence here is not repository-wide absence; see history-search.json for the wider search.",
          "notFoundIn20261014Intake": [k for k, v in REVIEW.items() if v["match"] is None]}
json.dump(result, open(os.path.join(OUT, "result.json"), "w"), indent=1, ensure_ascii=False)
print(len(result["notFoundIn20261014Intake"]), "not found in the 2026-10-14 intake:", ", ".join(result["notFoundIn20261014Intake"]))

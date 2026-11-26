"""Extract the non-delivery historical versions found by search-history.py, plus the
current file, into one comparison sheet per word for visual review.
Writes PROOF/owner-intake-reconciliation/history-<word>.jpg and adds sizes to history-search.json.
"""
import io, json, os, subprocess
from PIL import Image, ImageDraw
from _paths import PROOF, ROOT

D = os.path.join(PROOF, "owner-intake-reconciliation")
res = json.load(open(os.path.join(D, "history-search.json")))
MAIN = {"nino": "leccion-14-n/nino", "pajaro": "leccion-1/pajaro", "pera": "leccion-1/pera", "taza": "leccion-1/taza",
        "ola": "vocal-o/ola", "aguila": "leccion-1/aguila", "ardilla": "vocal-a/ardilla"}

def blob_bytes(ref_path):
    return subprocess.run(["git", "show", ref_path], cwd=ROOT, capture_output=True, check=True).stdout

def tile(img, cap, size=230):
    im = img.convert("RGBA"); im.thumbnail((size, size))
    bg = Image.new("RGBA", im.size, (205, 230, 255, 255)); bg.alpha_composite(im)
    t = Image.new("RGB", (size + 10, size + 34), "white"); t.paste(bg.convert("RGB"), (5, 5))
    d = ImageDraw.Draw(t)
    for i, line in enumerate([cap[:38], cap[38:76]]):
        d.text((5, size + 8 + i * 12), line, fill="black")
    return t

for w, versions in res["otherVersions"].items():
    tiles = [tile(Image.open(os.path.join(ROOT, f"public/cartilla/art/faithful/{MAIN[w]}.webp")), f"IN USE (main) {MAIN[w]}")]
    for v in versions:
        full = [p for p in v["paths"] if "/delivery/" not in p]
        if not full:
            continue
        ref = next((x for x in v["where"] if not x.startswith("main@")), v["where"][0])
        ref = ref.replace("main@", "") if ref.startswith("main@") else ref
        try:
            im = Image.open(io.BytesIO(blob_bytes(f"{ref}:{full[0]}")))
        except Exception as e:  # blob not retrievable (partial fetch)
            v["size"] = None; v["error"] = str(e)[:80]; continue
        v["size"] = list(im.size)
        tiles.append(tile(im, f"{os.path.basename(full[0])} {im.size[0]}x{im.size[1]} @{ref.split('/')[-1][:20]}"))
    sheet = Image.new("RGB", (len(tiles) * 240, 264), "white")
    for i, t in enumerate(tiles):
        sheet.paste(t, (i * 240, 0))
    sheet.save(os.path.join(D, f"history-{w}.jpg"), quality=82)
    print(w, len(tiles) - 1, "non-delivery versions shown")
json.dump(res, open(os.path.join(D, "history-search.json"), "w"), indent=1, ensure_ascii=False)

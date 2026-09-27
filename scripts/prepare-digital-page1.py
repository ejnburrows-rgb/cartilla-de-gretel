"""Prepare the first lesson page using measured master pixels and live layout."""

import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/cartilla/art/reconstructed/workbook/page-001.png"
DEST = ROOT / "public/cartilla/art/digital/page-001"
DEST.mkdir(parents=True, exist_ok=True)
X = [45, 325, 612, 893, 1179]
Y = [360, 613, 866, 1117, 1368, 1620]
image = Image.open(SOURCE).convert("RGB")
assert image.size == (1836, 2376), image.size
sx, sy = image.width / 1376, image.height / 1780

def box(left, top, right, bottom):
    return {
        "x": round(left / 1376, 6),
        "y": round(top / 1780, 6),
        "width": round((right - left) / 1376, 6),
        "height": round((bottom - top) / 1780, 6),
    }

for row in range(5):
    for col in range(4):
        crop = image.crop(tuple(round(value) for value in (
            (X[col] + 5) * sx, (Y[row] + 5) * sy,
            (X[col + 1] - 5) * sx, (Y[row + 1] - 5) * sy,
        )))
        rgba = Image.new("RGBA", crop.size)
        pixels = []
        for r, g, b in crop.getdata():
            distance = 255 - min(r, g, b)
            alpha = max(0, min(255, int((distance - 9) * 255 / 23)))
            pixels.append((r, g, b, alpha))
        rgba.putdata(pixels)
        rgba.save(DEST / f"r{row + 1}-c{col + 1}.png", optimize=True)

LAYOUTS = ROOT / "src/data/page-layouts.json"
document = json.loads(LAYOUTS.read_text(encoding="utf-8"))
page = document["pages"]["1"]
instruction, grid = page["regions"][:2]
instruction.update(box(45, 136, 1180, 285))
instruction["label"] = "Instrucciones:"
instruction["text"] = (
    "Circula los dibujos de las palabras en cada línea horizontal "
    "que comienzan con el mismo sonido."
)
grid.update(box(X[0], Y[0], X[-1], Y[-1]))
grid["gridColumnFracs"] = [round((X[i + 1] - X[i]) / (X[-1] - X[0]), 6) for i in range(4)]
grid["gridRowFracs"] = [round((Y[i + 1] - Y[i]) / (Y[-1] - Y[0]), 6) for i in range(5)]
assert len(grid["cells"]) == 20
for i, cell in enumerate(grid["cells"]):
    row, col = divmod(i, 4)
    cell.update(box(X[col] + 5, Y[row] + 5, X[col + 1] - 5, Y[row + 1] - 5))
    cell["illustrationSrc"] = f"/cartilla/art/digital/page-001/r{row + 1}-c{col + 1}.png"

page.setdefault("digitalStatus", "batch-pending-visual-qa")
page["referenceImage"] = "/cartilla/art/reconstructed/workbook/page-001.png"
page["regions"] = [instruction, grid,
    {"id": "p1-lesson-label", "regionType": "footer", "order": 2,
     "fontRole": "body", "text": "Lección 1", "textAlign": "start", **box(30, 1663, 190, 1731)},
    {"id": "p1-printed-number", "regionType": "page-number", "order": 3,
     "fontRole": "body", "text": "1", **box(1203, 1663, 1264, 1732)},
]
LAYOUTS.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Wrote 20 page-1 illustrations and measured digital geometry to {DEST}")

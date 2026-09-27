"""Extract the exact page-2 artwork without copying raster text or grid rules."""

from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/cartilla/art/reconstructed/workbook/page-002.png"
DEST = ROOT / "public/cartilla/art/digital/page-002"
DEST.mkdir(parents=True, exist_ok=True)

# Measured from the locked 1376 x 1780 reconstructed master. Crop inside
# each printed rule; transparent white removes the scanned cell background.
X = [198, 477, 760, 1043, 1331]
Y = [324, 576, 828, 1079, 1330, 1582]
image = Image.open(SOURCE).convert("RGB")
assert image.size == (1836, 2376), image.size
sx, sy = image.width / 1376, image.height / 1780

for row in range(5):
    for col in range(1, 4):
        crop = image.crop(tuple(round(value) for value in (
            (X[col] + 5) * sx, (Y[row] + 5) * sy,
            (X[col + 1] - 5) * sx, (Y[row + 1] - 5) * sy,
        )))
        rgba = Image.new("RGBA", crop.size)
        output = []
        for r, g, b in crop.getdata():
            # Preserve the illustration pixels and antialiased outlines while
            # discarding only near-white paper and faint scan noise.
            distance = 255 - min(r, g, b)
            alpha = max(0, min(255, int((distance - 9) * 255 / 23)))
            output.append((r, g, b, alpha))
        rgba.putdata(output)
        rgba.save(DEST / f"r{row + 1}-c{col + 1}.png", optimize=True)

print(f"Wrote 15 authentic illustrations to {DEST}")

LAYOUTS = ROOT / "src/data/page-layouts.json"
document = json.loads(LAYOUTS.read_text(encoding="utf-8"))
page = document["pages"]["2"]
instruction, grid = page["regions"][:2]

def box(left, top, right, bottom):
    return {
        "x": round(left / 1376, 6),
        "y": round(top / 1780, 6),
        "width": round((right - left) / 1376, 6),
        "height": round((bottom - top) / 1780, 6),
    }

page.setdefault("digitalStatus", "pilot-pending-visual-qa")
page["referenceImage"] = "/cartilla/art/reconstructed/workbook/page-002.png"
instruction.update(box(201, 143, 1310, 239))
instruction["label"] = "Instrucciones:"
instruction["text"] = "Circula el dibujo que comienza con la vocal del recuadro."
grid.update(box(X[0], Y[0], X[-1], Y[-1]))
grid["gridColumnFracs"] = [round((X[i + 1] - X[i]) / (X[-1] - X[0]), 6) for i in range(4)]
grid["gridRowFracs"] = [round((Y[i + 1] - Y[i]) / (Y[-1] - Y[0]), 6) for i in range(5)]
for row_index, row in enumerate(grid["vowelRows"]):
    row.update(box(X[0], Y[row_index], X[-1], Y[row_index + 1]))
    for col_index, cell in enumerate(row["cells"], start=1):
        cell.update(box(X[col_index] + 5, Y[row_index] + 5,
                        X[col_index + 1] - 5, Y[row_index + 1] - 5))
        cell["illustrationSrc"] = (
            f"/cartilla/art/digital/page-002/r{row_index + 1}-c{col_index + 1}.png"
        )
page["regions"] = [
    instruction,
    grid,
    {
        "id": "p2-printed-number", "regionType": "page-number", "order": 2,
        "fontRole": "body", "text": "2", **box(102, 1656, 161, 1735),
    },
    {
        "id": "p2-lesson-label", "regionType": "footer", "order": 3,
        "fontRole": "body", "text": "Lección 1", **box(1193, 1659, 1348, 1722),
    },
]
LAYOUTS.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Added measured page-2 geometry to page-layouts.json")

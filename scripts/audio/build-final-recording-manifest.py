# Build the single recording inventory from existing authored registries, not filenames.
import csv
import hashlib
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "docs/audio/FINAL-RECORDING-MANIFEST.csv"
FIELDS = ["id", "category", "spanish_wording", "filename", "lessons", "workbook_pages", "region_ids", "status", "sha256", "source", "notes"]


def load(path):
    return json.loads((ROOT / path).read_text())


def digest(src):
    path = ROOT / "public" / src.lstrip("/")
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else ""


def main():
    inventory = load("src/content/instruction-recordings.json")
    layouts = load("src/data/page-layouts.json")["pages"]
    pages = load("src/data/book-transcription/lessons-01-07.json")["pages"]
    lesson_for = {int(p): str(data.get("lesson", "")) for p, data in pages.items()}
    later = load("src/data/book-transcription/lessons-08-24.json")["lessons"]
    for lesson in later.values():
        for page in lesson["pages"].values():
            if isinstance(page, int) and page not in (86, 87):
                lesson_for[page] = str(lesson["lesson"])
    mappings = inventory["mappings"]
    rows = []
    for rec in inventory["recordings"]:
        uses = [m for m in mappings if rec["line"] in m["lines"]]
        row = dict(id="instruction-line-" + str(rec["line"]), category="instruction", spanish_wording=rec["text"], filename=rec["src"], status="RECOVERED_AWAITING_OWNER_AUDIO_APPROVAL", source=rec["source"], notes="Exact wording from existing recording registry. Printed uses may prefer an explicit Lesson 3 override. No activation authorized.")
        row.update(lessons=";".join(sorted({lesson_for.get(m["page"], "") for m in uses})), workbook_pages=";".join(str(p) for p in sorted({m["page"] for m in uses})), region_ids=";".join(m["regionId"] for m in uses), sha256=digest(rec["src"]))
        assert row["sha256"] == rec["sha256"], rec["src"]
        rows.append(row)
    for file, page, region in [("p7-instr", 7, "p7-instr"), ("p8-instr", 8, "p8-instr"), ("p9-instr1", 9, "p9-instr1"), ("p9-instr2", 9, "p9-instr2"), ("muy-bien", None, None)]:
        match = next((m for m in mappings if m["regionId"] == region), None)
        src = "/audio/leccion3/" + file + ".mp3"
        rows.append(dict(id="lesson3-" + file, category="instruction" if match else "feedback", spanish_wording=match["text"] if match else "", filename=src, lessons="3", workbook_pages=str(page) if page else "", region_ids=region or "", status="RECOVERED_AWAITING_OWNER_AUDIO_APPROVAL", sha256=digest(src), source="audio-cfcac090.mp3", notes="Printed wording for listening comparison, not a new transcript. " + ("Explicit mapping override." if match and match.get("overrideSrc") == src else "Preserved, not automatically wired.")))
    recordings = {r["key"]: r for r in load("src/content/picture-name-recordings.json")["approved"] if r.get("approval")}
    def contains_image(value, images):
        if isinstance(value, dict):
            return any(contains_image(v, images) for v in value.values())
        if isinstance(value, list):
            return any(contains_image(v, images) for v in value)
        return isinstance(value, str) and value in images
    for word in load("src/content/picture-vocabulary.json"):
        rec = recordings.get(word["key"])
        uses = sorted(int(p) for p, layout in layouts.items() if int(p) not in (86, 87) and contains_image(layout, set(word["images"])))
        src = rec["src"] if rec else ""
        rows.append(dict(id="picture:" + word["key"], category="picture", spanish_wording=word["name"], filename=src, lessons=";".join(sorted({lesson_for.get(p, "") for p in uses})), workbook_pages=";".join(map(str, uses)), region_ids="", status="EXISTING_APPROVAL_FILE_PRESENT" if rec and digest(src) else "MISSING_APPROVED_RECORDING_SOURCE_WORDING_REVIEW", sha256=digest(src) if src else "", source="src/content/picture-name-recordings.json" if rec else "src/content/picture-vocabulary.json", notes=rec["approval"] if rec else "Registry label only, not a recording request or approved spoken script. Resolve source/scene wording and archive recovery before asking for new audio."))
    assert len({row["id"] for row in rows}) == len(rows)
    assert all(r["sha256"] for r in rows if r["status"].startswith("RECOVERED"))
    assert all(m["page"] not in (86, 87) for m in mappings)
    out = io.StringIO(newline="")
    writer = csv.DictWriter(out, fieldnames=FIELDS, lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    OUTPUT.write_text(out.getvalue())
    print(json.dumps({"rows": len(rows), "recovered_files": sum(r["status"].startswith("RECOVERED") for r in rows), "instruction_regions": len(mappings), "pictures_approved_present": sum(r["status"] == "EXISTING_APPROVAL_FILE_PRESENT" for r in rows), "picture_registry_gaps": sum(r["status"].startswith("MISSING") for r in rows)}, indent=2))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Map OWNER-RECORDED audio to workbook lesson/page IDs, without synthesis.

Reads the canonical GUION_GRABACION.csv. A clip is allowed into student playback
ONLY with an independently checked timestamp and matching heard transcript.
Source audio must stay private until approved individual clips are exported.
"""
from __future__ import annotations
import argparse
import csv
import hashlib
import json
import re
import subprocess
import unicodedata
from pathlib import Path

def normalize(text: str) -> str:
    return " ".join(re.findall(r"[a-zñáéíóúü0-9]+", unicodedata.normalize("NFC", text.lower())))

def catalog_from_csv(path: Path) -> list[dict]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    seen = set()
    output = []
    for row in rows:
        ident = row["clip_id"].strip()
        if not re.fullmatch(r"GR\d{4}", ident) or ident in seen:
            raise ValueError("Duplicate/unsafe clip ID: " + ident)
        seen.add(ident)
        lesson = int(float(row["lesson"])) if row["lesson"] else None
        page = int(float(row["page"])) if row["page"] else None
        if lesson is not None and not 1 <= lesson <= 24:
            raise ValueError("Invalid lesson: " + ident)
        if page is not None and (not 1 <= page <= 90 or page in (86, 87)):
            raise ValueError("Invalid workbook page: " + ident)
        output.append(dict(clip_id=ident, category=row["category"], section=row["section"],
                           lesson=lesson, page=page, text_es=row["text_es"].strip()))
    return output

def audio_duration(path: Path) -> float:
    value = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=nokey=1:noprint_wrappers=1", str(path)
    ], text=True)
    return float(value.strip())

def build_map(script: Path, sources: dict[str, Path], verified_cues: Path | None,
              out: Path, *, export_verified: bool = False) -> dict:
    rows = catalog_from_csv(script)
    by_id = {entry["clip_id"]: entry for entry in rows}
    media = {ident: {"path": str(file), "duration_s": audio_duration(file),
                     "sha256": hashlib.sha256(file.read_bytes()).hexdigest()}
             for ident, file in sources.items()}
    cues = json.loads(verified_cues.read_text("utf-8")) if verified_cues else []
    if not isinstance(cues, list):
        raise ValueError("Cue map must contain an array")
    approved = {}
    for item in cues:
        ident, source = item.get("clip_id"), item.get("source_id")
        if ident not in by_id or source not in media or ident in approved:
            raise ValueError("Unknown/duplicate recording: " + str(ident))
        if item.get("verified_by") not in ("manual_listening", "asr_and_listening"):
            raise ValueError("Cannot publish unmatched audio: " + ident)
        if normalize(item.get("verified_text", "")) != normalize(by_id[ident]["text_es"]):
            raise ValueError("Transcript does not match book: " + ident)
        start, end = item.get("start_s"), item.get("end_s")
        if not isinstance(start, (int, float)) or not isinstance(end, (int, float)) or not 0 <= start < end <= media[source]["duration_s"]:
            raise ValueError("Invalid timestamp: " + ident)
        approved[ident] = item
    lessons = {str(n): [] for n in range(1, 25)}
    pages = {str(n): [] for n in range(1, 91) if n not in (86, 87)}
    for entry in rows:
        if entry["lesson"] is not None:
            lessons[str(entry["lesson"])].append(entry["clip_id"])
        if entry["page"] is not None:
            pages[str(entry["page"])].append(entry["clip_id"])
    out.mkdir(parents=True, exist_ok=True)
    full = {"version": 2, "sources": media, "lessons": lessons, "pages": pages,
            "entries": [dict(entry, audio=approved.get(entry["clip_id"])) for entry in rows]}
    (out / "gretel_book_audio_map.json").write_text(
        json.dumps(full, ensure_ascii=False, indent=2), encoding="utf-8")
    playable = []
    for ident, cue in approved.items():
        if not export_verified:
            continue  # A verified timestamp without an actual MP3 is NOT playable.
        entry = by_id[ident]
        filename = "gretel_" + ident.lower() + ".mp3"
        if export_verified:
            folder = out / "audio"
            folder.mkdir(exist_ok=True)
            subprocess.run([
                "ffmpeg", "-nostdin", "-loglevel", "error", "-y",
                "-ss", str(cue["start_s"]), "-t", str(cue["end_s"] - cue["start_s"]),
                "-i", str(sources[cue["source_id"]]), "-vn", "-ac", "1", "-ar", "24000",
                "-codec:a", "libmp3lame", "-q:a", "4", str(folder / filename)
            ], check=True, timeout=90)
            if (folder / filename).stat().st_size < 2000:
                raise ValueError("Extracted audio is empty: " + ident)
        playable.append({"clip_id": ident, "text": entry["text_es"], "page": str(entry["page"] or ""),
                         "lesson": str(entry["lesson"] or ""), "category": entry["category"],
                         "urls": ["/audio/gretel/clips/" + filename],
                         "status": "approved", "audio_verified": True})
    (out / "gretel-recorded-manifest-approved-only.json").write_text(
        json.dumps({"version": 1, "entries": playable}, ensure_ascii=False, indent=2),
        encoding="utf-8")
    summary = {"script_entries": len(rows),
               "lesson_specific": sum(x["lesson"] is not None for x in rows),
               "page_specific": sum(x["page"] is not None for x in rows),
               "lessons": len(lessons), "pages": sum(bool(v) for v in pages.values()),
               "verified_audio_cues": len(approved),
               "unmatched_audio_cues": len(rows) - len(approved),
               "source_recordings": len(sources)}
    (out / "mapping_status.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    return summary

def main() -> None:
    p = argparse.ArgumentParser(description="Recorded Gretel voice to workbook map — NO TTS")
    p.add_argument("--script", type=Path, required=True)
    p.add_argument("--recording", nargs=2, action="append", required=True, metavar=("ID", "PATH"))
    p.add_argument("--verified-cues", type=Path)
    p.add_argument("--output", type=Path, required=True)
    p.add_argument("--extract-verified", action="store_true")
    a = p.parse_args()
    print(json.dumps(build_map(a.script, {key: Path(file) for key, file in a.recording},
                               a.verified_cues, a.output, export_verified=a.extract_verified),
                     indent=2))
if __name__ == "__main__":
    main()

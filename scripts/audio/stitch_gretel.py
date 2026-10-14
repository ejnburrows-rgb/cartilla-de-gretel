#!/usr/bin/env python3
"""Cut and stitch previously recorded Gretel speech. No voice AI model or paid API."""
from __future__ import annotations
import argparse
import json
import re
from pathlib import Path
from pydub import AudioSegment

def load_cues(path: Path) -> dict:
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    seen = set()
    for segment in data["segments"]:
        name = segment["id"]
        if not re.fullmatch(r"[A-Za-z0-9_-]{1,64}", name):
            raise ValueError(f"unsafe cue ID: {name}")
        if name in seen:
            raise ValueError(f"duplicate cue ID: {name}")
        seen.add(name)
        if not (0 <= float(segment["start"]) < float(segment["end"])):
            raise ValueError(f"invalid cue timing: {name}")
        if not segment.get("text"):
            raise ValueError(f"missing transcript: {name}")
    for key in data["playlist"]:
        if key not in seen:
            raise ValueError(f"unknown playlist cue: {key}")
    return data

def stitch_audio(source: Path, cue_sheet: Path, output_dir: Path, gap_ms: int = 320) -> dict:
    if gap_ms < 0 or gap_ms > 5000:
        raise ValueError("gap_ms out of bounds")
    data = load_cues(cue_sheet)
    recording = AudioSegment.from_file(source)
    output_dir = Path(output_dir)
    (output_dir / "clips").mkdir(parents=True, exist_ok=True)
    sections, texts = {}, {}
    for item in data["segments"]:
        start, end = round(float(item["start"])*1000), round(float(item["end"])*1000)
        if end > len(recording):
            raise ValueError(f"cue {item['id']} ends past source audio")
        segment = recording[start:end]
        if len(segment) < 150:
            raise ValueError(f"cue {item['id']} too short")
        segment = segment.fade_in(min(25, len(segment)//4)).fade_out(min(35, len(segment)//4))
        sections[item["id"]] = segment
        texts[item["id"]] = item["text"]
        segment.export(output_dir / "clips" / (item["id"] + ".mp3"),
                       format="mp3", bitrate="128k", parameters=["-ac", "1"])
    stitched = AudioSegment.silent(duration=220)
    for i, key in enumerate(data["playlist"]):
        stitched += sections[key]
        if i + 1 < len(data["playlist"]):
            stitched += AudioSegment.silent(duration=gap_ms)
    stitched += AudioSegment.silent(duration=350)
    stitched.export(output_dir / "stitched-demo.mp3", format="mp3",
                    bitrate="160k", parameters=["-ac", "1"])
    (output_dir / "stitched-demo.txt").write_text(
        "\n".join(texts[k] for k in data["playlist"]) + "\n", encoding="utf-8")
    return {"clips":len(sections), "demo_seconds":round(len(stitched)/1000,2),
            "source_seconds":round(len(recording)/1000,2)}

def main():
    parser = argparse.ArgumentParser(description="Reassemble existing Gretel audio without voice cloning")
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--cues", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(stitch_audio(args.source,args.cues,args.output),ensure_ascii=False))

if __name__ == "__main__":
    main()

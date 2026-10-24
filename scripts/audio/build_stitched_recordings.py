#!/usr/bin/env python3
"""Export original contiguous speech; never stitch rejected music/stutter MP3s."""
from __future__ import annotations
import argparse, hashlib, json, re, subprocess, zipfile
from pathlib import Path

EXPECTED_SOURCE_SHA256 = "239e3518f364adfcefab39f4220a4b2b85a6e3987679af823d7ef0f26f76935d"

def load_boundaries(path: Path) -> dict:
    if path.suffix.lower() == ".zip":
        with zipfile.ZipFile(path) as package:
            data = json.loads(package.read("151_verified_source_boundaries.json"))
    else:
        data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("source_sha256") != EXPECTED_SOURCE_SHA256:
        raise ValueError("Incorrect original-source timestamps")
    return {s["segment_id"]: s for s in data["segments"] if s["waveform_boundary_verified"]}

def rebuild(source: Path, boundaries_file: Path, plan_file: Path, output: Path) -> dict:
    if hashlib.sha256(source.read_bytes()).hexdigest() != EXPECTED_SOURCE_SHA256:
        raise ValueError("Wrong recording: the 67-clip music/stutter archive is rejected")
    boundaries = load_boundaries(boundaries_file)
    plan = json.loads(plan_file.read_text(encoding="utf-8"))
    if plan.get("version") != 2:
        raise ValueError("Only master-source plan version 2 accepted")
    output.mkdir(parents=True, exist_ok=True)
    produced = {}
    for item in plan["sequences"]:
        name = item["id"]
        ids = item["segment_ids"]
        if not re.fullmatch(r"[A-Za-z0-9_-]{1,72}", name):
            raise ValueError("Unsafe output name")
        if not ids or any(key not in boundaries for key in ids):
            raise ValueError("Unknown recording segment")
        if item.get("page") is not None or item.get("trigger") is not None:
            raise ValueError("Untranscribed speech cannot be assigned to workbook pages or feedback")
        segs = [boundaries[key] for key in ids]
        if any(a["end_s"] >= b["start_s"] or a["segment_id"] >= b["segment_id"]
               for a,b in zip(segs,segs[1:])):
            raise ValueError("Only chronological original segments with natural gaps allowed")
        start = max(0, segs[0]["start_s"] - .08)
        end = segs[-1]["end_s"] + .12
        target = output / (name + ".mp3")
        p = subprocess.run([
            "ffmpeg","-hide_banner","-loglevel","error","-y",
            "-ss",f"{start:.4f}","-i",str(source),"-t",f"{end-start:.4f}",
            "-map","0:a:0","-ac","1","-ar","48000",
            "-af","afade=t=in:st=0:d=0.012,areverse,afade=t=in:st=0:d=0.012,areverse",
            "-codec:a","libmp3lame","-q:a","2",str(target)
        ],capture_output=True)
        if p.returncode or not target.exists() or target.stat().st_size < 1024:
            raise RuntimeError("Could not export original audio: "+p.stderr.decode(errors="replace")[-300:])
        produced[name] = {
            "source_sha256":EXPECTED_SOURCE_SHA256,"source_segments":ids,
            "start_s":round(start,3),"end_s":round(end,3),
            "sha256":hashlib.sha256(target.read_bytes()).hexdigest(),
            "file":target.name,"transcript_verified":False,"page_match_verified":False,
            "note":"Single continuous excerpt preserves original pauses; no other clip or music added"
        }
    (output/"original_source_manifest.json").write_text(
        json.dumps({"version":2,"results":produced},indent=2)+"\n",encoding="utf-8")
    return produced

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--source",required=True,type=Path)
    p.add_argument("--boundaries",required=True,type=Path)
    p.add_argument("--plan",type=Path,default=Path(__file__).with_name("gretel-stitch-plan.json"))
    p.add_argument("--output",required=True,type=Path)
    args=p.parse_args()
    print(json.dumps(rebuild(args.source,args.boundaries,args.plan,args.output),indent=2))

if __name__=="__main__":
    main()

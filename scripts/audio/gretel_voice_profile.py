#!/usr/bin/env python3
"""Select a PRIVATE Gretel speaker reference from all segmented recordings.

Checks audio fitness for every segment; does not splice, align, train, or
claim that the resulting reference is a proven identity match.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import shutil
from pathlib import Path
import numpy as np
import soundfile as sf

def inspect_wav(path: Path) -> dict:
    data, sr = sf.read(path, dtype="float32", always_2d=True)
    audio = np.mean(data, axis=1)
    if not len(audio):
        raise ValueError("Empty recording")
    seconds = len(audio) / sr
    peak = float(np.max(np.abs(audio)))
    rms = float(np.sqrt(np.mean(audio * audio)))
    silent = float(np.mean(np.abs(audio) < 0.006))
    clipping = float(np.mean(np.abs(audio) >= 0.99))
    usable = 5 <= seconds <= 15 and 0.008 <= rms <= 0.35 and clipping < 0.003
    score = -abs(seconds-9)*0.12 - abs(rms-0.1)*3 - silent*0.15 - clipping*100
    return {"duration_s": round(seconds,3), "sample_rate":int(sr), "peak":round(peak,5),
            "rms":round(rms,5), "silent_fraction":round(silent,4),
            "clip_fraction":round(clipping,5), "eligible":bool(usable), "score":round(score,5)}

def choose_reference(directory: Path) -> dict:
    paths = sorted(directory.glob("*.wav"))
    if not paths:
        raise ValueError("No WAV segments were found")
    records = []
    for p in paths:
        try:
            records.append((p, inspect_wav(p)))
        except (ValueError, OSError, RuntimeError):
            continue
    eligible = [(p, m) for p,m in records if m["eligible"]]
    if not eligible:
        raise ValueError("No segments meet basic reference requirements")
    selected, metrics = max(eligible, key=lambda pair: (pair[1]["score"],pair[0].name))
    return {"scanned":len(paths), "readable":len(records), "eligible":len(eligible),
            "selected":selected.name, "metrics":metrics,
            "sha256":hashlib.sha256(selected.read_bytes()).hexdigest(),
            "note":"Audio metrics only; NOT speaker verification, transcript alignment or synthesis proof."}

def prepare_voice_profile(directory: Path, destination: Path) -> dict:
    report = choose_reference(directory)
    if destination.parent.resolve() == directory.resolve():
        raise ValueError("Keep the selected private reference outside the input folder")
    destination.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(directory/report["selected"],destination)
    if hashlib.sha256(destination.read_bytes()).hexdigest()!=report["sha256"]:
        raise IOError("Reference copy integrity check failed")
    return report

def main() -> None:
    p=argparse.ArgumentParser(description="Create private Gretel reference from full segmented recording")
    p.add_argument("--segments-dir",type=Path,required=True)
    p.add_argument("--output",type=Path,required=True)
    p.add_argument("--report",type=Path)
    args=p.parse_args()
    result=prepare_voice_profile(args.segments_dir,args.output)
    if args.report:
        args.report.parent.mkdir(parents=True,exist_ok=True)
        args.report.write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding="utf-8")
    print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=="__main__": main()

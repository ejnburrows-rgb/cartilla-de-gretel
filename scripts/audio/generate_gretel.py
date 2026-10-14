#!/usr/bin/env python3
"""Gretel Spanish zero-shot voice cloning: resumable, no paid inference API.

The user-supplied reference voice stays on the inference computer, and is not
committed to the project's public repository. Test mode never loads model weights.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import re
import shutil
import subprocess
import tempfile
import wave
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Iterable

import numpy as np

SAFE_ID = re.compile(r"^[A-Za-z0-9_-]{1,64}$")


@dataclass(frozen=True)
class ClipJob:
    clip_id: str
    text: str
    page: str = ""
    lesson: str = ""
    source: str = ""
    category: str = ""


def load_script(path: Path) -> list[ClipJob]:
    jobs: list[ClipJob] = []
    seen: set[str] = set()
    with Path(path).open("r", encoding="utf-8-sig", newline="") as f:
        for line in csv.DictReader(f):
            clip_id = (line.get("clip_id") or "").strip()
            if not SAFE_ID.fullmatch(clip_id):
                raise ValueError(f"Unsafe or missing clip ID: {clip_id!r}")
            if clip_id in seen:
                raise ValueError(f"duplicate clip ID: {clip_id}")
            seen.add(clip_id)
            text = (line.get("text_es") or "").strip()
            page = (line.get("page") or "").strip()
            if page in {"86", "87"}:  # Source book scans missing: never invent content.
                continue
            if text:
                jobs.append(ClipJob(
                    clip_id, text, page, (line.get("lesson") or "").strip(),
                    (line.get("source") or "").strip(),
                    (line.get("category") or "").strip(),
                ))
    return jobs


def chunks_for_text(text: str, max_chars: int = 240) -> list[str]:
    """Split only between words; never truncate the Spanish source."""
    if max_chars < 20:
        raise ValueError("max_chars must be >= 20")
    text = " ".join(text.strip().split())
    if not text:
        return []
    pieces: list[str] = []
    line = ""
    for word in text.split(" "):
        if len(word) > max_chars:
            raise ValueError(f"word exceeds max_chars: {word[:32]!r}")
        joined = f"{line} {word}" if line else word
        if len(joined) > max_chars:
            pieces.append(line)
            line = word
        else:
            line = joined
    if line:
        pieces.append(line)
    return pieces


def build_jobs(jobs: Iterable[ClipJob], max_chars: int = 240) -> list[tuple[ClipJob, list[str]]]:
    return [(job, chunks_for_text(job.text, max_chars)) for job in jobs]


def _encode_mp3(sample_rate: int, samples: np.ndarray, output: Path) -> None:
    """An interrupted encode can never masquerade as an approved MP3."""
    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg is needed to encode MP3 clips")
    signal = np.asarray(samples, dtype=np.float32).squeeze()
    if signal.ndim != 1 or len(signal) < 100 or not np.isfinite(signal).all():
        raise ValueError("Synthesizer did not return valid mono audio")
    signal = np.clip(signal, -1, 1)
    pcm = (signal * 32767).astype("<i2")
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=output.parent) as folder:
        wav = Path(folder) / "raw.wav"
        mp3 = Path(folder) / "encoded.mp3"
        with wave.open(str(wav), "wb") as f:
            f.setnchannels(1)
            f.setsampwidth(2)
            f.setframerate(sample_rate)
            f.writeframes(pcm.tobytes())
        subprocess.run([
            "ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error",
            "-y", "-i", str(wav), "-codec:a", "libmp3lame", "-q:a", "3",
            "-ar", "24000", "-ac", "1", str(mp3),
        ], check=True)
        if mp3.stat().st_size < 100:
            raise RuntimeError("MP3 output was unexpectedly empty")
        os.replace(mp3, output)


def _write_manifest(path: Path, entries: dict[str, dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    content = {"version": 1, "entries": [entries[k] for k in sorted(entries)]}
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(content, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def generate_batch(
    jobs: Iterable[ClipJob], output_root: Path, manifest_path: Path,
    synthesize: Callable[[str], tuple[int, np.ndarray]], *,
    limit: int | None = None, max_chars: int = 240,
    url_prefix: str = "/audio/gretel/clips",
) -> dict:
    output_root = Path(output_root)
    manifest_path = Path(manifest_path)
    previous: dict[str, dict] = {}
    if manifest_path.exists():
        data = json.loads(manifest_path.read_text("utf-8"))
        previous = {r["clip_id"]: r for r in data.get("entries", [])}
    completed, skipped = 0, 0
    for job, chunks in build_jobs(jobs, max_chars):
        if limit is not None and completed >= limit:
            break
        digest = hashlib.sha256(job.text.encode("utf-8")).hexdigest()[:12]
        filenames = [f"{job.clip_id}-{digest}-{i:02d}.mp3" for i in range(1, len(chunks) + 1)]
        prior = previous.get(job.clip_id)
        if prior and prior.get("text") == job.text and prior.get("files") == filenames and all(
            (output_root / filename).is_file() and (output_root / filename).stat().st_size > 100
            for filename in filenames
        ):
            skipped += 1
            continue
        for text, filename in zip(chunks, filenames):
            path = output_root / filename
            if not path.is_file() or path.stat().st_size < 100:
                sample_rate, audio = synthesize(text)
                _encode_mp3(sample_rate, audio, path)
        previous[job.clip_id] = {
            "clip_id": job.clip_id, "text": job.text, "page": job.page,
            "lesson": job.lesson, "source": job.source, "category": job.category,
            "files": filenames,
            "urls": [f"{url_prefix.rstrip('/')}/{filename}" for filename in filenames],
        }
        _write_manifest(manifest_path, previous)  # Every entry is a recovery checkpoint.
        completed += 1
    return {"completed": completed, "skipped": skipped, "total_manifest": len(previous)}


def load_chatterbox(reference: Path, device: str):
    """Official Chatterbox multilingual cloning API; never a paid hosted API."""
    try:
        import torch
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    except ImportError as exc:
        raise RuntimeError("Install the open-source chatterbox-tts model before inference") from exc
    if device == "cuda" and not torch.cuda.is_available():
        raise RuntimeError("CUDA requested but no GPU is available; inference not started")
    model = ChatterboxMultilingualTTS.from_pretrained(device=device)

    def synthesize(text: str) -> tuple[int, np.ndarray]:
        with torch.inference_mode():
            waveform = model.generate(
                text, language_id="es", audio_prompt_path=str(reference),
                exaggeration=0.45, cfg_weight=0.35,
            )
        return model.sr, waveform.squeeze().detach().cpu().numpy()

    return synthesize


def main() -> None:
    p = argparse.ArgumentParser(description="Offline Gretel audio-generation batches")
    p.add_argument("--script", type=Path, required=True, help="GUION_GRABACION.csv")
    p.add_argument("--reference", type=Path, help="Private approved voice sample .wav")
    p.add_argument("--output-root", type=Path, default=Path("public/audio/gretel/clips"))
    p.add_argument("--manifest", type=Path, default=Path("src/data/gretel-recorded-manifest.json"))
    p.add_argument("--device", choices=["cuda", "cpu"], default="cuda")
    p.add_argument("--max-chars", type=int, default=240)
    p.add_argument("--limit", type=int)
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()
    jobs = load_script(args.script)
    pieces = build_jobs(jobs, args.max_chars)
    print(f"Ready: {len(jobs)} script entries, {sum(len(x[1]) for x in pieces)} audio parts")
    if args.dry_run:
        print("DRY RUN — no models downloaded and no audio generated")
        return
    if args.reference is None or not args.reference.is_file():
        p.error("--reference must be a local WAV file")
    synthesize = load_chatterbox(args.reference, args.device)
    print(json.dumps(generate_batch(jobs, args.output_root, args.manifest, synthesize,
                                    limit=args.limit, max_chars=args.max_chars), indent=2))


if __name__ == "__main__":
    main()

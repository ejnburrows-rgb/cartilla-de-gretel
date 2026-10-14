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
from gretel_quality import audio_verdict, check_pcm, split_at_phrases, transcript_verdict

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
    return split_at_phrases(text, max_chars)

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
    # Ending pad is applied only after validating the original synthesis waveform.
    signal = np.concatenate([signal, np.zeros(int(sample_rate * .18), dtype=np.float32)])
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
        ], check=True, timeout=60)
        if mp3.stat().st_size < 100:
            raise RuntimeError("MP3 output was unexpectedly empty")
        os.replace(mp3, output)


def _write_manifest(path: Path, entries: dict[str, dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    content = {"version": 2, "entries": [entries[k] for k in sorted(entries)]}
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(content, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def _fingerprint(reference: Path, engine: str) -> str:
    digest = hashlib.sha256(engine.encode("utf-8"))
    with Path(reference).open("rb") as fd:
        for block in iter(lambda: fd.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()[:16]


def _candidate_status(parts: list[dict]) -> str:
    if not parts or any(p["status"] == "failed" for p in parts):
        return "failed"
    if all(p["status"] == "asr_passed" for p in parts):
        return "needs_owner_review"
    return "needs_transcript_review"


def generate_batch(
    jobs: Iterable[ClipJob], output_root: Path, manifest_path: Path,
    synthesize: Callable[[str], tuple[int, np.ndarray]], *,
    limit: int | None = None, max_chars: int = 240,
    url_prefix: str = "/audio/gretel/clips",
    transcribe: Callable[[Path], str] | None = None,
    reference_fingerprint: str = "unspecified",
    max_attempts: int = 3, force_ids: Iterable[str] = (),
) -> dict:
    """Checkpoint each part; inspect full decoded MP3s; never publish without approval."""
    if max_attempts < 1 or max_attempts > 10:
        raise ValueError("max_attempts must be between 1 and 10")
    output_root, manifest_path = Path(output_root), Path(manifest_path)
    working_public = Path("public").resolve()
    if output_root.resolve() == working_public or working_public in output_root.resolve().parents:
        raise ValueError("Production audio must be generated in private staging, not directly under public/")
    if manifest_path.resolve() == Path("src/data/gretel-recorded-manifest.json").resolve():
        raise ValueError("Cannot write unapproved candidates to the public playback manifest")
    previous: dict[str, dict] = {}
    if manifest_path.exists():
        data = json.loads(manifest_path.read_text("utf-8"))
        previous = {r["clip_id"]: r for r in data.get("entries", [])}
    completed, skipped, failed, processed = 0, 0, 0, 0
    force = set(force_ids)
    for job, chunks in build_jobs(jobs, max_chars):
        if limit is not None and processed >= limit:
            break
        processed += 1
        digest = hashlib.sha256(
            (job.text + "\0" + reference_fingerprint + "\0" + str(max_chars)).encode("utf-8")
        ).hexdigest()[:12]
        filenames = [f"{job.clip_id}-{digest}-{i:02d}.mp3" for i in range(1, len(chunks) + 1)]
        prior = previous.get(job.clip_id, {})
        old_parts = {p.get("file"): p for p in prior.get("parts", [])}
        parts = []
        ran_synthesis = False
        for phrase, filename in zip(chunks, filenames):
            path = output_root / filename
            cached = old_parts.get(filename, {})
            verified = audio_verdict(path) if path.is_file() else {"passed":False,"issues":["missing_file"]}
            transcript = cached.get("transcript")
            tv = None
            if verified["passed"] and transcribe is not None:
                transcript = transcribe(path)
                tv = transcript_verdict(phrase, transcript)
            if (verified["passed"] and (cached.get("text") == phrase or not cached)
                    and job.clip_id not in force
                    and (transcribe is None or (tv and tv["passed"]))):
                parts.append({
                    "file": filename, "text": phrase,
                    "status": "asr_passed" if tv and tv["passed"] else "needs_transcript_review",
                    "audio": verified, "transcript": transcript, "transcript_check": tv,
                })
                continue
            last_report = {"issues":["generation_not_run"]}
            accepted = False
            for attempt in range(1, max_attempts + 1):
                ran_synthesis = True
                try:
                    sr, samples = synthesize(phrase)
                    pcm_check = check_pcm(sr, samples)
                    # An active last frame alone cannot prove that speech was truncated.
                    hard = [x for x in pcm_check["issues"] if x != "no_trailing_silence"]
                    if hard:
                        last_report = {"issues":hard,"stage":"waveform","attempt":attempt}
                        continue
                    _encode_mp3(sr, samples, path)
                    verified = audio_verdict(path)
                    if not verified["passed"]:
                        last_report = {"issues":verified["issues"],"stage":"decoded_mp3","attempt":attempt}
                        path.unlink(missing_ok=True)
                        continue
                    transcript = transcribe(path) if transcribe else None
                    tv = transcript_verdict(phrase, transcript) if transcript is not None else None
                    if tv is not None and not tv["passed"]:
                        last_report = {
                            "issues":tv["issues"], "stage":"transcript",
                            "word_error_rate":tv["word_error_rate"], "attempt":attempt,
                        }
                        path.unlink(missing_ok=True)
                        continue
                    accepted = True
                    parts.append({
                        "file":filename, "text":phrase,
                        "status":"asr_passed" if tv else "needs_transcript_review",
                        "audio":verified, "transcript":transcript,
                        "synthesis_tail_warning":"no_trailing_silence" in pcm_check["issues"],
                        "transcript_check":tv, "attempts":attempt,
                    })
                    break
                except (RuntimeError,ValueError,OSError,subprocess.CalledProcessError,
                        subprocess.TimeoutExpired) as ex:
                    last_report = {"issues":["generation_error"],"message":str(ex)[:240],"attempt":attempt}
            if not accepted:
                path.unlink(missing_ok=True)
                parts.append({"file":filename,"text":phrase,"status":"failed","quality":last_report})
            previous[job.clip_id] = {
                "clip_id":job.clip_id,"text":job.text,"page":job.page,
                "lesson":job.lesson,"source":job.source,"category":job.category,
                "reference_fingerprint":reference_fingerprint,
                "files":filenames,"parts":parts,"status":_candidate_status(parts),
            }
            _write_manifest(manifest_path, previous)
        status = _candidate_status(parts)
        if status == "failed":
            failed += 1
        elif ran_synthesis:
            completed += 1
        else:
            skipped += 1
        previous[job.clip_id] = {
            "clip_id":job.clip_id,"text":job.text,"page":job.page,
            "lesson":job.lesson,"source":job.source,"category":job.category,
            "reference_fingerprint":reference_fingerprint,
            "files":filenames,"parts":parts,"status":status,
        }
        _write_manifest(manifest_path, previous)
    return {
        "completed":completed, "skipped":skipped, "failed":failed,
        "total_manifest":len(previous),
        "needs_owner_review":sum(x.get("status") == "needs_owner_review" for x in previous.values()),
        "needs_transcript_review":sum(
            x.get("status") == "needs_transcript_review" for x in previous.values()
        ),
    }

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


def local_whisper(model_path: Path, device: str):
    """faster-whisper with already-downloaded LOCAL weights; never a hosted ASR."""
    if not model_path.exists():
        raise FileNotFoundError("Local ASR weights absent: " + str(model_path))
    try:
        from faster_whisper import WhisperModel
    except ImportError as ex:
        raise RuntimeError("Install faster-whisper locally to validate transcripts") from ex
    model = WhisperModel(str(model_path), device=device, compute_type="float32")
    def transcribe(mp3: Path) -> str:
        segments, _ = model.transcribe(str(mp3), language="es", beam_size=5,
                                       condition_on_previous_text=False, vad_filter=False)
        return " ".join(x.text.strip() for x in segments)
    return transcribe


def main() -> None:
    p = argparse.ArgumentParser(description="Private offline Gretel voice candidate generation")
    p.add_argument("--script", type=Path, required=True, help="GUION_GRABACION.csv")
    p.add_argument("--reference", type=Path, help="Private approved voice sample .wav")
    p.add_argument("--output-root", type=Path, default=Path("artifacts/gretel/candidates"))
    p.add_argument("--manifest", type=Path, default=Path("artifacts/gretel/quality-manifest.json"))
    p.add_argument("--device", choices=["cuda", "cpu"], default="cuda")
    p.add_argument("--asr-model", type=Path, help="Existing local faster-whisper model weights")
    p.add_argument("--max-chars", type=int, default=160)
    p.add_argument("--limit", type=int)
    p.add_argument("--max-attempts", type=int, default=3)
    p.add_argument("--regenerate-ids", nargs="*", default=[])
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()
    jobs = load_script(args.script)
    pieces = build_jobs(jobs, args.max_chars)
    print(f"Ready: {len(jobs)} script entries, {sum(len(x[1]) for x in pieces)} candidate parts")
    if args.dry_run:
        print("DRY RUN — no weights loaded, no audio generated, no publication")
        return
    if args.reference is None or not args.reference.is_file():
        p.error("--reference must be a private local WAV file")
    if any(not SAFE_ID.fullmatch(x) for x in args.regenerate_ids):
        p.error("Unsafe regenerate ID")
    synthesize = load_chatterbox(args.reference, args.device)
    asr = local_whisper(args.asr_model, args.device) if args.asr_model else None
    print(json.dumps(generate_batch(
        jobs, args.output_root, args.manifest, synthesize,
        limit=args.limit, max_chars=args.max_chars, max_attempts=args.max_attempts,
        reference_fingerprint=_fingerprint(args.reference,"chatterbox-mtl-es-exag.45-cfg.35"),
        transcribe=asr, force_ids=args.regenerate_ids,
    ), indent=2))

if __name__ == "__main__":
    main()

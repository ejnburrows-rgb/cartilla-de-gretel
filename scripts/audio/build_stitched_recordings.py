#!/usr/bin/env python3
"""Assemble owner-supplied MP3 phrases. No synthesis or guessed page matches."""
from __future__ import annotations
import argparse
from array import array
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import zipfile

SAMPLE_RATE = 24000
CHANNELS = 1
GAP_MS = 160
FADE_MS = 10

def run_process(args: list[str], *, input_bytes: bytes | None = None) -> bytes:
    result = subprocess.run(args, input=input_bytes, capture_output=True, check=False)
    if result.returncode:
        raise RuntimeError(f"{' '.join(args[:5])} failed: {result.stderr.decode(errors='replace')[-600:]}")
    return result.stdout

def decode_mp3(mp3: bytes) -> array:
    raw = run_process([
        'ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', 'pipe:0',
        '-vn', '-ac', str(CHANNELS), '-ar', str(SAMPLE_RATE), '-f', 's16le', 'pipe:1'
    ], input_bytes=mp3)
    if not raw or len(raw) % 2:
        raise ValueError('Audio decoded to no samples or odd bytes')
    pcm = array('h')
    pcm.frombytes(raw)
    if sys.byteorder != 'little':
        pcm.byteswap()
    return pcm

def smooth_boundaries(pcm: array) -> None:
    frames = min(round(FADE_MS * SAMPLE_RATE / 1000), len(pcm) // 2)
    for index in range(frames):
        ratio = (index + 1) / (frames + 1)
        pcm[index] = round(pcm[index] * ratio)
        pcm[-1-index] = round(pcm[-1-index] * ratio)

def assemble(zip_path: Path, plan_path: Path, output_dir: Path) -> dict:
    plan = json.loads(plan_path.read_text(encoding='utf-8'))
    if plan.get('version') != 1 or not isinstance(plan.get('sequences'), list):
        raise ValueError('Expected a version=1 plan with sequences')
    output_dir.mkdir(parents=True, exist_ok=True)
    emitted = {}
    with zipfile.ZipFile(zip_path) as z:
        if z.testzip() is not None:
            raise ValueError('ZIP corruption detected')
        catalog = json.loads(z.read('gretel-existing-audio.json'))
        assets = {a['id']: a for a in catalog['assets']}
        for seq in plan['sequences']:
            seq_id = seq['id']
            ids = seq['clip_ids']
            if not ids or not seq_id.replace('-', '').replace('_', '').isalnum():
                raise ValueError('Invalid empty sequence or ID')
            pcm_all = array('h')
            text_parts = []
            source_hashes = []
            for idx, clip_id in enumerate(ids):
                item = assets.get(clip_id)
                if item is None:
                    raise ValueError(f'{seq_id}: source clip {clip_id} not found')
                file_path = 'public' + item['path']
                data = z.read(file_path)
                digest = hashlib.sha256(data).hexdigest()
                if digest != item['sha256']:
                    raise ValueError(f'{seq_id}: checksum mismatch in {clip_id}')
                pcm = decode_mp3(data)
                smooth_boundaries(pcm)
                if idx:
                    pcm_all.extend([0] * round(GAP_MS * SAMPLE_RATE / 1000))
                pcm_all.extend(pcm)
                text_parts.append(item['phrase_es'])
                source_hashes.append({'clip_id': clip_id, 'sha256': digest, 'text': item['phrase_es']})
            if sys.byteorder != 'little':
                pcm_all.byteswap()
            encoded = run_process([
                'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 's16le',
                '-ac', str(CHANNELS), '-ar', str(SAMPLE_RATE), '-i', 'pipe:0',
                '-c:a', 'libmp3lame', '-b:a', '128k', '-f', 'mp3', 'pipe:1'
            ], input_bytes=pcm_all.tobytes())
            target = output_dir / f'{seq_id}.mp3'
            target.write_bytes(encoded)
            decoded = decode_mp3(encoded)
            expected_seconds = len(pcm_all) / SAMPLE_RATE
            actual_seconds = len(decoded) / SAMPLE_RATE
            if abs(actual_seconds - expected_seconds) > 0.15:
                raise ValueError(f'{seq_id}: actual duration unexpectedly differs')
            emitted[seq_id] = {
                'trigger': seq.get('trigger'),
                'lesson': seq.get('lesson'),
                'clip_ids': ids,
                'spoken_text': ' '.join(text_parts),
                'source_clips': source_hashes,
                'seconds': round(actual_seconds, 3),
                'sha256': hashlib.sha256(encoded).hexdigest(),
                'path': target.name,
                'note': 'Existing complete recorded phrases only; not verified printed-page transcription',
            }
    (output_dir / 'stitched-audio-manifest.json').write_text(
        json.dumps({'version': 1, 'sequences': emitted}, ensure_ascii=False, indent=2) + '\n',
        encoding='utf-8',
    )
    return emitted

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archive', required=True, type=Path, help='Gretel_67_Audio_Lecciones_Listo.zip')
    parser.add_argument('--plan', type=Path, default=Path(__file__).with_name('gretel-stitch-plan.json'))
    parser.add_argument('--output', required=True, type=Path)
    options = parser.parse_args()
    results = assemble(options.archive, options.plan, options.output)
    print(f'Validated and stitched {len(results)} sequences using existing recordings:')
    for name, record in results.items():
        print(f"  {name}: {len(record['clip_ids'])} source clips, {record['seconds']}s, {record['path']}")

if __name__ == '__main__':
    main()

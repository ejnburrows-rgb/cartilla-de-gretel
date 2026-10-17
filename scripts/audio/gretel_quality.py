"""Offline integrity and transcript checks for Gretel candidate recordings.

Does NOT assert speaker identity or human approval. ASR is supplied by a separately
installed local recognizer; no hosted endpoint is contacted.
"""
from __future__ import annotations

import re
import subprocess
import unicodedata
from pathlib import Path

import numpy as np


def normalize_spanish_for_asr(text: str) -> list[str]:
    """Ignore accent spelling variance in ASR, but preserve the Spanish ñ/ n contrast."""
    text = text.casefold().replace('ñ', '\ue000')
    text = ''.join(c for c in unicodedata.normalize('NFD', text)
                   if unicodedata.category(c) != 'Mn')
    text = text.replace('\ue000', 'ñ')
    return re.findall(r'[a-zñ0-9]+', text)


def _edits(a: list[str], b: list[str]) -> int:
    previous = list(range(len(b) + 1))
    for i, expected in enumerate(a, 1):
        current = [i]
        for j, found in enumerate(b, 1):
            current.append(min(current[-1] + 1, previous[j] + 1,
                               previous[j - 1] + (expected != found)))
        previous = current
    return previous[-1]


def transcript_verdict(expected: str, observed: str, *, max_wer: float = .08) -> dict:
    a, b = normalize_spanish_for_asr(expected), normalize_spanish_for_asr(observed)
    wer = _edits(a, b) / max(1, len(a))
    missing_last = bool(a) and (not b or b[-1] != a[-1])
    issues = []
    if not a or not b:
        issues.append('empty_transcript')
    if missing_last:
        issues.append('last_words_missing')
    if wer > (0 if len(a) <= 3 else max_wer):
        issues.append('word_errors')
    return {'passed': not issues, 'word_error_rate': round(wer, 4),
            'issues': issues, 'transcribed_text': observed}


def split_at_phrases(text: str, max_chars: int = 240) -> list[str]:
    """Prefer sentence boundaries; fall back to word boundaries without loss."""
    if max_chars < 20:
        raise ValueError('max_chars must be >=20')
    text = ' '.join(text.split())
    if not text:
        return []
    words = text.split(' ')
    if any(len(w) > max_chars for w in words):
        raise ValueError('word exceeds max_chars')
    pieces, current = [], ''
    def flush():
        nonlocal current
        if current:
            pieces.append(current)
            current = ''
    for word in words:
        combined = f'{current} {word}' if current else word
        if len(combined) > max_chars:
            flush()
            current = word
        else:
            current = combined
        if word.endswith(('?', '!', '.', '…')) and len(current) >= max_chars // 3:
            flush()
    flush()
    return pieces


def check_pcm(sample_rate: int, samples: np.ndarray) -> dict:
    """Basic signal gates; cannot on their own prove all words were spoken."""
    audio = np.asarray(samples, dtype=np.float32).reshape(-1)
    issues = []
    if sample_rate < 16000 or sample_rate > 96000 or len(audio) < .15 * sample_rate:
        issues.append('invalid_duration_or_rate')
    if not len(audio) or not np.isfinite(audio).all():
        issues.append('invalid_signal')
        return {'passed':False, 'issues':issues, 'duration_s':0}
    peak=float(np.max(np.abs(audio)))
    rms=float(np.sqrt(np.mean(audio**2)))
    if peak < .003 or rms < .001:
        issues.append('silent_audio')
    if np.mean(np.abs(audio) >= .995) > .005:
        issues.append('hard_clipping')
    tail = audio[-max(1,int(.065*sample_rate)):]
    tail_rms=float(np.sqrt(np.mean(tail**2)))
    if peak > .01 and tail_rms > max(.007, peak * .09):
        issues.append('no_trailing_silence')
    return {'passed':not issues, 'issues':issues,
            'duration_s':round(len(audio)/sample_rate,3) if sample_rate else 0,
            'peak':round(peak,4), 'rms':round(rms,5), 'tail_rms':round(tail_rms,5)}


def audio_verdict(path: Path) -> dict:
    """Decode ENTIRE file (not a size check); reject damaged or suspect endings."""
    path=Path(path)
    if not path.is_file():
        return {'passed':False, 'issues':['missing_file']}
    try:
        proc=subprocess.run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error',
                             '-i',str(path),'-vn','-ac','1','-ar','24000',
                             '-f','f32le','pipe:1'], capture_output=True,timeout=60)
    except (OSError,subprocess.TimeoutExpired):
        return {'passed':False, 'issues':['decode_error']}
    if proc.returncode or not proc.stdout or len(proc.stdout)%4:
        return {'passed':False,'issues':['decode_error'],
                'decoder_message':proc.stderr.decode(errors='replace')[:250]}
    return check_pcm(24000,np.frombuffer(proc.stdout,dtype='<f4'))

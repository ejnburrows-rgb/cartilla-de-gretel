import numpy as np
from gretel_quality import (
    normalize_spanish_for_asr, transcript_verdict, split_at_phrases,
    audio_verdict, check_pcm,
)


def test_spanish_compares_accents_without_erasing_enye():
    assert normalize_spanish_for_asr("¡Sí, el pingüino!") == ["si", "el", "pinguino"]
    assert normalize_spanish_for_asr("año") != normalize_spanish_for_asr("ano")


def test_last_words_missing_is_a_hard_failure():
    result = transcript_verdict("Toca la letra que escuches.", "Toca la letra")
    assert result["passed"] is False
    assert "last_words_missing" in result["issues"]
    assert result["word_error_rate"] > 0


def test_complete_spanish_phrase_with_asr_variation_can_pass():
    result = transcript_verdict("¡Mira! El pingüino está aquí.", "Mira el pinguino esta aqui")
    assert result["passed"] is True


def test_one_word_phonics_requires_exact_match():
    assert transcript_verdict("ñu.", "nu")["passed"] is False
    assert transcript_verdict("ñu.", "ñu")["passed"] is True


def test_phrase_chunking_preserves_all_words_and_sentence_punctuation():
    raw = "¿Qué sonido escuchas?   Señala el dibujo correcto. Ahora, repite conmigo: ma, me, mi, mo, mu."
    pieces = split_at_phrases(raw, max_chars=39)
    assert " ".join(pieces) == " ".join(raw.split())
    assert all(len(x) <= 39 and x for x in pieces)
    assert pieces[0] == "¿Qué sonido escuchas?"


def test_silent_and_clipped_waveforms_rejected():
    sr = 24000
    assert "silent_audio" in check_pcm(sr, np.zeros(sr, dtype="float32"))["issues"]
    assert "hard_clipping" in check_pcm(sr, np.ones(sr, dtype="float32"))["issues"]
    good = 0.1 * np.sin(2*np.pi*330*np.arange(sr)/sr)
    good[-int(sr * .12):] = 0
    assert check_pcm(sr, good)["passed"]


def test_trailing_speech_is_flagged_not_assumed_truncated():
    sr = 24000
    t = np.arange(sr) / sr
    voiced = 0.2 * np.sin(2*np.pi*250*t)
    assert "no_trailing_silence" in check_pcm(sr, voiced)["issues"]
    voiced[-int(sr * .15):] = 0
    assert "no_trailing_silence" not in check_pcm(sr, voiced)["issues"]


def test_corrupted_mp3_fails_decode(tmp_path):
    p = tmp_path / "bad.mp3"
    p.write_bytes(b"ID3" + b"not-a-real-mp3"*30)
    verdict = audio_verdict(p)
    assert verdict["passed"] is False
    assert "decode_error" in verdict["issues"]

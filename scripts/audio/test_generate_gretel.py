import csv
import json
import shutil

import numpy as np
import pytest

from generate_gretel import ClipJob, chunks_for_text, generate_batch, load_script


def test_split_preserves_every_word_and_punctuation():
    text = "¿Escuchaste la sílaba? Ahora toca el dibujo correcto. Vamos a intentarlo juntos."
    pieces = chunks_for_text(text, max_chars=36)
    assert all(0 < len(s) <= 36 for s in pieces)
    assert " ".join(pieces) == text


def test_script_rejects_duplicate_ids(tmp_path):
    p = tmp_path / "input.csv"
    p.write_text("clip_id,category,lesson,page,text_es\nGR0001,book,1,2,Hola.\nGR0001,book,1,2,Adiós.\n", encoding="utf-8")
    with pytest.raises(ValueError, match="duplicate"):
        load_script(p)


def test_batch_produces_manifest_mp3_and_resumes(tmp_path):
    if not shutil.which("ffmpeg"):
        pytest.skip("ffmpeg not installed")
    jobs = [ClipJob("GR0001", "Hola, vamos a leer.", "1", "1", "book", "03_workbook_instrucciones_verbatim"),
            ClipJob("GR0002", "¡Buen trabajo!", "", "", "additional", "09_frases_nuevas_propuestas")]
    called = []

    def fake_generator(text):
        called.append(text)
        sr = 24000
        t = np.arange(sr // 5) / sr
        return sr, (0.05 * np.sin(2 * np.pi * 300 * t)).astype("float32")

    root = tmp_path / "clips"
    manifest = tmp_path / "manifest.json"
    result = generate_batch(jobs, root, manifest, fake_generator)
    assert result["completed"] == 2
    assert called == ["Hola, vamos a leer.", "¡Buen trabajo!"]
    data = json.loads(manifest.read_text(encoding="utf-8"))
    assert len(data["entries"]) == 2
    assert data["entries"][0]["category"] == "03_workbook_instrucciones_verbatim"
    assert all((root / name).stat().st_size > 100 for row in data["entries"] for name in row["files"])
    second = generate_batch(jobs, root, manifest, fake_generator)
    assert second["skipped"] == 2
    assert len(called) == 2


def test_changed_line_invalidates_existing_audio(tmp_path):
    if not shutil.which("ffmpeg"):
        pytest.skip("ffmpeg not installed")
    calls = []

    def generator(text):
        calls.append(text)
        return 24000, np.zeros(2400, dtype="float32")

    root = tmp_path / "clips"
    manifest = tmp_path / "manifest.json"
    generate_batch([ClipJob("GR0001", "Primero escucha.")], root, manifest, generator)
    generate_batch([ClipJob("GR0001", "Después repite.")], root, manifest, generator)
    assert calls == ["Primero escucha.", "Después repite."]
    assert json.loads(manifest.read_text(encoding="utf-8"))["entries"][0]["text"] == "Después repite."


def test_missing_source_pages_are_never_fabricated(tmp_path):
    path = tmp_path / "script.csv"
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["clip_id", "category", "lesson", "page", "text_es"])
        w.writeheader()
        w.writerow(dict(clip_id="GR0001", category="book", lesson="23", page="86", text_es="Placeholder"))
        w.writerow(dict(clip_id="GR0002", category="book", lesson="1", page="1", text_es="Escucha."))
    assert [(x.clip_id, x.page) for x in load_script(path)] == [("GR0002", "1")]

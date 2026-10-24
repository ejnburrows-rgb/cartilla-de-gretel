import json
from pathlib import Path
import pytest
from stitch_gretel import load_cues, stitch_audio

def test_rejects_missing_and_duplicate_cues(tmp_path):
    f = tmp_path / "cues.json"
    f.write_text(json.dumps({"segments":[
      {"id":"a","start":0,"end":1,"text":"Hola"},
      {"id":"a","start":1,"end":2,"text":"Ahí"}],
      "playlist":["a"]}))
    with pytest.raises(ValueError, match="duplicate"):
        load_cues(f)

def test_stitch_real_user_voice_with_ffmpeg(tmp_path):
    mp3 = Path("/mnt/data/kikivoice-cloned-file-2026-10-14-11-30-15-5689.mp3")
    if not mp3.exists():
        pytest.skip("User source audio is deliberately not checked into GitHub")
    cues = tmp_path / "cues.json"
    cues.write_text(json.dumps({"segments":[
        {"id":"demo1","start":25.19,"end":27.32,"text":"Ahora viene mi parte favorita."},
        {"id":"demo2","start":28.28,"end":30.02,"text":"Toca la letra que escuches."},
    ],"playlist":["demo2","demo1"]}), encoding="utf8")
    out = tmp_path / "output"
    result = stitch_audio(mp3, cues, out)
    assert result["clips"] == 2
    assert (out / "clips" / "demo1.mp3").stat().st_size > 1000
    assert (out / "clips" / "demo2.mp3").stat().st_size > 1000
    assert (out / "stitched-demo.mp3").stat().st_size > 1000
    assert (out / "stitched-demo.txt").read_text(encoding="utf8").splitlines() == [
      "Toca la letra que escuches.","Ahora viene mi parte favorita."]

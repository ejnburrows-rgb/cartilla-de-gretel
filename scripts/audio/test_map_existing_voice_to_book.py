"""Tests for mapping REAL owner audio to the real workbook. Never TTS."""
import csv
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from map_existing_voice_to_book import build_map

class RecordedBookMapTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.script = self.root / "script.csv"
        columns = ["index", "clip_id", "category", "section", "lesson", "page", "text_es", "source"]
        with self.script.open("w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=columns)
            writer.writeheader()
            writer.writerow({"clip_id": "GR0017", "category": "02_entradas_24_lecciones",
                             "lesson": "1", "page": "", "text_es": "Conozcamos las vocales."})
            writer.writerow({"clip_id": "GR0041", "category": "03_workbook_instrucciones_verbatim",
                             "lesson": "1", "page": "1", "text_es": "Escucha la vocal ñ."})
            writer.writerow({"clip_id": "GR0726", "category": "08_vocabulario_ejercicios",
                             "lesson": "1", "page": "1", "text_es": "abrigo"})
        self.audio = self.root / "source.wav"
        subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-f", "lavfi",
                        "-i", "sine=frequency=220:duration=6", "-ac", "1", "-ar",
                        "24000", str(self.audio)], check=True)
    def tearDown(self):
        self.tmp.cleanup()

    def test_all_book_destinations_exist_before_audio_alignment(self):
        report = build_map(self.script, {"existing": self.audio}, None, self.root / "map")
        self.assertEqual(report["script_entries"], 3)
        self.assertEqual(report["verified_audio_cues"], 0)
        data = json.loads((self.root / "map" / "gretel_book_audio_map.json").read_text())
        self.assertEqual(data["lessons"]["1"], ["GR0017", "GR0041", "GR0726"])
        self.assertEqual(data["pages"]["1"], ["GR0041", "GR0726"])
        self.assertEqual(json.loads((self.root / "map" / "gretel-recorded-manifest-approved-only.json").read_text())["entries"], [])

    def test_matching_verified_existing_audio_becomes_playable(self):
        manifest = self.root / "verified.json"
        manifest.write_text(json.dumps([{
            "clip_id": "GR0041", "source_id": "existing", "start_s": 0.6, "end_s": 3.8,
            "verified_by": "manual_listening", "verified_text": "Escucha la vocal ñ."
        }]))
        report = build_map(self.script, {"existing": self.audio}, manifest,
                           self.root / "out", export_verified=True)
        self.assertEqual(report["verified_audio_cues"], 1)
        self.assertGreater((self.root / "out" / "audio" / "gretel_gr0041.mp3").stat().st_size, 2000)

    def test_wrong_text_or_unknown_timecode_cannot_be_published(self):
        cue = self.root / "wrong.json"
        for item in [
            {"clip_id": "GR0041", "source_id": "existing", "start_s": .2,
             "end_s": 4, "verified_by": "manual_listening", "verified_text": "unrelated"},
            {"clip_id": "GR0041", "source_id": "existing", "start_s": 0,
             "end_s": 9, "verified_by": "manual_listening", "verified_text": "Escucha la vocal ñ."},
        ]:
            cue.write_text(json.dumps([item]))
            with self.assertRaises(ValueError):
                build_map(self.script, {"existing": self.audio}, cue, self.root / "out")
if __name__ == "__main__":
    unittest.main()

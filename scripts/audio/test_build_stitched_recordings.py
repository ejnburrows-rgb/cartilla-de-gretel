"""Regression tests for exact existing-audio joins (requires owner ZIP on disk)."""
import copy
import json
from pathlib import Path
import tempfile
import unittest
import zipfile
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_stitched_recordings import assemble

ARCHIVE = Path(__file__).resolve().parents[2] / 'Gretel_67_Audio_Lecciones_Listo.zip'
PLAN = Path(__file__).with_name('gretel-stitch-plan.json')

class ExistingAudioStitchTests(unittest.TestCase):
    def test_generates_real_decodable_audio_and_exact_transcript_ledger(self):
        if not ARCHIVE.exists():
            self.skipTest('Original owner ZIP intentionally not committed to repository')
        with tempfile.TemporaryDirectory() as temp:
            result = assemble(ARCHIVE, PLAN, Path(temp))
            self.assertEqual(len(result), 4)
            lesson = result['leccion-07-ma-me-mi-mo-mu']
            self.assertEqual(lesson['clip_ids'], ['gretel_11', 'gretel_12', 'gretel_13'])
            self.assertIn('Ma... me... mi... mo... mu.', lesson['spoken_text'])
            self.assertGreater(lesson['seconds'], 23)
            self.assertTrue((Path(temp) / lesson['path']).is_file())
            self.assertEqual(result['resultado-correcto']['trigger'], 'correct')
            self.assertEqual(result['resultado-intenta-otra-vez']['trigger'], 'try-again')

    def test_rejects_unrecorded_phrases_instead_of_fabricating_audio(self):
        if not ARCHIVE.exists():
            self.skipTest('Original owner ZIP intentionally not committed to repository')
        with tempfile.TemporaryDirectory() as temp:
            bad_plan = copy.deepcopy(json.loads(PLAN.read_text()))
            bad_plan['sequences'][0]['clip_ids'].append('GR0099_unknown')
            path = Path(temp) / 'invalid.json'
            path.write_text(json.dumps(bad_plan))
            with self.assertRaisesRegex(ValueError, 'source clip GR0099_unknown not found'):
                assemble(ARCHIVE, path, Path(temp) / 'out')

    def test_rejects_corrupted_source_even_if_clip_name_matches(self):
        if not ARCHIVE.exists():
            self.skipTest('Original owner ZIP intentionally not committed to repository')
        with tempfile.TemporaryDirectory() as temp:
            t = Path(temp)
            broken = t / 'bad.zip'
            with zipfile.ZipFile(ARCHIVE) as zin, zipfile.ZipFile(broken, 'w') as zout:
                for entry in zin.infolist():
                    data = zin.read(entry.filename)
                    if entry.filename == 'public/audio/gretel/clips/rec_gretel_11.mp3':
                        data = b'BAD' + data[3:]
                    zout.writestr(entry.filename, data)
            with self.assertRaisesRegex(ValueError, 'checksum mismatch'):
                assemble(broken, PLAN, t / 'out')

if __name__ == '__main__':
    unittest.main()

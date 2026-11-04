"""Source identity and optimized-mode regressions; never restore artwork."""
import hashlib
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import evidence_cli_guard as guard


class SourceBoundaryTests(unittest.TestCase):
    def test_exact_bytes_at_operator_selected_location_without_pdf_suffix(self):
        data = b'%PDF-test source snapshot'
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / 'renamed-original'
            source.write_bytes(data)
            with patch.object(guard, 'LESSON4_SOURCE_SHA256', hashlib.sha256(data).hexdigest()):
                snapshot = guard.read_lesson4_source(source)
            source.write_bytes(b'replaced after verification')
            self.assertEqual(snapshot, data)

    def test_unverified_bytes_are_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / 'unverified.pdf'
            source.write_bytes(b'%PDF-wrong original')
            with self.assertRaisesRegex(ValueError, 'verified original PDF'):
                guard.read_lesson4_source(source)

    def test_directory_is_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaisesRegex(ValueError, 'regular file'):
                guard.read_lesson4_source(folder)

    def test_missing_source_is_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaises(FileNotFoundError):
                guard.read_lesson4_source(Path(folder) / 'missing')

    def test_all_three_clis_reject_wrong_source_in_normal_and_optimized_mode(self):
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / 'wrong.pdf'
            source.write_bytes(b'%PDF-unverified source')
            output = guard.EVIDENCE_ROOT / 'source-boundary-unused.json'
            self.assertFalse(output.exists())
            assets = [guard.REPO_ROOT / 'public/cartilla/art/optimized/flipchart-native' / name
                      for name in ('p006-scene.png', 'p006-scene.webp')]
            before = [hashlib.sha256(path.read_bytes()).digest() for path in assets]
            for optimized in (False, True):
                for script in ('lesson4-source-provenance.py', 'independent-review-source-alpha.py', 'restore-lesson4-ground.py'):
                    with self.subTest(script=script, optimized=optimized):
                        args = [sys.executable] + (['-O'] if optimized else [])
                        args += [str(guard.EVIDENCE_ROOT / script), '--pdf', str(source),
                                 '--repo', str(guard.REPO_ROOT), '--git-executable', os.environ['GIT_EXECUTABLE']]
                        if script != 'restore-lesson4-ground.py':
                            args += ['--head', '226991ec775c51592be859d30bb8ee978bfcda0d', '--output', str(output)]
                        result = subprocess.run(args, capture_output=True, text=True)
                        self.assertNotEqual(result.returncode, 0)
                        self.assertIn('verified original PDF', result.stderr)
                        self.assertNotIn('Traceback (most recent call last):\n  File "<frozen', result.stderr)
                        self.assertFalse(output.exists())
            self.assertEqual([hashlib.sha256(path.read_bytes()).digest() for path in assets], before)


if __name__ == '__main__':
    unittest.main()

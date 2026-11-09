"""Bounded regressions for local helper authority boundaries; no artwork writes."""
import os
import tempfile
import unittest
import subprocess
import sys
from pathlib import Path
from evidence_cli_guard import (
    EVIDENCE_ROOT, REPO_ROOT, checked_repo, checked_head,
    checked_git, checked_destination, write_report,
)


class EvidenceBoundaryTests(unittest.TestCase):
    def test_only_exact_commit_ids(self):
        self.assertEqual(checked_head('4d73acf7647d04f4f02a4cf2cef4acae8dc14025'),
                         '4d73acf7647d04f4f02a4cf2cef4acae8dc14025')
        for value in ('--output=outside', '--help', 'HEAD', 'abc', 'a'*40+'\n'):
            with self.assertRaises(ValueError):
                checked_head(value)

    def test_repo_cannot_select_another_checkout(self):
        self.assertEqual(checked_repo(REPO_ROOT), REPO_ROOT)
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaises(ValueError):
                checked_repo(temp)

    def test_git_never_uses_path_lookup(self):
        with self.assertRaises(ValueError):
            checked_git('git')
        with self.assertRaises(ValueError):
            checked_git(Path(os.__file__).resolve())
        selected = os.environ.get('GIT_EXECUTABLE')
        self.assertIsNotNone(selected, 'test requires explicit GIT_EXECUTABLE')
        self.assertTrue(checked_git(selected).is_file())

    def test_reports_cannot_escape_or_overwrite(self):
        with tempfile.TemporaryDirectory(dir=EVIDENCE_ROOT) as temp:
            destination = Path(temp) / 'new.json'
            write_report(destination, 'new evidence')
            with self.assertRaises(FileExistsError):
                write_report(destination, 'overwrite')
            self.assertEqual(destination.read_text(), 'new evidence')
            for escape in (REPO_ROOT/'outside.json', EVIDENCE_ROOT/'..'/'escape.json'):
                with self.assertRaises(ValueError):
                    checked_destination(escape)

    def test_redirected_parent_is_rejected(self):
        # A junction can be supplied by the local Windows test driver when
        # creating symbolic links is not permitted by the operating system.
        junction = os.environ.get('EVIDENCE_TEST_REDIRECT')
        self.assertIsNotNone(junction, 'test requires prepared redirected directory')
        with self.assertRaises(ValueError):
            checked_destination(Path(junction)/'report.json')

    def test_reporting_clis_reject_option_head_before_opening_pdf(self):
        for script in ('independent-review-source-alpha.py', 'lesson4-source-provenance.py'):
            result = subprocess.run([sys.executable, str(EVIDENCE_ROOT/script),
                '--pdf', 'nonexistent-source.pdf', '--repo', str(REPO_ROOT),
                '--head=--output=unintended', '--output', str(EVIDENCE_ROOT/'unused.json'),
                '--git-executable', os.environ['GIT_EXECUTABLE']], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('head must be a full', result.stderr)
            self.assertFalse((EVIDENCE_ROOT/'unused.json').exists())

    def test_restorer_rejects_unrelated_repo_without_mutation(self):
        with tempfile.TemporaryDirectory() as temp:
            result = subprocess.run([sys.executable, str(EVIDENCE_ROOT/'restore-lesson4-ground.py'),
                '--pdf', 'nonexistent-source.pdf', '--repo', temp,
                '--git-executable', os.environ['GIT_EXECUTABLE']], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('repository must be the checkout', result.stderr)
            self.assertEqual(list(Path(temp).iterdir()), [])

    def test_runtime_rejects_path_lookup_before_browser_or_output(self):
        env = dict(os.environ, GIT_EXECUTABLE='git')
        result = subprocess.run(['node', str(EVIDENCE_ROOT/'runtime-check.mjs')],
            cwd=REPO_ROOT, env=env, capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('explicitly select an absolute Git', result.stderr)
        self.assertFalse((EVIDENCE_ROOT/'runtime-new').exists())


if __name__ == '__main__':
    unittest.main()

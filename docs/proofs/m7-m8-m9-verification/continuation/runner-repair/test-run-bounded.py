from pathlib import Path
import importlib.util, json, os, sys, tempfile, unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('bounded', Path(__file__).with_name('run-bounded.py'))
bounded = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bounded)

class Boundaries(unittest.TestCase):
    def dummy_command(self, sentinel):
        return [sys.executable, '-c', 'from pathlib import Path; import sys; Path(sys.argv[1]).write_text("spawned")', str(sentinel)]

    def test_block_reuse_advisory_and_nonpending_receipts_never_spawn(self):
        cases = [
            {'decision':'block_this_local_action','outcome':'pending','evidence_accepted':False},
            {'decision':'reuse_prior_evidence','outcome':'reused','evidence_accepted':True},
            {'decision':'allow_with_advisory','outcome':'pending','evidence_accepted':False},
            {'decision':'allow','outcome':'pass','evidence_accepted':True},
            {'decision':'allow','outcome':'pending'},
        ]
        for receipt in cases:
            with self.subTest(receipt=receipt), tempfile.TemporaryDirectory() as directory:
                root=Path(directory); path=root/'reservation.json'; sentinel=root/'child-spawned'
                path.write_text(json.dumps(receipt))
                with patch.object(bounded.subprocess, 'Popen') as spawn:
                    with self.assertRaises(ValueError):
                        bounded.launch_reserved(path, self.dummy_command(sentinel))
                    spawn.assert_not_called()
                self.assertFalse(sentinel.exists())

    def test_missing_malformed_or_previously_accepted_receipt_never_spawns(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory); path=root/'reservation.json'; sentinel=root/'child-spawned'
            with patch.object(bounded.subprocess, 'Popen') as spawn:
                with self.assertRaises(ValueError): bounded.launch_reserved(path,self.dummy_command(sentinel))
                spawn.assert_not_called()
            path.write_text('{bad json')
            with patch.object(bounded.subprocess, 'Popen') as spawn:
                with self.assertRaises(ValueError): bounded.launch_reserved(path,self.dummy_command(sentinel))
                spawn.assert_not_called()
            path.write_text(json.dumps({'decision':'allow','outcome':'pending','evidence_accepted':False}))
            (root/'accepted.json').write_text('{}')
            with patch.object(bounded.subprocess, 'Popen') as spawn:
                with self.assertRaises(ValueError): bounded.launch_reserved(path,self.dummy_command(sentinel))
                spawn.assert_not_called()
            self.assertFalse(sentinel.exists())

    def test_valid_pending_allow_and_reexecution_can_spawn_dummy_child(self):
        for decision in ['allow','allow_reexecution']:
            with self.subTest(decision=decision), tempfile.TemporaryDirectory() as directory:
                root=Path(directory); path=root/'reservation.json'; sentinel=root/'child-spawned'
                path.write_text(json.dumps({'decision':decision,'outcome':'pending','evidence_accepted':False}))
                child=bounded.launch_reserved(path,self.dummy_command(sentinel))
                self.assertEqual(child.wait(),0)
                self.assertEqual(sentinel.read_text(),'spawned')

    def test_rejects_path_labels_before_mutation(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for label in ['../escape', '..', 'a/b', 'a\\b', 'C:\\outside', '', 'space label']:
                with self.subTest(label=label), self.assertRaises(ValueError):
                    bounded.create_run_directory(root, label)
            self.assertEqual(list(root.iterdir()), [])

    def test_replay_preserves_original_failure(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            target = bounded.create_run_directory(root, 'one-selected-check')
            sentinel = target / 'completion.json'
            sentinel.write_bytes(b'original failure, never overwritten')
            with self.assertRaises(FileExistsError):
                bounded.create_run_directory(root, 'one-selected-check')
            self.assertEqual(sentinel.read_bytes(), b'original failure, never overwritten')

    def test_wrong_cwd_rejected(self):
        original = Path.cwd()
        with tempfile.TemporaryDirectory() as directory:
            try:
                os.chdir(directory)
                with self.assertRaises(ValueError):
                    bounded.checkout_root()
                self.assertEqual(list(Path(directory).iterdir()), [])
            finally:
                os.chdir(original)

if __name__ == '__main__':
    unittest.main()

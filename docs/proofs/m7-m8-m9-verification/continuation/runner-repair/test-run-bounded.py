from pathlib import Path
import importlib.util, os, tempfile, unittest

spec = importlib.util.spec_from_file_location('bounded', Path(__file__).with_name('run-bounded.py'))
bounded = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bounded)

class Boundaries(unittest.TestCase):
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

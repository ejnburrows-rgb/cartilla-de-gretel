"""Regression tests: rejected music/stutter clips cannot be reintroduced."""
import json
from pathlib import Path
import sys
import tempfile
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parent))
from build_stitched_recordings import rebuild, load_boundaries

ROOT = Path(__file__).resolve().parents[2]
MASTER = ROOT / "Gretel_558674_Original.m4a"
BOUNDARIES = ROOT / "Gretel_Source_Timestamps_Verified.zip"
PLAN = Path(__file__).with_name("gretel-stitch-plan.json")

class MasterAudioTests(unittest.TestCase):
    def test_plan_contains_only_source_quality_previews(self):
        plan=json.loads(PLAN.read_text(encoding="utf-8"))
        self.assertEqual(plan["version"],2)
        self.assertEqual(len(plan["sequences"]),2)
        self.assertEqual(plan["sequences"][0]["segment_ids"],["gr_0001","gr_0002"])
        self.assertTrue(all(s.get("page") is None and s.get("trigger") is None for s in plan["sequences"]))

    def test_rejects_old_music_and_stutter_archive(self):
        with tempfile.TemporaryDirectory() as d:
            fake=Path(d)/"old_67_clip_archive.zip"
            fake.write_bytes(b"not the correct original source")
            with self.assertRaisesRegex(ValueError,"Wrong recording"):
                rebuild(fake,BOUNDARIES,PLAN,Path(d)/"out")

    def test_real_master_exports_original_contiguous_audio(self):
        if not MASTER.is_file() or not BOUNDARIES.is_file():
            self.skipTest("Owner's private master and verified boundaries are intentionally not published to GitHub")
        with tempfile.TemporaryDirectory() as d:
            out=Path(d)/"results"
            result=rebuild(MASTER,BOUNDARIES,PLAN,out)
            self.assertEqual(len(result),2)
            self.assertTrue((out/"original_source_0001_0002.mp3").stat().st_size>1024)
            self.assertFalse(result["original_source_0001_0002"]["page_match_verified"])
            self.assertEqual(result["original_source_0003_0004"]["source_segments"],["gr_0003","gr_0004"])

    def test_rejects_fabricated_page_assignments(self):
        if not MASTER.is_file() or not BOUNDARIES.is_file():
            self.skipTest("Private owner source not installed in repository")
        with tempfile.TemporaryDirectory() as d:
            bad=json.loads(PLAN.read_text(encoding="utf-8"))
            bad["sequences"][0]["page"]=7
            f=Path(d)/"bad-plan.json";f.write_text(json.dumps(bad))
            with self.assertRaisesRegex(ValueError,"Untranscribed speech"):
                rebuild(MASTER,BOUNDARIES,f,Path(d)/"output")

if __name__=="__main__":
    unittest.main()

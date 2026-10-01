import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1]))
from importer import normalize, write_package  # noqa: E402


FIXTURE = Path(__file__).parents[1] / "fixtures" / "sample-blogsy-export.xml"


class ImporterTests(unittest.TestCase):
    def test_default_is_publish_only_and_normalized(self):
        package = normalize(FIXTURE)
        self.assertEqual(package["summary"], {"records": 2, "media": 1, "skipped": 1})
        record = next(record for record in package["records"] if record["type"] == "post")
        self.assertEqual(record["slug"], "welcome-to-the-old-site")
        self.assertEqual(record["status"], "publish")
        self.assertEqual(record["migration"], {"state": "pending-review", "production_write": False})
        self.assertEqual({term["slug"] for term in record["terms"]}, {"news", "launch"})

    def test_drafts_can_be_included_without_becoming_publishable(self):
        package = normalize(FIXTURE, include_drafts=True)
        self.assertEqual(package["summary"]["records"], 3)
        draft = next(record for record in package["records"] if record["status"] == "draft")
        self.assertEqual(draft["migration"]["state"], "pending-review")
        self.assertFalse(draft["migration"]["production_write"])

    def test_output_is_staging_only_and_repeatable(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "package"
            package = normalize(FIXTURE)
            write_package(package, output)
            manifest = json.loads((output / "manifest.json").read_text())
            self.assertEqual(manifest["summary"]["records"], 2)
            self.assertFalse(manifest["summary"].get("production_write", False))
            self.assertIn('"production_write": false', (output / "records.jsonl").read_text())
            self.assertTrue((output / "media.jsonl").exists())


if __name__ == "__main__":
    unittest.main()

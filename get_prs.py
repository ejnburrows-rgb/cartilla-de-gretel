import json
import subprocess

with open("prs.json") as f:
    prs = json.load(f)

for pr in prs:
    if pr["draft"]:
        # Let's assume all draft PRs might be candidates.
        # But wait, "For every finished draft PR awaiting owner review..."
        print(f"PR {pr['number']}: {pr['title']}")

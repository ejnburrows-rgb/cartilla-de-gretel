import json

with open("prs.json") as f:
    prs = json.load(f)

for pr in prs:
    if pr["draft"]:
        print(f"PR {pr['number']}: {pr['title']}")
        print(f"Head ref: {pr['head']['ref']}")
        print(f"Head sha: {pr['head']['sha']}")
        print("-" * 20)

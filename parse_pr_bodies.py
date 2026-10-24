import json

with open("prs.json") as f:
    prs = json.load(f)

for pr in prs:
    if pr["draft"]:
        title = pr['title'].lower()
        body = pr['body'].lower()
        if "awaiting owner review" in body or "awaiting owner review" in title or "draft" in title or "draft" in body:
            print(f"PR {pr['number']}: {pr['title']}")

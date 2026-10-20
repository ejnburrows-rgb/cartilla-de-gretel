import json

with open("prs.json") as f:
    prs = json.load(f)

for pr in prs:
    if pr["draft"]:
        title = pr['title']
        body = pr['body']
        if "proof" in title.lower() or "proof" in body.lower() or "ready for review" in body.lower() or "owner order" in title.lower():
            print(f"Candidate: PR {pr['number']} - {pr['title']}")

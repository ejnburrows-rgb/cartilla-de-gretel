import json

with open("prs.json") as f:
    prs = json.load(f)

for pr in prs:
    if pr["draft"]:
        labels = [l["name"] for l in pr["labels"]]
        print(f"PR {pr['number']}: {pr['title']} - Labels: {labels}")
        if "receipt.json" in pr["body"] or "awaiting owner review" in pr["body"].lower():
            print(f"  --> BODY MATCH")

import json

with open("prs.json") as f:
    prs = json.load(f)

for pr in prs:
    if pr["draft"]:
        print(f"================ PR {pr['number']} ================")
        print(f"Title: {pr['title']}")
        print(f"Body: {pr['body']}")
        print(f"Head: {pr['head']['sha']}")

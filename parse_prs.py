import json

with open("prs.json") as f:
    prs = json.load(f)

for pr in prs:
    # Look for PRs awaiting owner review, the prompt mentioned "awaiting owner review" and "finished draft PR"
    # Actually wait, let's just get the ones with title or labels containing some indicator of "READY" or just all Drafts?
    # Scope: "For every finished draft PR awaiting owner review..."
    # Let's print the bodies to see if they mention "awaiting owner review"
    pass

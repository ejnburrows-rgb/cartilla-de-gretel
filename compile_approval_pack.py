import json

with open("candidates_evaluation.json") as f:
    results = json.load(f)

markdown = """# Owner Visual Approval Pack

This document outlines the current state of candidates awaiting visual review.

"""

for pr in results:
    status_icon = "✅ READY" if pr["status"] == "READY" else "❌ NOT READY"
    markdown += f"## {pr['title']}\n"
    markdown += f"**Status:** {status_icon}\n\n"

    if pr["status"] == "NOT READY":
        markdown += f"**Missing:** {pr['missing']}\n\n"

    markdown += f"### Description\n{pr['desc']}\n\n"

    if pr["proofs"]:
        markdown += "### Visual Proof\n"
        # Display only up to 2 screenshots: portrait and landscape, or just one per change.
        # "ONE real rendered screenshot per change (phone 390x844 + landscape 844x390 where relevant)... and a video when the change moves. For artwork claims, side-by-side comparison"
        for proof in pr["proofs"]:
            if proof.endswith(".webm") or proof.endswith(".mp4"):
                markdown += f"![Video Proof]({proof})\n"
            elif proof.endswith(".jpg") or proof.endswith(".png") or "raw=true" in proof:
                markdown += f"![Proof Screenshot]({proof})\n"
        markdown += "\n"
    markdown += "---\n\n"

markdown += "## Internal Reference Information\n\n"
markdown += "| PR Number | Branch | Head SHA | GitHub Link |\n"
markdown += "|---|---|---|---|\n"
for pr in results:
    markdown += f"| {pr['num']} | `{pr['ref']}` | `{pr['sha']}` | [Link]({pr['url']}) |\n"

with open("docs/approval-pack-20261020.md", "w") as f:
    f.write(markdown)

print("Markdown compiled.")

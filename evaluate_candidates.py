import json
import subprocess
import re
import os

with open("prs.json") as f:
    prs = json.load(f)

candidates = [pr for pr in prs if pr["draft"]]
results = []

def run_cmd(cmd):
    try:
        return subprocess.check_output(cmd, stderr=subprocess.DEVNULL).decode('utf-8')
    except:
        return ""

for pr in candidates:
    ref = pr['head']['ref']
    title = pr['title']
    body = pr['body']
    sha = pr['head']['sha']
    num = pr['number']
    url = pr.get('html_url', f"https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/{num}")

    remote_sha = run_cmd(['git', 'ls-remote', 'origin', ref]).split()[0] if run_cmd(['git', 'ls-remote', 'origin', ref]) else ""

    if not remote_sha or remote_sha != sha:
        results.append({
            "num": num, "title": title, "ref": ref, "sha": sha, "url": url,
            "status": "NOT READY", "missing": "Stale proof (head moved since verification)",
            "proofs": [], "desc": body
        })
        continue

    tree_output = run_cmd(['git', 'ls-tree', '-r', f'origin/{ref}'])
    proof_files = [line.split()[-1] for line in tree_output.split('\n') if 'docs/proofs/' in line and len(line.split()) > 0]

    urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', body)
    media_urls = [u for u in urls if u.endswith(".png") or u.endswith(".jpg") or u.endswith(".webm") or "raw=true" in u]

    all_proofs = []

    diff_output = run_cmd(['git', 'diff', '--name-only', 'origin/main', f'origin/{ref}'])
    diff_files = diff_output.split('\n')
    pr_proof_files = [f for f in proof_files if f in diff_files]

    for pf in pr_proof_files:
        if pf.endswith('.png') or pf.endswith('.jpg') or pf.endswith('.mp4') or pf.endswith('.webm'):
            all_proofs.append(f"https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/{ref}/{pf}?raw=true")

    all_proofs.extend(media_urls)

    # Are there any changes in docs/proofs/
    has_screenshot = len([p for p in all_proofs if '.png' in p or '.jpg' in p or "raw=true" in p]) > 0
    has_video = len([p for p in all_proofs if '.webm' in p or '.mp4' in p]) > 0
    has_side_by_side = len([p for p in all_proofs if 'comparison' in p.lower() or 'pairs' in p.lower() or 'side' in p.lower()]) > 0

    is_motion = "motion" in title.lower() or "motion" in body.lower() or "move" in title.lower() or "move" in body.lower() or "juggle" in title.lower()
    is_artwork = "art" in title.lower() or "art" in body.lower() or "picture" in title.lower() or "picture" in body.lower()

    missing = []
    if not has_screenshot:
        missing.append("Required real UI/browser proof is absent (missing screenshot)")
    if is_motion and not has_video:
        missing.append("Missing video for motion changes")
    if is_artwork and not has_side_by_side and not has_video:
        missing.append("Missing side-by-side comparison for artwork claims")

    if missing:
        status = "NOT READY"
    else:
        status = "READY"

    # Strictly strip all PR numbers, issue numbers, SHAs, branches, and GitHub links
    desc = body
    desc = re.sub(r'https?://[^\s<>"]+', '', desc) # links
    desc = re.sub(r'(?i)(?:PR|issue)\s*#?\d+', '', desc) # PR/issue numbers
    desc = re.sub(r'#\d+', '', desc) # plain #number
    desc = re.sub(r'\b[0-9a-fA-F]{7,40}\b', '', desc) # SHAs
    desc = re.sub(r'(?i)(?:branch|head)[^\w]+[^\s]+', '', desc) # branch references
    desc = re.sub(r'(?:jules|game|fix|draft|motion|instinct|activity|audio|palabras-minuto|games-author)[\w/-]+', '', desc) # common branch prefixes

    # Clean up leftover artifacts
    desc = re.sub(r'src/.*?\s', '', desc)
    desc = re.sub(r'public/.*?\s', '', desc)
    desc = re.sub(r'docs/.*?\s', '', desc)
    desc = re.sub(r'scripts/.*?\s', '', desc)
    desc = re.sub(r'```.*?```', '', desc, flags=re.DOTALL) # remove code blocks
    desc = desc.replace("PR", "").replace("issue", "").replace("GSAP", "").replace("TypeScript", "").replace("Vite", "")

    # Cleanup empty lines and weird symbols from regex
    desc = '\n'.join([line for line in desc.split('\n') if line.strip() and not line.strip().startswith('![')])
    desc = re.sub(r'\(\s*\)', '', desc) # empty parens
    desc = desc.strip()

    if len(desc) < 10:
        clean_title = re.sub(r'\(.*?\)', '', title).replace("DRAFT:", "").replace("Draft:", "").strip()
        desc = clean_title

    results.append({
        "num": num, "title": title, "ref": ref, "sha": sha, "url": url,
        "status": status, "missing": ", ".join(missing),
        "proofs": all_proofs, "desc": desc
    })

with open("candidates_evaluation.json", "w") as f:
    json.dump(results, f, indent=2)

print("Evaluation done.")

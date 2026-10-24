import json
import subprocess

with open("prs.json") as f:
    prs = json.load(f)

for pr in prs:
    if pr["draft"]:
        ref = pr['head']['ref']
        output = subprocess.check_output(['git', 'ls-tree', '-r', f'origin/{ref}']).decode('utf-8')
        lines = output.split('\n')
        # Check for any markdown, png, jpg, etc that might be new proofs in docs/
        new_proofs = []
        for line in lines:
            if not line: continue
            path = line.split('\t')[1] if '\t' in line else line.split()[-1]
            if path.startswith('docs/') and not path.endswith('.md'):
                try:
                    subprocess.check_call(['git', 'ls-tree', 'origin/main', path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                except:
                    new_proofs.append(path)
            elif path.startswith('docs/') and 'proof' in path.lower():
                try:
                    subprocess.check_call(['git', 'ls-tree', 'origin/main', path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                except:
                    new_proofs.append(path)
        if new_proofs or "proof" in pr['title'].lower() or "proof" in pr['body'].lower() or "owner order" in pr['title'].lower():
            print(f"PR {pr['number']}: {pr['title']}")
            print(f"  New Proofs in tree: {new_proofs}")

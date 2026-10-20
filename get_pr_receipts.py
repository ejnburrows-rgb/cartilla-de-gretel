import json
import subprocess
import os

with open("prs.json") as f:
    prs = json.load(f)

for pr in prs:
    if pr["draft"]:
        ref = pr['head']['ref']
        print(f"Checking PR {pr['number']} ({ref})")
        # Let's check if there's a receipt.json or if we need to assess manually.
        # Check files changed in the PR to see if there's anything we can pass to check-merge-policy.mjs --evidence
        # But wait, check-merge-policy.mjs --evidence takes a receipt.json file which is created dynamically,
        # or maybe there's a receipt.json in the branch.
        try:
            subprocess.check_call(['git', 'fetch', 'origin', ref, '--quiet'])
            output = subprocess.check_output(['git', 'ls-tree', '-r', 'FETCH_HEAD', '--name-only']).decode('utf-8')
            receipts = [line for line in output.split('\n') if 'receipt.json' in line]
            if receipts:
                print(f"  Found receipts: {receipts}")
            else:
                print("  No receipt.json found")
        except Exception as e:
            print(f"  Error: {e}")

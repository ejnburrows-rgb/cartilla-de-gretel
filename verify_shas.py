import subprocess
import json

with open("prs.json") as f:
    prs = json.load(f)

for pr in prs:
    if pr["draft"]:
        ref = pr['head']['ref']
        try:
            # Get latest SHA from origin
            output = subprocess.check_output(['git', 'ls-remote', 'origin', ref]).decode('utf-8')
            if output:
                remote_sha = output.split()[0]
                api_sha = pr['head']['sha']
                print(f"PR {pr['number']}: API={api_sha}, Remote={remote_sha}, Match={api_sha == remote_sha}")
            else:
                print(f"PR {pr['number']}: Remote not found")
        except Exception as e:
            print(f"PR {pr['number']}: Error {e}")

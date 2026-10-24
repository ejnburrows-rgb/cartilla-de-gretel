import json
import subprocess
import tempfile
import json

with open("prs.json") as f:
    prs = json.load(f)

for pr in prs:
    if pr["draft"]:
        ref = pr['head']['ref']
        # Try checking out the branch to see if there is a receipt.json, and to run check-merge-policy.mjs if we can
        # But actually check-merge-policy.mjs takes a receipt.json.
        # Wait, the prompt says "run the VERIFY-ONLY merge checks from scripts/check-merge-policy.mjs at the candidate's CURRENT head SHA... never trust a stale one): head SHA + destination, cumulative diff scope, targeted test results for the exact change, real rendered before/after proof where behavior changed."
        # This implies we must CREATE the receipt dynamically based on checking the branch? Or maybe there IS NO RECEIPT because it's VERIFY-ONLY and we just have to evaluate what the script assesses.
        # "assessMerge(receipt)" expects { changedFiles: [], headMatches: true, scopeAuthorized: true, reviewed: true, ownerGateSatisfied: true, seriousDefects: [], tests: {status: 'pass', headMatches: true}, uiRequired: true, uiEvidence: true }
        pass

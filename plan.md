1.  **Scope Setup**: Run `check-merge-policy.mjs` natively against each relevant draft PR, simulating checkout and receipt validation. For this task, we will look at all 15 draft PRs returned by GitHub.
    However, the instructions state: "For every finished draft PR awaiting owner review, run the VERIFY-ONLY merge checks from scripts/check-merge-policy.mjs at the candidate's CURRENT head SHA... Then assemble the owner's visual approval pack".
    We have 15 draft PRs. We will evaluate them to see if they are READY or NOT READY.
2.  **Evaluate Candidate PRs**:
    - Iterate through each draft PR.
    - We will write a script to evaluate `scripts/check-merge-policy.mjs` against each. Wait, the policy script needs `--evidence receipt.json` but no PR has it. If there is no receipt.json, they fail merge check. If a PR has missing UI proof, it fails.
    - We need to get one screenshot (phone 390x844 + landscape 844x390 where relevant). Some PRs have image links in their body.
    - If artwork claims are made, we need side-by-side comparison.
    - We will check each PR's body for proofs.
3.  **Create Approval Pack Document**: Create `docs/approval-pack-20261020.md` on a new branch.
    - Document format:
        - Each candidate listed as READY or NOT READY.
        - Exact missing proof named if NOT READY.
        - "plain-words description of what the owner will SEE"
        - ONE real rendered screenshot per change.
        - Video if the change moves.
        - Separate internal section at the bottom for PR numbers, SHAs, branch names, GitHub links.
4.  **Finalize**:
    - Commit and open a draft PR.
    - Output final message listing every candidate as READY/NOT READY and the draft PR URL.

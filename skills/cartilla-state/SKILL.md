name: cartilla-state
description: "Load when the user asks to check the current state of La Cartilla de Gretel — GitHub branch, latest commit, open PRs, Vercel deploy status, or current project blocker."
license: MIT

# Cartilla State Checker

Check the current state of La Cartilla de Gretel project.

## Instructions

Go to:
1. GitHub: https://github.com/ejnburrows-rgb/cartilla-de-gretel
2. Vercel: https://cartilla-de-gretel.vercel.app

Extract:
- Current branch + latest commit hash
- Open PRs + their status (open/closed/merged)
- Deploy status (green/yellow/red)
- Current blocker (drag-and-drop vs. teacher persistence vs. auth vs. deploy)

Output format:
Current Branch: [branch name]
Latest Commit: [hash + message]
Open PRs: [count + status]
Deploy Status: [green/yellow/red]
Current Blocker: [one sentence]
Next Action: [one sentence]

## Rules
- Never claim done without commit + PR + deploy proof
- Always verify current priority before suggesting next action
- If unclear, ask: drag-and-drop vs. persistence vs. auth vs. deploy

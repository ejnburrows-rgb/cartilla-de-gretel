# Cartilla de Gretel — Command Center

## Workspace purpose

This repository workspace is dedicated to `ejnburrows-rgb/cartilla-de-gretel`.
It is configured for a focused, project-specific agent workflow.

## Core rules

- Agents must create their own branches.
- Never work directly on `main` unless explicitly approved.
- Always inspect before editing.
- Read project documentation before acting.
- Report exact files changed and test results.

## Do not touch unless approved

- Deployment settings
- Database or Supabase configuration
- Secrets or environment variables
- Dependency upgrades
- Production settings

## Project docs to read first

1. `PROJECT-TRUTH.md`
2. `README.md`
3. `KNOWN_ISSUES.md`
4. `AGENT_RULES.md`
5. `AGENT_RULES_STRICT.md`

## Workspace structure

- VS Code workspace = local/project editing environment
- Anti-Gravity workspace = AI execution environment
- GitHub = source of truth
- Vercel = deployment reality
- Notion = deep project brain

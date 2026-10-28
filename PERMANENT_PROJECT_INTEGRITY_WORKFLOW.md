# Permanent Project Integrity Workflow

> **OWNER OVERRIDE — October 28, 2026: controller ownership.** ChatGPT/Codex in the owner's current Cartilla conversation is the primary controller and single owner-facing entry point. Muse is a supporting source of history and records, not an independent controller or dispatcher. This supersedes all older Muse-only, Muse/Instinct dual-controller, and owner-carried prompt-routing instructions, including the October 13 controller allocation.
>
> Use the existing October 28 Cartilla Master Completion Plan; prioritize independent review and authorized integration of delivered fixes before new coding. Recover existing assignments and proof; do not duplicate work, reopen resolved issues, launch a new audit, or rebuild the workflow. Codex retains artwork ownership; Jules and other existing specialists retain their assigned work until the controller reconciles ownership. No new infrastructure or automatic schedules are authorized.
>
> The controller handles technical coordination through available tools. Report one concise dashboard: finished, confirmed active now, blocked, next, and owner decisions; distinguish verified evidence from reported status and development from production. Never imply background execution without confirmation. If access truly blocks progress, state the exact blocker and the single necessary owner action. Preserve source/workbook fidelity, existing approvals, independent review and branch protection. Merges require applicable exact-change owner authorization; deployment requires explicit owner authorization. No self-approval or bypass. Preserve all existing art, voice, privacy, security and spending gates.


## Universal Agent Enforcement Specification — Version 1

**Owner order — 2026-10-22. Mandatory for all agents, workers, controllers, reviewers and dispatchers.** Read `AGENTS.md` and the [artwork-specific execution directive](ARTWORK_REPORT_VERIFICATION_AND_SINGLE_SOURCE_CLEANUP.md). This is a policy, not a second inventory.

### Objective

Prevent repeated investigations, contradictory reports, lost approvals, incorrect assets, misleading completion claims, stale dependencies, and duplicated agent work.

Implement in the existing project and controller. Do not add paid services, another supervisory AI, or unnecessary infrastructure.

### Phase 1 — Establish the authoritative record

1. Inspect the current repository, active work, existing validation scripts, and the latest recorded owner decisions.
2. Reuse existing manifests and scripts wherever possible. Do not create competing sources of truth.
3. Maintain one machine-readable inventory containing stable item and placement IDs, approved source paths, hashes, approval evidence, current status, active worker, dependent files, commit, and runtime verification evidence.
4. Preserve decision history. Newer decisions supersede older conflicting decisions only within their documented scope.
5. Generate inventory totals programmatically. Never manually rewrite counts to force agreement.

### Phase 2 — Controlled intake

Every new or replacement asset must:

- Have a unique identifier.
- Link to the authentic source and approval evidence.
- Record every placement where it is required.
- Preserve the approved visual design.
- Identify existing versions before creating replacements.
- Retain an unresolved status if authenticity is unknown.

Search accessible originals and existing delivered assets before requesting another upload or generating new material.

A file hash verifies identity of bytes, not visual approval.

### Phase 3 — Dependency enforcement

When an approved source changes:

1. Identify every dependent optimized image, resized copy, animation, embedded image, and rendered placement.
2. Mark dependent versions as requiring revalidation.
3. Rebuild or replace stale derivatives.
4. Verify the application uses the corrected source.
5. Do not certify the asset while a stale copy remains active.

If animations cannot be corrected immediately, preserve the correct static illustration rather than display outdated moving artwork.

### Phase 4 — Agent dispatch

Before assigning work, the controller must confirm:

- The issue remains unresolved.
- No active worker already owns it.
- The applicable owner decision is known.
- The proposed change has a distinct, necessary deliverable.
- Existing completed work can be reused.

Every assignment must identify its exact affected item IDs, acceptance criteria, and expected proof.

Agents may not expand scope, recreate approved material, or restart completed investigations without new evidence.

### Phase 5 — Mandatory verification gate

Completion requires ALL of the following:

- Authentic source identified and approved.
- Expected application references correct.
- All dependencies current.
- Relevant tests passing without unauthorized weakening.
- Actual rendered placement inspected against the approved reference.
- Verification evidence tied to the exact commit or build being approved.
- No contradictory or outstanding status for the affected item.

Any missing condition produces BLOCKED or UNVERIFIED, never COMPLETE.

A failing authenticity requirement cannot be bypassed by adding exceptions that merely accept the defective file.

### Phase 6 — Reporting

Generate one report directly from the authoritative record.

The report must distinguish:

- REQUIRED
- LOCATED
- AWAITING APPROVAL
- APPROVED
- INTEGRATED
- DISPLAY VERIFIED
- BLOCKED / MISSING

Track unique assets separately from their page placements.

Every unresolved item must identify the exact reason, owner, next necessary action, and supporting evidence.

Do not produce another independent inventory or accountability document that restates obsolete findings.

### Phase 7 — Cross-agent continuity

When one agent hands work to another, transfer only:

1. The current authoritative inventory version.
2. The active decisions affecting the assignment.
3. Existing work or PR references.
4. The exact unfinished items.
5. Verification results and known blockers.

The receiving agent must inspect current state before taking action.

### Hard-stop rules

- No unverifiable completion claims.
- No unauthorized image redesign.
- No replacement of approved source material without authorization.
- No silent test relaxation.
- No merge of artwork changes without required acceptance proof.
- No treating merged code as proof of deployed behavior.
- No reopening resolved tasks from outdated reports.
- No duplicate agent assignments.
- No claiming a full audit while any required placement remains unreviewed.

### Acceptance tests for the workflow itself

Prove enforcement using controlled negative tests:

1. Introduce a wrong image into a known placement → the gate must reject it.
2. Replace a source without refreshing its animation → the gate must reject it.
3. Remove an authenticity check → the gate must flag unauthorized weakening.
4. Attempt to assign an already-owned task → the controller must reject duplication.
5. Reintroduce an obsolete missing-image claim → the report must retain the latest evidence-backed status.
6. Run inventory generation twice without repository changes → both reports must produce identical counts.

Restore any deliberate test mutations afterward.

### Definition of done

The workflow is operational only when its validators execute in the real integration path, the negative tests demonstrate that violations are blocked, and its counts can be reproduced from the authoritative inventory.

A written specification alone does not count as enforcement.

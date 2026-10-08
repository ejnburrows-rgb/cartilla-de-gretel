# Cartilla Controller

Separate Vercel project: `cartilla-controller`. Root directory: `controller/`.
Canonical issue: #545. Canonical branch: `watchdog/event-coordinator`.
Continues prototype commit `7a0969bb191ff73eb8bd133f51138981e30ae046` from PR #546.
The unsafe root-app receiver, memory fallback, hardcoded SHA and default-success validation have been replaced; Cartilla application files and dependencies are unchanged.

## Execution

GitHub HMAC event → transactional event + canonical job → Inngest event → fresh GitHub snapshot → durable attempt reservation → OpenHands start task/conversation → same-conversation polling → independent GitHub evidence and trusted exact-head checks → validation → immediate capacity refill.

Database absence is an error, never a memory fallback. Test storage uses actual embedded PostgreSQL (PGlite), including on-disk restart tests. The separate `cartilla_controller` schema does not overwrite a legacy prototype schema.

Six Inngest functions: `process-github-event`, `controller-reconcile` (every minute), `daily-repository-reconciliation` (09:00 UTC), `poll-external-worker`, `manual-job`, and `release-verifier`. Worker waits and retry deadlines use durable Inngest steps. Reconciliation recovers missing queue/poll delivery, expires local leases, preserves uncertain external dispatches and refills safe capacity. GitHub deliveries remain durable and permanently deduplicated in `webhook_events`, but they do not create owner-facing project jobs. Inngest event-ID deduplication supplements permanent database uniqueness; the database is authoritative.

Repository snapshots use one compact current record. A no-change reconciliation performs no snapshot write and no unchanged job-state write. Full raw webhook events, real work attempts, retry/dead-letter state, and evidence remain durable. Existing historical rows are not deleted automatically.

Verified idle conversations are reused for subsequent bounded jobs through the official `/{conversation_id}/send-message` endpoint with `run:true`; paused sandboxes resume through the official idempotent sandbox-resume endpoint. Each new job gets its own durable attempt, fresh main baseline, deadline and independent validation even when it shares a conversation. Active or ambiguous conversations are never concurrently assigned a second job. Missing/archived sandboxes permit a replacement; unavailable or uncertain status does not. A stale finished status from the previous job cannot certify the new job before fresh agent activity. External POST uncertainty is never automatically retried. Reservations consume capacity/quota until resolved, preventing duplicate dispatch after a controller crash. Known worker failure is retried at a bounded durable deadline. Cancellation is local; it keeps the external run's capacity reserved until its terminal state is confirmed. Status polling never starts another conversation. Failed independent validation is visible; absent PRs may retry only after the prior run is known terminal. Existing PRs and overlapping file ownership reserve their lane until reviewed. No autonomous merge, file/branch deletion, production deployment or secret rotation is implemented.

## Provisioning boundary

`npm ci`, `npm test`, `npm run build`, `npm run migrate`.

Configure `.env.example` variables through Vercel's encrypted environment settings. `DATABASE_URL` must be a Neon PostgreSQL connection string. Tokens must be distinct and at least 32 characters. Never place credentials in this repo or worker issue text. `GITHUB_TOKEN` is used only server-side for repository reads; public reads work without it subject to GitHub rate limits.

Apply `migrations/001-ledger.sql` to Neon using `npm run migrate`. Register the Vercel `/api/inngest` URL with the authenticated Inngest account. Configure the repository GitHub webhook at `/api/github/webhook`, JSON content type and the matching `GITHUB_WEBHOOK_SECRET`; no workers run in that request. Configure Vercel's provider protection so GitHub and Inngest can reach these signed endpoints; retain the application's HMAC/signing-key authentication and bearer tokens.

`OPENHANDS_ENABLED=false` and `JULES_ENABLED=false` are the defaults. Do not enable OpenHands without authorized account credentials, confirmed usable service capacity and explicit approval before any paid usage. `OPENHANDS_DAILY_START_LIMIT=0` disables the daily new-conversation ceiling, as explicitly directed by Emilio; a positive value remains available only when the owner requests a ceiling. Positive ceilings count durable new-session reservations, including uncertain starts, and exclude same-session continuations; `OPENHANDS_CAPACITY=1` is configurable service capacity, not a Jules cap. Jules is optional and deliberately has no unproven dispatch adapter.

Official API source: https://github.com/openhands/docs/blob/main/openhands/usage/cloud/cloud-api.mdx

- POST `https://app.all-hands.dev/api/v1/app-conversations`
- GET `/api/v1/app-conversations/start-tasks?ids=<existing start task>`
- GET `/api/v1/app-conversations?ids=<existing conversation>`
- POST `/api/v1/app-conversations/{conversation_id}/send-message` with `role:user`, text content and `run:true`
- POST `/api/v1/sandboxes/{sandbox_id}/resume` when the existing sandbox is paused

These continuation prerequisites were checked against the live official Cloud OpenAPI schema on 2026-10-08 UTC: https://app.all-hands.dev/openapi.json .

## Safe existing work

The initial `repo_inspection` conversation is read-only and must pass independent fresh GitHub inspection before issue work can dispatch. Implementation tasks use existing owner-authored canonical issues, not new work invented to fill lanes. The deterministic scheduler requires a `controller:ready` label and one bounded scope block in the existing issue body:

```cartilla-controller
{"action":"Fix the precisely described existing defect","paths":["src/specific-component.tsx"],"dependencies":[],"required_checks":["Independent test check"],"deadline_minutes":30}
```

Dependencies must be independently confirmed closed as completed. Owner-gated, source-blocked, overlapping or unbounded tasks do not dispatch. No heuristic pretends that free-text prose proves independence. Current existing issues are not silently relabelled or rewritten by this implementation. Controller integration and metadata policy files are excluded from worker scope.

`TRUSTED_CHECK_APP_IDS` must list GitHub App IDs of independent trusted check providers. Worker-authored test summaries are not proof. Required check names must succeed on the exact resulting PR head. The validation fetch rechecks PR head stability; it rejects empty commits, missing/unlinked PRs, deletions, out-of-scope changes, missing checks and self-certification. Existing PRs are never merged by this controller. A verified implementation job means its bounded candidate was independently validated, not that the PR was merged or Cartilla was released.

## APIs and operational page

Read bearer token: GET `/api/status`, `/api/jobs`, `/api/jobs/:id`, `/api/jobs/:id/evidence`, `/api/jobs/:id/validations`, `/api/workers`, `/api/openapi.json`.

Admin bearer token: POST `/api/jobs`, `/api/jobs/:id/retry`, `/api/jobs/:id/cancel`. Creation accepts only a `repo_inspection` or an existing scoped `issue_implementation`, plus a permanent idempotency key. There is no arbitrary command endpoint. An unresolved external attempt makes automatic retry unsafe. For an ambiguous POST with no known start-task or conversation ID, an admin may submit `{"dispatch_resolution":"confirmed_not_created"}` only after checking the external account. This explicit attestation is durably stored before a replacement is permitted. Known external runs must reach a confirmed terminal state; an attestation cannot override them.

The live operational page at https://cartilla-controller.vercel.app/ automatically loads real-work status counts and refreshes every 15 seconds through public GET `/api/overview`. Main counts include only issue implementation and PR-specific release verification. Webhook receipt, reconciliation, polling, retry scheduling, snapshots, and other internal activity are separated under paginated System history. Detailed rows explain the repository, issue/PR, current result, missing requirement, blocker, next owner, Emilio attention YES/NO, timeline, proof, and collapsed technical details. Vercel Authentication protects the owner page; Emilio is not asked for the controller read key. Raw webhook payloads and task prompts have no read endpoint. Secrets are never sent to browser code or stored in evidence receipts. Missing service configuration produces 503, not false green status.

## Verified live acceptance and continuation

Verified on 2026-10-08 UTC (2026-10-07 in Emilio's New York timezone): separate Vercel controller deployed from `43a92df37725ba813c03fc1ba35f0cf852806237`; Neon migration 1 applied; authenticated Inngest functions registered; signed GitHub webhook 693884849 live. Controller tests: 35/35 passed; production build passed. Local fixtures prove duplicate protection, durable send/crash recovery, reconciliation and bounded dead-letter failures; live acceptance below proves actual provider execution.

The real issue #389 bounded implementation job `c78bdbe0-8944-4102-a1d1-a249610aa9de` started exactly one OpenHands conversation `81b0eb9a8d384952adb4b2514e67fa54` and reused it for polling. It produced PR #547 at `2580991ea9d121326ef4b0fc5acc59df91cc1651`, changing only `scripts/verify-classroom-readiness.mjs` and `tests/verify-readiness-runner.test.mjs`. Independently downloaded exact-head regression tests passed 4/4; restoring the original bug failed the negative control. Trusted SonarCloud App 12526 passed the exact head. Fresh GitHub evidence independently verified the job at 01:51:37 UTC; fresh rescan followed within one second. This certifies the bounded fix, not full issue #389 release readiness, PR merging, or the finished Cartilla product.

The initial inspection and bounded implementation conversations both finished. Emilio explicitly authorized ongoing automatic paid work and then rejected the assistant-imposed daily cap on 2026-10-08 UTC. Automatic starts remain enabled; `OPENHANDS_DAILY_START_LIMIT=0` means no daily conversation ceiling. The initial single-job restriction is cleared. Use an existing verified idle session for subsequent bounded work whenever the provider still has its sandbox; do not create a new conversation for polling, reconciliation or merely because a bounded job finished. Each continued job still requires a fresh scope, durable attempt, current GitHub baseline and independent verification. Existing session reuse does not make model usage free. The configured capacity is one active worker; it prevents overlapping work, not a daily task limit. Jules stays optional and disabled.

Continuation and unlimited-mode regression suite: 43/43 controller tests passed, including one start followed by a second job in the same conversation, durable continuation reservation despite exhausted optional new-start quota, unknown-message no-duplication, stale-finished rejection and paused-sandbox resume handling. Production build passed. These tests use provider mocks; do not describe them as a real second live material coding job in the same conversation until fresh GitHub evidence proves that run. The earlier real material job and its independent validation remain proven.

Every future session must resolve CURRENT main and read the current four project instructions listed in AGENTS.md, the controller branch instructions, existing #545 / PR #546, the relevant task issue/PR, and live ledger state. Engram is a retrieval aid; it never overrides fresh GitHub/runtime evidence. Persist material checkpoints to existing GitHub issues and branches. If one lane needs Emilio, record the exact action and advance other independent authorized lanes. Dispatch safe bounded work whenever authorized capacity and budget exist; never manufacture issues merely to fill capacity. Preserve external IDs after uncertainty and never blindly duplicate a start.

Server-only production aliases `Myne` (OpenHands key) and `Ejn` (GitHub token) are supported without exposing their values. Prefer canonical variable names for future provisioning. Never copy any credential into this document or memory. Read tokens cannot mutate jobs; admin tokens cannot confer merge/deletion/production-deployment authority.

## Four-step verification pipeline — staged checkpoint (2026-10-08)

Ordinary coding workers run targeted tests, relevant typecheck and verify:worker.
Visible changes use dev:worker plus browser/screenshot proof. Full release/art
generation stays in a separate clean checkout. No worker self-certifies.

Material implementation now requests a durable release-verifier job, keyed to
implementation UUID + exact PR head + current main. It reuses existing Neon jobs,
attempts, receipts, validations and Inngest delivery/reconciliation. The original
implementation remains WAITING until independent proof passes. Changed head or
main invalidates old proof. Finished implementation conversations may be reused
while independent release verification is pending.

The independent executor uses the documented OpenHands Cloud sandbox and bash APIs,
not an AI conversation. One clean sandbox runs fixed commands at the exact SHA.
Neon records the sandbox ID, command ID, payload hash, deadline, exit status and
controller-produced receipts. Inngest polls the same IDs. Unknown dispatch results
are blocked rather than duplicated. Sandboxes are confirmed paused after completion.
Targeted tests, verify:worker and verify:release must all pass; UI changes also
run visual tests. No Vercel testing deployments are created.

Independent controller review is recorded via the admin-only
POST /api/jobs/:id/review endpoint against fresh exact head and main. The read-only
token cannot approve, dispatch, retry or merge. A negative latest review revokes
an older approval. Workers never receive the admin token. Material GitHub changes,
trusted Sonar proof, current main, independent review and clean release execution
are mandatory before implementation completion and guarded merge.
CONTROLLER_MERGE_ISSUES authorizes only explicit canonical issues. The legacy
CONTROLLER_AUTO_MERGE switch must remain false. No GitHub auto-merge mode is enabled.
Draft promotion occurs only after all independent gates pass.

Vercel Git deployment remains disabled; preview deployments are disabled through
the project API. Commit, PR and merge do not deploy. Explicit finished milestone
approval is the only product deployment boundary. Controller code updates require
an intentional controller deployment; durable wakeups do not redeploy it.

GitHub quota failures persist their reset deadline in Neon and recover through
Inngest. They do not request another worker conversation. Immutable instructions
and PR file sets are reused only for the same main/head/base SHA context; issue,
PR and check state stays fresh. Finished sandbox compute is paused even while
GitHub evidence is unavailable. Verification still requires fresh GitHub evidence.

Admin release requests are stored before GitHub reads. A duplicate request has
one canonical job; reusing its key for another payload is rejected. The durable
request resolves current PR/main asynchronously and queues its separate verifier.
A VERIFIED intake request means intake validated, never release tests passed.
Previously material-only verified, unmerged coding jobs return to WAITING for
mandatory current independent review and exact-head release proof.

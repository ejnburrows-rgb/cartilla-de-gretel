# Cartilla Controller

Separate Vercel project: `cartilla-controller`. Root directory: `controller/`.
Canonical issue: #545. Canonical branch: `watchdog/event-coordinator`.
Continues prototype commit `7a0969bb191ff73eb8bd133f51138981e30ae046` from PR #546.
The unsafe root-app receiver, memory fallback, hardcoded SHA and default-success validation have been replaced; Cartilla application files and dependencies are unchanged.

## Execution

GitHub HMAC event → transactional event + canonical job → Inngest event → fresh GitHub snapshot → durable attempt reservation → OpenHands start task/conversation → same-conversation polling → independent GitHub evidence and trusted exact-head checks → validation → immediate capacity refill.

Database absence is an error, never a memory fallback. Test storage uses actual embedded PostgreSQL (PGlite), including on-disk restart tests. The separate `cartilla_controller` schema does not overwrite a legacy prototype schema.

Five Inngest functions: `process-github-event`, `controller-reconcile` (every ten minutes), `daily-repository-reconciliation` (09:00 UTC), `poll-external-worker`, and `manual-job`. Worker waits and retry deadlines use durable Inngest steps. Reconciliation reconstructs orphan events, recovers missing queue/poll delivery, expires local leases, preserves uncertain external dispatches and refills safe capacity. Inngest event-ID deduplication supplements permanent database uniqueness; the database is authoritative.

External POST uncertainty is never automatically retried. Reservations consume capacity/quota until resolved, preventing duplicate dispatch after a controller crash. Known worker failure is retried at a bounded durable deadline. Cancellation is local; it keeps the external run's capacity reserved until its terminal state is confirmed. Status polling never starts another conversation. Failed independent validation is visible; absent PRs may retry only after the prior run is known terminal. Existing PRs and overlapping file ownership reserve their lane until reviewed. No autonomous merge, file/branch deletion, production deployment or secret rotation is implemented.

## Provisioning boundary

`npm ci`, `npm test`, `npm run build`, `npm run migrate`.

Configure `.env.example` variables through Vercel's encrypted environment settings. `DATABASE_URL` must be a Neon PostgreSQL connection string. Tokens must be distinct and at least 32 characters. Never place credentials in this repo or worker issue text. `GITHUB_TOKEN` is used only server-side for repository reads; public reads work without it subject to GitHub rate limits.

Apply `migrations/001-ledger.sql` to Neon using `npm run migrate`. Register the Vercel `/api/inngest` URL with the authenticated Inngest account. Configure the repository GitHub webhook at `/api/github/webhook`, JSON content type and the matching `GITHUB_WEBHOOK_SECRET`; no workers run in that request. Configure Vercel's provider protection so GitHub and Inngest can reach these signed endpoints; retain the application's HMAC/signing-key authentication and bearer tokens.

`OPENHANDS_ENABLED=false` and `JULES_ENABLED=false` are the defaults. Do not enable OpenHands without authorized account credentials, confirmed usable service capacity and explicit approval before any paid usage. `OPENHANDS_DAILY_START_LIMIT=10` counts all committed daily UTC dispatch reservations, including uncertain starts; `OPENHANDS_CAPACITY=1` is configurable service capacity, not a Jules cap. Jules is optional and deliberately has no unproven dispatch adapter.

Official API source: https://github.com/openhands/docs/blob/main/openhands/usage/cloud/cloud-api.mdx

- POST `https://app.all-hands.dev/api/v1/app-conversations`
- GET `/api/v1/app-conversations/start-tasks?ids=<existing start task>`
- GET `/api/v1/app-conversations?ids=<existing conversation>`

## Safe existing work

The initial `repo_inspection` conversation is read-only and must pass independent fresh GitHub inspection before issue work can dispatch. Implementation tasks use existing owner-authored canonical issues, not new work invented to fill lanes. The deterministic scheduler requires a `controller:ready` label and one bounded scope block in the existing issue body:

```cartilla-controller
{"action":"Fix the precisely described existing defect","paths":["src/specific-component.tsx"],"dependencies":[],"required_checks":["Independent test check"],"deadline_minutes":30}
```

Dependencies must be independently confirmed closed as completed. Owner-gated, source-blocked, overlapping or unbounded tasks do not dispatch. No heuristic pretends that free-text prose proves independence. Current existing issues are not silently relabelled or rewritten by this implementation. Controller integration and metadata policy files are excluded from worker scope.

`TRUSTED_CHECK_APP_IDS` must list GitHub App IDs of independent trusted check providers. Worker-authored test summaries are not proof. Required check names must succeed on the exact resulting PR head. The validation fetch rechecks PR head stability; it rejects empty commits, missing/unlinked PRs, deletions, out-of-scope changes, missing checks and self-certification. Existing PRs are never merged by this controller. A verified implementation job means its bounded candidate was independently validated, not that the PR was merged or Cartilla was released.

## APIs and operational page

Read bearer token: GET `/api/status`, `/api/jobs`, `/api/jobs/:id`, `/api/jobs/:id/evidence`, `/api/jobs/:id/validations`, `/api/workers`, `/api/openapi.json`.

Admin bearer token: POST `/api/jobs`, `/api/jobs/:id/retry`, `/api/jobs/:id/cancel`. Creation accepts only a `repo_inspection` or an existing scoped `issue_implementation`, plus a permanent idempotency key. There is no arbitrary command endpoint. An unresolved external attempt makes retry unsafe.

The one operational page lists running/waiting/retrying/blocked/failed/dead-letter/verified jobs, run IDs, source SHA, attempts, deadlines, real GitHub evidence, validation and next actions. Its read token remains in page memory only. Raw webhook payloads and task prompts have no read endpoint. Secrets are never sent to browser code or stored in evidence receipts. Missing service configuration produces 503, not false green status.

## Acceptance still requires live accounts

Local tests use signed HTTP fixtures, embedded PostgreSQL and mocked OpenHands/GitHub providers. They do not prove a real GitHub delivery, Neon migration, authenticated Inngest execution or a real OpenHands conversation. Full acceptance requires those live proofs, a material bounded worker PR, independent validation and automatic next-job evaluation. Do not mark the controller DONE before that run succeeds.

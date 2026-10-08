# Cartilla Durable Event Controller Architecture & Boundary Documentation

## Overview

This document specifies the durable proactive project controller built on the `watchdog/event-coordinator` architecture. The controller owns the next action and keeps Cartilla moving without waiting for human intervention or ad-hoc prompting.

## Locked Architecture

- **GitHub**: Remains the single source of truth for repo, PR, and issue state.
- **Neon Postgres**: Canonical durable job and evidence ledger (`webhook_events`, `jobs`, `evidence_receipts`, `validation_results`).
- **Inngest**: Durable execution engine owning retries, deadlines, waits, and reconciliation wakeups.
- **Vercel**: Hosts the webhook receiver (`/api/webhook/github`), Inngest handler (`/api/inngest`), and reconciliation loop (`/api/reconcile`).
- **Bounded Workers**: Jules / OpenHands operate strictly as bounded workers; neither may self-certify completion.
- **Strict Completion Rule**: A worker statement, HTTP 200, PR creation, bot acknowledgement, open branch, or empty commit is NOT completion. Only independent current GitHub/Vercel evidence receipts plus required validation pass can transition a job to `completed` / `VERIFIED`.

## Credential Boundary & Required Environment Variables

When deploying to live Vercel / Neon / Inngest infrastructure, configure the following environment variables:

| Environment Variable | Description |
| --- | --- |
| `DATABASE_URL` / `NEON_DATABASE_URL` | Neon Postgres pooled connection string (e.g., `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require`) |
| `GITHUB_WEBHOOK_SECRET` | Secret configured on GitHub repository webhook for HMAC SHA-256 signature verification (`X-Hub-Signature-256`) |
| `GITHUB_TOKEN` | GitHub Personal Access Token or App Installation Token with read access to repository commits and PRs |
| `INNGEST_EVENT_KEY` | Inngest Event Key used to send event payloads to the Inngest event cloud |
| `INNGEST_SIGNING_KEY` | Inngest Signing Key for verifying HTTP requests sent by Inngest serverless workers |
| `CRON_SECRET` | Bearer token for authorizing scheduled Vercel Cron reconciliation requests to `/api/reconcile` |

### Credential-Free / Offline Fallback Behavior

When `DATABASE_URL` or `NEON_DATABASE_URL` is unavailable (such as in local sandbox environments or CI runs), the `DurableLedger` automatically utilizes a high-fidelity in-memory backing store. This allows full local execution and unit test verification without altering the architecture or adding third-party dependencies.

## Forced Failure Proofs Verified

The controller test suite in `tests/controller/controller-runner.test.ts` proves 5 critical failure modes:

1. **Duplicate Protection**: Processing the same `X-GitHub-Delivery` header twice creates exactly 1 canonical durable job.
2. **Queue Failure Recovery**: An Inngest queue send failure leaves the raw webhook event and job persisted in `received` state, recoverable by `/api/reconcile`.
3. **Worker Failure Visibility & Retry**: Worker errors increment attempt counters, record failure reasons and retry history, and remain visible and retryable.
4. **No Completion Without Evidence**: Jobs lacking independent GitHub evidence receipts (or with failed validation) REJECT completion and transition to `failed` or `dead_letter`.
5. **Dead-Letter Escalation**: Reaching `max_attempts` transitions jobs to `dead_letter` state for manual inspection.

## Current Head & Deliverable Summary

- **Head SHA**: `4a23ae75bae186379e7aaa728edc86db7071be58`
- **Live Status**: Controller code and tests implemented and verified locally. Live production cloud environment requires setting the Neon Postgres and Inngest environment variables listed above.
- **Next Deterministic Action**: Deploy Vercel webhook receiver and Neon Postgres database migration when live credentials are provided.

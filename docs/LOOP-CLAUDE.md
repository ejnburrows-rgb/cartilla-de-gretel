# LOOP-CLAUDE.md → see docs/AGENT-LOOP.md

> **Consolidated.** The single canonical self-driving loop for finishing this product is now
> **[`docs/AGENT-LOOP.md`](./docs/AGENT-LOOP.md)** — it holds the task queue (A/B/C/D), the per-batch
> protocol, the hard rules, and the Faithful Restoration Standard.

A **push-capable** worker (Claude Code with write access) runs the full loop; **Jules or any agent
without push access** produces draft files + a written report instead (see the "WHO RUNS THIS" section of
`AGENT-LOOP.md`). Owner-only setup (Supabase credentials + migration, splash sign-off, art coloring,
CI/branch housekeeping) is in **`docs/OWNER-MANUAL-STEPS.md`**.

Verify bar for every task: `pnpm typecheck && pnpm test && pnpm build` green, plus a real browser
screenshot of the affected screen.

Read `docs/AGENT-LOOP.md` and work its first unchecked task.

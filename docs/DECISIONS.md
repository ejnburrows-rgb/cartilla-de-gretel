# DECISIONS — La Cartilla de Gretel

A dated, plain-language log of technical decisions. One line each: what was decided and why. Newest at the bottom.

- **2026-07-30 — Prepared auth/data repairs without touching live data.** The student-code fix, teacher approval gate, class-code rotation, child-data request paths, metadata limits, note limits, CI hardening, and PDF preload removal were placed on branch `fix/security-ci-data-guardrails` as reviewable code and prepared migrations only. Live Supabase migrations, real code rotation, and real child-record operations stay gated by owner approval because they affect authentication, permissions, or real student data.

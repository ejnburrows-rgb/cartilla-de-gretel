# Session note — professional pre-login splash (2026-07-29)

Fragment for later consolidation into `docs/STATUS.md` / `docs/DECISIONS.md`
(per the established status-fragment convention, so this PR does not collide
with other open PRs touching those files).

## Owner decision (2026-07-29) — supersedes the 2026-07-25 splash direction

The PRE-LOGIN screen at `/` must be clean and professional: **no mascots, no
collage, no scene art, no kid-themed creative before login**, using only
existing approved material. This supersedes the 2026-07-25 crowded-garden
generated-scene direction *for this screen only*. Child-appropriate
illustration remains correct and expected everywhere inside the app (lessons,
workbook, flipchart, celebration screens) — do not strip it there. The 13
"ilustración pendiente" placeholders stay exactly as-is.

## What was done

- `src/components/intro/WelcomeSplash.tsx` rewritten as a text-only,
  professional gateway: eyebrow line, Lora serif title, subtitle, author
  byline (Leonor Lopetegui — from AGENTS.md), and the same `Entrar` link to
  `/entrar`. Test ids `welcome-splash` and `wc-entrar` preserved. All copy
  Spanish-only.
- `src/styles/welcome-splash.css` rewritten to match: warm cream + brand
  palette (#d4541a / #2a7d4f / #e8a820, per the classic-book refresh), light
  and `.dark` variants, `prefers-reduced-motion` respected. Zero images load
  on this screen now (fastest possible first paint on slow school networks).
- Generated-art files and `public/cartilla/art/generated/manifest.json` left
  untouched (never-delete rule); the component simply no longer reads them.

## Verified / not verified

- Verified against real repo state on `main` @ b6285fd: no test imports
  `WelcomeSplash`; QA scripts key on the preserved test ids; `.dark` is the
  app's real dark-theme class per docs/DECISIONS.md 2026-07-25.
- NOT verified in this session (no terminal in this environment):
  `pnpm typecheck / test / build / lint` and in-browser screenshots. The
  Vercel preview on the PR plus a coding-agent verification pass are the
  proof gate before merge. Do not merge red.

## Next

- Owner reviews the PR's Vercel preview (this is a client-visible surface —
  merge is the owner's call).
- Next session: Task 2.2 — lint cleanup in batched PRs (≤5 files each,
  client-visible files first). Note: repo lint state is already 0 errors /
  ~25 held warnings per STATUS.md, so 2.2 may already be satisfied — verify
  with a real `pnpm lint` run before batching.

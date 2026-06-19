# Deployment & release runbook

How *La Cartilla de Gretel* ships to production on Vercel, the workflow that
keeps production stable, and how to diagnose the failure modes this project
has actually hit. For the system design itself, see
[ARCHITECTURE.md](../ARCHITECTURE.md).

## How deploys work here

| Trigger | Deployment | URL |
|---|---|---|
| Push to `main` | **Production** | the project's primary domain |
| Push to any other branch | **Preview** (non-production) | per-branch + per-commit preview URLs |
| Open / update a PR | **Preview** | linked from the PR by the Vercel bot |

Production is gated to `main` by `vercel.json`:

```json
"git": { "deploymentEnabled": { "main": true } }
```

So **branch work never appears on the production URL until it merges to
`main`.** A feature looks "missing" in production not because the build
failed but because it simply hasn't been merged yet. Check the branch's
own preview URL to see in-progress work.

## The workflow (do this; it prevents outages)

1. **Never commit directly to `main`.** Branch first, even for small changes.
2. Push the branch and open a **pull request**. The Vercel bot posts a
   **preview** deployment on the PR.
3. **Verify on the preview URL** — the real built app, not localhost.
4. Only then **merge to `main`**, which deploys production.

Why this matters: committing straight to `main` means every half-finished
iteration deploys to production, and rapid-fire pushes each spend Vercel
build/usage budget. A run of "redo the same screen" commits on `main` can
burn through the deploy quota and get **all** production deploys blocked —
see the next section. Settle a design on a branch and push once it works.

### Before you merge / before a release

```bash
pnpm typecheck       # tsc --noEmit, clean
pnpm exec vitest run # full suite, currently 244 tests, all green
pnpm build           # runs check:sanity then vite build
```

Don't merge red.

## Incident: production is frozen / "I still see the old version"

**Symptom.** New commits land on `main`, but the live site keeps serving an
old build (old cover, old login, stale copy) — sometimes for days.

**This is usually NOT a browser cache problem.** Before blaming cache,
confirm what production is actually serving and whether new deploys are
even going live.

**Diagnose.**

1. Vercel dashboard → the `cartilla-de-gretel` project → **Deployments**.
   Look at the most recent **Production** deployments.
   - If they are **`BLOCKED`** (or `ERROR`/`CANCELED`), production is *not*
     advancing — it is pinned to the last successful build, which may be
     much older than your latest commit. That stale build is what every
     visitor sees.
   - `BLOCKED` deployments typically have **no build logs** because they
     were stopped *before* building.
2. Cross-check the served build's age: fetch the production URL and read the
   `last-modified` response header — if it predates your recent commits,
   production is frozen.

**Most common causes of mass `BLOCKED` production deploys.**

- A **spending limit** was hit. Vercel dashboard → team → **Settings →
  Billing / Usage**, and **Spend Management**. Raise or remove the cap (or
  upgrade the plan), then redeploy.
- A **usage limit** on the plan (e.g. too many production builds in a
  window) — same place, same fix.
- Production deployments were **paused** for the project.

**Recover.**

1. Clear the limit / un-pause in Billing settings.
2. Project → **Deployments** → **Redeploy** the latest `main` commit (or push
   a new commit). Production then jumps straight to current — all merged
   work lands at once.
3. Re-verify the live URL.

## Deployment protection (student access)

If the production URL returns **401/403** to a logged-out visitor, **Vercel
Authentication / Deployment Protection** is enabled — only logged-in team
members can view it. For a student-facing app this blocks the actual users.
Vercel → project → **Settings → Deployment Protection**, and make sure
production is publicly reachable.

## Offline cache versioning

The app ships a hand-written service worker (`public/sw.js`) with versioned
caches. `CACHE_VERSION` is declared **twice** — in `public/sw.js` and in
`src/lib/cache-version.ts` — and the two **must stay in sync** (a unit test
enforces this; see `src/lib/__tests__/cache-version.test.ts`).

- **Bump `CACHE_VERSION` in both files** whenever a deploy changes precached
  assets (app shell, fonts, etc). The SW's `activate` handler deletes every
  cache whose name isn't current, so bumping the version force-drops every
  visitor's stale offline cache on their next load.
- Fonts are **self-hosted** under `public/fonts/` (not the Google Fonts CDN)
  precisely so the SW can cache them — a cross-origin font is never cached
  and flashes/fails offline.

### Helping a user stuck on a stale install

If someone added the app to their home screen, the installed PWA can hold a
frozen snapshot independent of new deploys. To force a refresh:

- **Quickest test:** open the production URL in a private/incognito window —
  if it's current there, the stale copy is purely client-side.
- **Installed PWA / browser cache:** delete and re-add the home-screen icon;
  or on desktop, DevTools → Application → Service Workers → *Unregister*, then
  Storage → *Clear site data*, then hard-reload; on iOS Safari, Settings →
  Safari → Advanced → Website Data → remove the site.

> Note: a stale client cache only matters **once production is actually
> deploying.** If production itself is frozen (the BLOCKED case above), no
> amount of client-side cache clearing will help — fix the deploy first.

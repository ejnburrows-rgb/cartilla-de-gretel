# Architecture

How *La Cartilla de Gretel* is put together, what works offline, and how to
stand up the Supabase backend for local development. For product features
and contribution rules, see [README.md](README.md) and
[CONTRIBUTING.md](CONTRIBUTING.md).

## Stack

- Vite + React + TypeScript
- TanStack Router, file-based (`src/routes/`, auto-generates
  `src/routeTree.gen.ts` — never edit that file by hand)
- Supabase (auth + Postgres)
- A hand-written service worker (`public/sw.js`) for offline support, not a
  Workbox/PWA plugin

## What works offline vs. what needs Supabase

The student-facing app is local-first by design: a child should be able to
open an already-visited lesson on a phone with no signal and keep working.
Teacher tooling is online-only — a classroom dashboard with no internet
access isn't a real use case the same way an offline workbook is.

| Feature | Works offline (after first visit) | Requires Supabase |
|---|---|---|
| Workbook pages / PDF viewer | ✅ | ❌ |
| Lesson exercises (drag-build-word, syllable tap, etc.) | ✅ | ❌ |
| Local progress, streaks, badges (`localStorage`) | ✅ | ❌ |
| Joining a class (`/cartilla/unirse`) | ❌ | ✅ |
| Progress syncing to a teacher's dashboard | ❌ | ✅ |
| Teacher login, class/roster management, CRM | ❌ | ✅ |

A student who joined a class while online can keep doing lessons offline
indefinitely — only the *sync back to the teacher* needs a connection, and
that happens silently in the background (see below).

## Data flow

```
┌─────────────────────────────┐
│ Student device (browser)     │
│                               │
│  localStorage (always)       │   recordEvent()
│  - student session            ◄──────────────┐
│  - lesson/exercise progress   │               │
│  - streaks, badges, stickers  │               │
│                               │      ┌────────┴────────┐
│  Service worker cache         │      │ Exercise/lesson  │
│  - app shell, JS/CSS, fonts   │      │ component finish │
│  - workbook PDF, audio        │      └──────────────────┘
└──────────────┬────────────────┘
               │ best-effort, fire-and-forget
               │ (fails silently if offline —
               │  see src/lib/student-session.ts)
               ▼
┌─────────────────────────────┐
│ Supabase (Postgres + auth)    │
│  - student/class roster       │
│  - progress log                │◄── Teacher dashboard reads/writes
│  - teacher accounts            │    directly here (online-only,
└─────────────────────────────┘    no offline fallback)
```

`recordEvent()` in `src/lib/student-session.ts` always writes to local
storage first (so a student's own view of their progress never depends on
the network), then makes a best-effort call to Supabase that's swallowed on
failure (`.catch(() => console.warn(...))`). There is no retry queue — if a
student finishes ten offline lessons in a row, today only the local copy is
guaranteed; the next successful event after reconnecting is what syncs.
This is a known, deliberate scope limit, not a bug — building a write queue
for deferred sync is a larger feature, not part of solidifying the existing
offline experience.

The teacher side (`src/features/teacher-crm/`, `src/routes/cartilla/teacher/`)
talks to Supabase directly with no offline path, since a teacher reviewing
rosters or assignments needs live, multi-student data that doesn't make
sense to read from one browser's local cache.

## Service worker / offline caching

`public/sw.js` implements per-resource-type caching strategies (see the
file for full detail): network-first for HTML with an `/offline.html`
fallback, cache-first-forever for audio and the workbook PDF, cache-first
with a 30-day expiry for images, and stale-while-revalidate for JS/CSS.

Cache names are versioned via `CACHE_VERSION` in
**both** `public/sw.js` and `src/lib/cache-version.ts` — these two values
must be bumped together. The `activate` handler deletes any cache whose
name isn't in the current `CACHE_NAMES`, so bumping the version is how you
force every visitor's stale offline cache to be dropped after a deploy that
changes precached assets (fonts, the app shell, etc).

Fonts (Caveat, Nunito) are self-hosted under `public/fonts/` and loaded via
`@font-face` in `src/styles.css` rather than from the Google Fonts CDN —
the service worker only caches same-origin requests, so a CDN-hosted font
would silently fail offline even after a repeat visit.

## Supabase setup (local development)

The public reader and local lesson mode work with **zero configuration** —
no Supabase project needed to read the workbook or do exercises.

To enable teacher login, classes, join codes, and cloud progress sync:

1. Create a project at [supabase.com](https://supabase.com).
2. Copy your project's URL and anon/publishable key into a `.env.local`
   file at the repo root (see `.env.example`):
   ```
   VITE_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY"
   ```
3. Run the SQL migrations in `supabase/migrations/` against your project,
   in filename (timestamp) order, via the Supabase SQL editor or CLI.
4. Restart the dev server so Vite picks up the new env vars.

`src/integrations/supabase/client.ts` checks `isSupabaseConfigured` and
falls back to a disabled client (every call resolves with a
`SupabaseNotConfigured` error) when the env vars are missing, rather than
throwing — this is what lets the public reader run without a backend at
all.

## Directory map

See `CLAUDE.md` for the full directory map and project-specific rules
(no manual edits to `routeTree.gen.ts`, all Supabase calls go through
`src/services/`, etc).

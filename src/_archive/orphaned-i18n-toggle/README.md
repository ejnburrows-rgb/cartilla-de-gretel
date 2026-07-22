# orphaned-i18n-toggle

Retired English/Spanish (EN/ES) language-toggle machinery. Moved here (not
deleted) per the repo convention in `AGENTS.md` ("Never delete files — move or
rename only; retired code goes to `src/_archive/` with a short note").

## Why these were retired

The student UI is **Spanish-only** (see `AGENTS.md`: "never put English text in
the student-facing UI"). The app-wide English language toggle was removed when
issue #162 was closed-by-removal (PR #251, #244), leaving this supporting
machinery with **zero importers** anywhere in `src`. Confirmed before archiving:
no file imports `@/lib/locale` or `@/components/theme/ThemeSwitcher` (nor via any
relative path). Keeping dead, reachable-looking i18n code invited future edits
that would reintroduce English into the UI.

## What moved here

- **`ThemeSwitcher.tsx`** — a combined theme + **language** switcher control
  (rendered a `Globe`/language selector alongside light/dark/eye-comfort/type
  controls). Superseded by the theme-only `ThemeToggle`; had no importers.
- **`locale.ts`** — an EN/ES locale helper (localStorage `cartilla_lang`, string
  lookups) tied to that toggle; had no importers.

## Not moved (still live)

- `src/context/LanguageContext` — still imported in ~16 places; the active
  language context (defaults to `es`). Untouched.
- `src/components/theme/ThemeProvider.tsx` and the theme system — still used.
- `src/components/LanguageToggle.tsx` — already gutted to render only the theme
  toggle; left in place because archived code still references it. Separate
  follow-up if desired.

Nothing outside this folder imported the two files moved here, so archiving them
is behavior-preserving (`src/_archive/**` is excluded from `tsconfig`, so these
are not compiled).

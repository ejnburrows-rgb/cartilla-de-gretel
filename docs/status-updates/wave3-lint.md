# Wave 3 — behavior-preserving lint cleanup (issue #245)

Reduced ESLint problems by fixing only the safe, mechanical rule and deferring
everything whose fix could change behavior.

## Before / after
- **Before:** 388 problems (347 errors, 41 warnings)
- **After:** 277 problems (236 errors, 41 warnings)
- **Fixed:** 111 `prettier/prettier` formatting errors, via `eslint . --fix`
  (formatting/whitespace only — the only auto-fixable rule present). Reviewed:
  the diff is pure reformatting, no logic touched.

## Verified — app behavior unchanged
- `pnpm typecheck` → pass
- `pnpm test` → **1056 passed** (+2 expected-fail), 71 files
- `pnpm build` → pass

## Deliberately deferred (fixing these could change behavior — left per the issue)
- **221 `@typescript-eslint/no-explicit-any`** — replacing `any` with a real
  type is a judgement call per site and can change behavior where the true type
  is unclear. Not mass-fixed.
- **18 `react-hooks/exhaustive-deps`** — adding/removing effect deps changes when
  effects run; each needs individual review.
- **6 `react-hooks/rules-of-hooks`** — genuine issues but the fix restructures
  component logic; not safe to auto-apply.
- **23 `react-refresh/only-export-components`** (warnings) — moving exports to
  separate files; disruptive, no runtime effect.
- **4 one-offs** (`img-redundant-alt`, `no-this-alias`, `no-empty-object-type`,
  `ban-ts-comment`) — small, left with the risky set for a focused follow-up.

No rules were disabled and no blanket `eslint-disable` was added to lower the
count.

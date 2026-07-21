# Wave 2 — Remove English toggle (issue #244)

`LanguageToggle` now renders only `<ThemeToggle />` (the ES/EN language button and
the `useLanguage` usage were removed); the interface is Spanish-only per AGENTS.md.
The component name/path are unchanged, so the 7 routes that render it need no edits.
`ui-features.test.tsx` dropped its "Language Toggle" block; `LanguageContext` is left
in place (still used elsewhere, defaulting to Spanish).

Proof: screenshot of /cartilla/lecciones shows only the theme toggle, no ES/EN button
(wave2-remove-english-after.png). Tests + typecheck pass.
Completed directly (Wave 2, option B).

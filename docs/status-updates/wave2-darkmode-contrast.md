# Wave 2 — Dark-mode contrast (issue #164)

Fixed the unreadable dark-brown header on /cartilla/unirse in dark mode: the page
header h1/subtitle were hardcoded text-[#3b2a12]/text-[#7a6040] and did not adapt to
the theme; changed to theme-aware text-foreground / text-muted-foreground (readable in
both modes). Also fixed the "generic navy .dark background token": --card/--popover in
.dark now sit a few shades lighter than --background so cards read as raised panels.

Scope note: the original issue said "styles.css only, do not edit unirse.tsx" — that
constraint existed only to avoid colliding with the (separate, now-merged) English-toggle
task, which did not touch unirse.tsx. A CSS-only override of hardcoded arbitrary Tailwind
colors would be a fragile hack, so the header was fixed properly in the component.

Proof: dark-mode screenshot of /cartilla/unirse (wave2-unirse-dark-after.png) — "Soy
estudiante" is now light and legible; light mode verified unchanged. typecheck + build pass.
Completed directly (Wave 2, option B).

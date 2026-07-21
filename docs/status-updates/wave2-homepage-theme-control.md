# Wave 2 — Homepage theme control (issue #165)

The homepage "/" now renders a dark/light ThemeToggle in the top-right corner (it
previously had no theme control). Done at the route level in src/routes/index.tsx by
wrapping <WelcomeSplash /> with a positioned <ThemeToggle />; the splash component is
untouched. No language toggle added (the app is Spanish-only).

Proof: screenshot of / shows the theme toggle top-right (wave2-homepage-theme-control-after.png);
clicking it (via its aria-label) toggles the theme. typecheck passes.
Completed directly (Wave 2, option B).

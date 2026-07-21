import { ThemeToggle } from "./ThemeToggle";

// The app is intentionally Spanish-only (see AGENTS.md: "never add English
// text to the student-facing UI"). This component used to also carry an
// ES/EN language switch; that was removed so there is no way to flip the
// interface to English. It now only exposes the dark/light theme toggle.
// The name and path are kept so the routes that render <LanguageToggle />
// keep working without changes.
export function LanguageToggle() {
  return (
    <div className="flex items-center gap-3">
      <ThemeToggle />
    </div>
  );
}

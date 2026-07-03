import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Legacy route — superseded by /cartilla/unirse (real Supabase-backed class
 * join flow via joinClass()/student-session). Kept as a redirect rather than
 * deleted so old links/bookmarks land somewhere real, instead of the old
 * sessionStorage-only dead end this used to be.
 */
export const Route = createFileRoute("/cartilla/student-login")({
  beforeLoad: () => {
    throw redirect({ to: "/cartilla/unirse" });
  },
});

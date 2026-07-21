#!/usr/bin/env node
// Checks that this project can actually reach its Supabase backend.
//
// Reads the same two values the app uses (VITE_SUPABASE_URL /
// VITE_SUPABASE_PUBLISHABLE_KEY, with the non-VITE_ names as a fallback,
// matching src/integrations/supabase/client.ts).
//
// - If they are not set: prints a friendly "not configured" note and exits 0
//   (this is a valid state — the public reading mode works without Supabase).
// - If they are set: does ONE lightweight read against the `classes` table to
//   prove the connection and credentials work. Exits 0 on success, 1 on
//   failure. Never prints the key itself.
//
// Run it with:  pnpm smoke:supabase

import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const key =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "";

if (!url || !key) {
  console.log(
    "[smoke] Supabase is not configured — set VITE_SUPABASE_URL and " +
      "VITE_SUPABASE_PUBLISHABLE_KEY. See docs/SUPABASE-SETUP.md.",
  );
  console.log("[smoke] (This is fine: public reading mode works without Supabase.)");
  process.exit(0);
}

// Show only the host, never the key, so nothing secret is printed.
let host = url;
try {
  host = new URL(url).host;
} catch {
  // leave as-is if it is not a parseable URL; the read below will surface it
}
console.log(`[smoke] Supabase configured. Checking connection to ${host} ...`);

const supabase = createClient(url, key);

try {
  // A HEAD-style count against a real table: proves the URL, the key, and
  // network path all work, without reading or changing any data.
  const { error, count } = await supabase
    .from("classes")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error(`[smoke] FAIL — connected but the query was rejected: ${error.message}`);
    if (error.code) console.error(`[smoke]        error code: ${error.code}`);
    console.error(
      "[smoke]        Common causes: the migrations in supabase/migrations/ " +
        "have not been applied yet (no `classes` table), or the key is wrong. " +
        "See docs/SUPABASE-SETUP.md.",
    );
    process.exit(1);
  }

  console.log(
    `[smoke] PASS — reached the database and read the \`classes\` table ` +
      `(row count: ${count ?? "unknown"}).`,
  );
  process.exit(0);
} catch (err) {
  console.error(`[smoke] FAIL — could not reach Supabase: ${err?.message ?? err}`);
  console.error(
    "[smoke]        Check that VITE_SUPABASE_URL is correct and reachable. " +
      "See docs/SUPABASE-SETUP.md.",
  );
  process.exit(1);
}

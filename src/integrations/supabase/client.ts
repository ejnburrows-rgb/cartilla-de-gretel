// This file is generated from the Supabase project scaffold, then hardened for
// static/Vercel deployment. The public book and lessons must work even when
// Supabase environment variables have not been configured yet.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const serverEnv = typeof process !== "undefined" ? process.env : {};
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || serverEnv.SUPABASE_URL || "";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || serverEnv.SUPABASE_PUBLISHABLE_KEY || "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

const notConfiguredError = {
  name: "SupabaseNotConfigured",
  message:
    "Supabase is not configured. Public reading mode works, but teacher accounts, classes, student join codes, and cloud progress need VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
};

function disabledQueryBuilder() {
  const chain = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "then") {
          return (resolve: (value: unknown) => void) =>
            resolve({ data: null, error: notConfiguredError });
        }
        if (prop === "single" || prop === "maybeSingle") {
          return async () => ({ data: null, error: notConfiguredError });
        }
        return () => chain;
      },
    },
  );
  return chain;
}

function createDisabledSupabaseClient() {
  return {
    auth: {
      async getSession() {
        return { data: { session: null }, error: null };
      },
      async getUser() {
        return { data: { user: null }, error: notConfiguredError };
      },
      onAuthStateChange() {
        return { data: { subscription: { unsubscribe() {} } } };
      },
      async signInWithPassword() {
        return { data: { user: null, session: null }, error: notConfiguredError };
      },
      async signUp() {
        return { data: { user: null, session: null }, error: notConfiguredError };
      },
      async signOut() {
        return { error: null };
      },
    },
    from() {
      return disabledQueryBuilder();
    },
    async rpc() {
      return { data: null, error: notConfiguredError };
    },
  } as unknown as ReturnType<typeof createClient<Database>>;
}

function createSupabaseClient() {
  if (!isSupabaseConfigured) {
    console.warn("[Supabase] Missing env vars. Running in public/local mode.");
    return createDisabledSupabaseClient();
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});

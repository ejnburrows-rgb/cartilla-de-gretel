import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSeedTeacher } from "@/lib/seed-data";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (mounted) setSession(s);
    });
    
    // Listen for seed auth changes
    const handleSeedAuth = () => {
      if (mounted) {
        const seedTeacher = getSeedTeacher();
        if (seedTeacher) {
          // Seed teacher is logged in, treat as authenticated
          setSession({ user: { id: seedTeacher.id } } as Session);
        } else {
          // Seed teacher logged out, check Supabase session
          supabase.auth.getSession().then(({ data }) => {
            if (mounted) setSession(data.session);
          });
        }
      }
    };
    
    window.addEventListener("cartilla:seed-auth", handleSeedAuth);
    
    // Initial check for seed teacher
    handleSeedAuth();
    
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      window.removeEventListener("cartilla:seed-auth", handleSeedAuth);
    };
  }, []);

  useEffect(() => {
    if (session === null) {
      navigate({ to: "/login" });
    }
  }, [session, navigate]);

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-foreground/40" />
      </div>
    );
  }
  if (!session) return null;
  return <Outlet />;
}

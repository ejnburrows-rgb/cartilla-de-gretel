import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { setStudentSession } from "@/lib/student-session";
import { signInSeedTeacher } from "@/lib/seed-data";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Acceso del maestro — La Cartilla de Gretel" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    // The teacher route guard sets this flag and redirects here when a
    // signed-in session has no teacher/admin role at all — sign that
    // session out (a role-less session can't do anything anyway) instead
    // of bouncing back to /cartilla/teacher and looping forever.
    if (typeof window !== "undefined" && sessionStorage.getItem("cartilla.auth.unauthorized")) {
      sessionStorage.removeItem("cartilla.auth.unauthorized");
      setUnauthorized(true);
      supabase.auth.signOut();
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/cartilla/teacher" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setStudentSession(null); // Clear student session on teacher login

      // Demo/seed lane: never in production builds; preview/dev only when env set.
      if (
        mode === "login" &&
        !import.meta.env.PROD &&
        import.meta.env.VITE_ALLOW_DEMO_MODE === "true"
      ) {
        try {
          signInSeedTeacher(email, password);
          navigate({ to: "/cartilla/teacher" });
          return;
        } catch {
          // Not a seed credential — fall through to Supabase when configured.
          if (!isSupabaseConfigured) {
            throw new Error("Credenciales inválidas (modo demo).");
          }
        }
      }

      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/cartilla/teacher`,
            data: { full_name: fullName },
          },
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
      navigate({ to: "/cartilla/teacher" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 max-w-md mx-auto">
      <Link
        to="/cartilla"
        className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Cartilla
      </Link>
      <header className="mt-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h1 className="mt-4 text-3xl font-bold">
          {mode === "login" ? "Acceso del maestro" : "Crear cuenta de maestro"}
        </h1>
        <p className="text-sm text-foreground/60 mt-1">
          {mode === "login"
            ? "Entra para gestionar tus clases y alumnos."
            : "Crea tu cuenta para empezar a organizar clases."}
        </p>
      </header>

      {unauthorized && (
        <div className="mt-6 text-sm text-destructive font-bold bg-destructive/10 border-2 border-destructive/20 rounded-xl px-4 py-3">
          Tu cuenta no tiene permiso de maestro o administrador. Contacta al administrador de la
          escuela.
        </div>
      )}

      <form onSubmit={submit} className="mt-8 space-y-3">
        {mode === "signup" && (
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nombre completo"
            className="w-full px-4 py-3 rounded-xl border-2 border-foreground/10 bg-card focus:border-primary outline-none"
            required
          />
        )}
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@escuela.com"
          className="w-full px-4 py-3 rounded-xl border-2 border-foreground/10 bg-card focus:border-primary outline-none"
          required
        />
        <input
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          minLength={6}
          className="w-full px-4 py-3 rounded-xl border-2 border-foreground/10 bg-card focus:border-primary outline-none"
          required
        />
        {error && <div className="text-sm text-destructive font-bold">{error}</div>}
        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>

      <button
        onClick={() => {
          setError(null);
          setMode((m) => (m === "login" ? "signup" : "login"));
        }}
        className="mt-4 w-full text-sm text-foreground/60 hover:text-primary"
      >
        {mode === "login" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Entrar"}
      </button>

      <p className="mt-8 text-center text-xs text-foreground/50">
        ¿Eres estudiante?{" "}
        <Link to="/cartilla/unirse" className="underline font-bold">
          Únete a una clase
        </Link>
      </p>
    </main>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, GraduationCap, Loader2 } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { routePath } from "@/lib/assets";
import { DEMO_TEACHERS, signInDemoTeacher } from "@/lib/demo-data";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Acceso del maestro - La Cartilla de Gretel" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/cartilla/teacher" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        if (!isSupabaseConfigured) throw new Error("Las cuentas nuevas requieren Supabase.");
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: new URL(routePath("/cartilla/teacher"), window.location.origin).href,
            data: { full_name: fullName },
          },
        });
        if (err) throw err;
      } else {
        if (!isSupabaseConfigured) {
          signInDemoTeacher(email, password);
        } else {
          const { error: err } = await supabase.auth.signInWithPassword({ email, password });
          if (err) throw err;
        }
      }
      navigate({ to: "/cartilla/teacher" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-background px-4 py-8">
      <Link
        to="/cartilla"
        className="inline-flex items-center gap-2 rounded-2xl bg-card px-4 py-3 text-sm font-bold text-foreground/70 shadow-sm hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Cartilla
      </Link>

      <header className="mt-8 rounded-3xl bg-card/85 p-6 text-center shadow-xl shadow-primary/10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-4xl font-bold">
          {mode === "login" ? "Acceso del maestro" : "Crear cuenta de maestro"}
        </h1>
        <p className="mt-2 text-lg text-foreground/70">
          {mode === "login"
            ? "Entra para gestionar tus clases y alumnos."
            : "Crea tu cuenta para empezar a organizar clases."}
        </p>
      </header>

      <form
        onSubmit={submit}
        className="mt-6 space-y-4 rounded-3xl bg-card/85 p-5 shadow-xl shadow-primary/10"
      >
        {mode === "signup" && (
          <label className="block text-base font-bold">
            Nombre completo
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nombre completo"
              className="mt-2 w-full rounded-2xl border-2 border-foreground/15 bg-background px-4 py-4 text-lg outline-none focus:border-primary"
              required
            />
          </label>
        )}
        <label className="block text-base font-bold">
          {isSupabaseConfigured ? "Correo electrónico" : "Correo o usuario demo"}
          <input
            type={isSupabaseConfigured ? "email" : "text"}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@escuela.com"
            className="mt-2 w-full rounded-2xl border-2 border-foreground/15 bg-background px-4 py-4 text-lg outline-none focus:border-primary"
            required
          />
        </label>
        <label className="block text-base font-bold">
          Contraseña
          <input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            minLength={6}
            className="mt-2 w-full rounded-2xl border-2 border-foreground/15 bg-background px-4 py-4 text-lg outline-none focus:border-primary"
            required
          />
        </label>
        {error && <div className="text-sm font-bold text-destructive">{error}</div>}
        <button
          type="submit"
          disabled={busy}
          className="tap-target inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>

      {!isSupabaseConfigured && (
        <section className="mt-4 rounded-3xl border-2 border-primary/20 bg-primary/5 p-4">
          <h2 className="text-base font-bold text-primary">Cuentas demo listas</h2>
          <p className="mt-1 text-sm text-foreground/70">
            Usa cualquiera para presentar el panel docente sin configurar Supabase.
          </p>
          <div className="mt-3 space-y-2 text-sm">
            {DEMO_TEACHERS.map((teacher) => (
              <button
                key={teacher.id}
                type="button"
                onClick={() => {
                  setMode("login");
                  setEmail(teacher.username);
                  setPassword(teacher.password);
                }}
                className="w-full rounded-2xl border border-foreground/10 bg-card p-3 text-left hover:border-primary"
              >
                <span className="block font-bold">{teacher.name}</span>
                <span className="block font-mono text-xs text-foreground/70">
                  {teacher.username} / {teacher.password}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <button
        onClick={() => {
          setError(null);
          setMode((m) => (m === "login" ? "signup" : "login"));
        }}
        className="tap-target mt-4 w-full rounded-2xl bg-secondary px-4 py-3 text-base font-bold text-secondary-foreground hover:text-primary"
      >
        {mode === "login" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Entrar"}
      </button>

      <p className="mt-8 text-center text-sm text-foreground/60">
        ¿Eres estudiante?{" "}
        <Link to="/cartilla/unirse" className="font-bold underline">
          Únete a una clase
        </Link>
      </p>
    </main>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { setStudentSession } from "@/lib/student-session";
import { signInSeedTeacher } from "@/lib/seed-data";
import { checkNewPassword, MIN_NEW_PASSWORD_LENGTH } from "@/lib/password-strength";
import { acceptTeacherInvitation } from "@/lib/teacher-invitations.functions";
import {
  consumeTeacherAccessNotice,
  TEACHER_ACCESS_MESSAGES,
  type HandoffTeacherAccessState,
} from "@/lib/teacher-access-state";
import { TeacherAccessNotice } from "@/components/teacher/TeacherAccessNotice";
import "@/styles/teacher-chrome.css";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Acceso del maestro — La Cartilla de Gretel" }] }),
});

/** Invitation links land here as /login?invite=CODE. Read once, at module
 * scope, since the code is only ever needed from the URL a user actually
 * arrived on — never persisted or re-derived. */
function getInviteCodeFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("invite");
}

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<HandoffTeacherAccessState | null>(null);
  const [inviteScreen, setInviteScreen] = useState<
    "invalid_invitation" | "expired_invitation" | null
  >(null);
  const inviteCode = getInviteCodeFromUrl();

  useEffect(() => {
    // The teacher route guard hands off exactly one of these states and
    // redirects here (see setTeacherAccessNotice). "unauthorized" means a
    // signed-in session genuinely has no teacher/admin role — sign it out (it
    // can't do anything anyway) instead of bouncing back to /cartilla/teacher
    // and looping forever. "retry" means the check itself failed (network),
    // so the session is left alone and the notice offers a retry instead.
    const state = consumeTeacherAccessNotice();
    if (state) {
      setNotice(state);
      if (state === "unauthorized") supabase.auth.signOut();
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
        // Weak-password check on NEW passwords only. Deliberately not applied
        // when signing in: a teacher whose password predates these rules must
        // still be able to type it and get in.
        const strength = checkNewPassword(password, { email, fullName });
        if (!strength.ok) throw new Error(strength.message);

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

      if (inviteCode) {
        try {
          await acceptTeacherInvitation(inviteCode);
        } catch (inviteErr) {
          const message = inviteErr instanceof Error ? inviteErr.message : "";
          if (message === "Invitación vencida") {
            setInviteScreen("expired_invitation");
            return;
          }
          if (message === "Invitación inválida") {
            setInviteScreen("invalid_invitation");
            return;
          }
          // Any other failure (e.g. email confirmation still pending) — the
          // account exists but isn't a teacher yet; let the normal
          // unauthorized path handle it next time the teacher lane loads.
        }
      }

      navigate({ to: "/cartilla/teacher" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setBusy(false);
    }
  };

  if (notice === "retry") {
    return (
      <TeacherAccessNotice state="retry" onRetry={() => navigate({ to: "/cartilla/teacher" })} />
    );
  }
  if (inviteScreen) {
    return <TeacherAccessNotice state={inviteScreen} />;
  }

  return (
    <main className="teacher-chrome min-h-screen px-4 py-8">
      <div className="max-w-md mx-auto">
        <Link
          to="/cartilla"
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--tc-ink-soft)] hover:text-[var(--tc-ink)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Cartilla
        </Link>
        <header className="mt-8 text-center">
          <div className="teacher-chrome__brand-mark mx-auto w-14 h-14 rounded-2xl text-white flex items-center justify-center">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="mt-4 text-3xl font-black text-[var(--tc-ink)]">
            {mode === "login" ? "Acceso del maestro" : "Crear cuenta de maestro"}
          </h1>
          <p className="text-sm font-bold text-[var(--tc-ink-soft)] mt-1">
            {mode === "login"
              ? "Entra para gestionar tus clases y alumnos."
              : "Crea tu cuenta para empezar a organizar clases."}
          </p>
        </header>

        {notice === "unauthorized" && (
          <div
            role="alert"
            className="mt-6 text-sm text-destructive font-bold bg-destructive/10 border-2 border-destructive/20 rounded-2xl px-4 py-3"
          >
            {TEACHER_ACCESS_MESSAGES.unauthorized} Contacta al administrador de la escuela.
          </div>
        )}

        {inviteCode && !notice && (
          <div
            role="status"
            className="mt-6 text-sm font-bold text-[var(--tc-ink-soft)] bg-white/60 border-2 border-[var(--tc-border)] rounded-2xl px-4 py-3"
          >
            {TEACHER_ACCESS_MESSAGES.pending_approval}
          </div>
        )}

        <form onSubmit={submit} className="mt-8 space-y-3">
          {mode === "signup" && (
            <div>
              <label htmlFor="full-name" className="sr-only">
                Nombre completo
              </label>
              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nombre completo"
                className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--tc-border)] bg-white text-[var(--tc-ink)] text-sm font-bold shadow-inner focus:border-[var(--tc-accent)] outline-none"
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="sr-only">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@escuela.com"
              className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--tc-border)] bg-white text-[var(--tc-ink)] text-sm font-bold shadow-inner focus:border-[var(--tc-accent)] outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              // Only the longer rule applies to a NEW password. Signing in
              // keeps Supabase's own minimum of 6, so a teacher with an older
              // password is never blocked from typing it.
              minLength={mode === "signup" ? MIN_NEW_PASSWORD_LENGTH : 6}
              className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--tc-border)] bg-white text-[var(--tc-ink)] text-sm font-bold shadow-inner focus:border-[var(--tc-accent)] outline-none"
              required
            />
            {mode === "signup" && (
              <p className="mt-2 ml-1 text-xs font-bold text-[var(--tc-ink-faint)]">
                Al menos {MIN_NEW_PASSWORD_LENGTH} caracteres. Evita contraseñas comunes: tres
                palabras que solo tú recuerdes funcionan muy bien.
              </p>
            )}
          </div>
          {error && <div className="text-sm text-destructive font-bold">{error}</div>}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-4 rounded-2xl text-white font-black text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition disabled:opacity-50 disabled:translate-y-0 inline-flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #5fa777, #3d7a5c)" }}
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
          className="mt-4 w-full text-sm font-bold text-[var(--tc-ink-soft)] hover:text-[var(--tc-ink)] transition-colors"
        >
          {mode === "login" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Entrar"}
        </button>

        <p className="mt-8 text-center text-xs font-bold text-[var(--tc-ink-faint)]">
          ¿Eres estudiante?{" "}
          <Link to="/cartilla/unirse" className="underline font-bold text-[var(--tc-ink-soft)]">
            Únete a una clase
          </Link>
        </p>
      </div>
    </main>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, LogIn, Loader2, LogOut } from "lucide-react";
import { joinClass } from "@/lib/student.functions";
import { setStudentSession, useStudentSession } from "@/lib/student-session";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { DEMO_STUDENT_ACCESS } from "@/lib/demo-data";

const DEFAULT_DEMO_STUDENT = DEMO_STUDENT_ACCESS[0];

export const Route = createFileRoute("/cartilla/unirse")({
  component: JoinPage,
  head: () => ({ meta: [{ title: "Únete a una clase — La Cartilla de Gretel" }] }),
});

function JoinPage() {
  const navigate = useNavigate();
  const join = useServerFn(joinClass);
  const session = useStudentSession();
  const [joinCode, setJoinCode] = useState(() =>
    isSupabaseConfigured ? "" : DEFAULT_DEMO_STUDENT.joinCode,
  );
  const [studentCode, setStudentCode] = useState(() =>
    isSupabaseConfigured ? "" : DEFAULT_DEMO_STUDENT.studentCode,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await join({ data: { joinCode, studentCode } });
      setStudentSession(res);
      navigate({ to: "/cartilla/lecciones" });
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
        <div className="mx-auto w-14 h-14 rounded-2xl bg-vowel-i text-white flex items-center justify-center">
          <LogIn className="w-7 h-7" />
        </div>
        <h1 className="mt-4 text-3xl font-bold">Únete a una clase</h1>
        <p className="text-sm text-foreground/60 mt-1">
          Este paso es opcional. Solo úsalo si tu maestra o maestro te dio códigos para guardar progreso de aula.
        </p>
      </header>

      {session ? (
        <div className="mt-8 kid-card p-4 text-center">
          <p className="font-bold">¡Hola, {session.studentName}!</p>
          <p className="text-sm text-foreground/60 mt-1">
            Estás en la clase <strong>{session.className}</strong>.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              to="/cartilla/lecciones"
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold"
            >
              Continuar a las lecciones
            </Link>
            <button
              onClick={() => setStudentSession(null)}
              className="text-sm text-foreground/60 hover:text-destructive inline-flex items-center justify-center gap-1"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      ) : (
        <>
          <form onSubmit={submit} className="mt-8 space-y-3">
            {!isSupabaseConfigured && (
              <div className="rounded-2xl border-2 border-vowel-i/20 bg-vowel-i/5 px-4 py-3 text-sm font-bold text-vowel-i">
                Modo local: Supabase no está configurado. La sesión y el progreso de clase se guardan
                en este navegador. Acceso de prueba prellenado: {DEFAULT_DEMO_STUDENT.name}.
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-foreground/60 uppercase tracking-wide">
                Código de la clase
              </label>
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder={isSupabaseConfigured ? "ABC123" : DEFAULT_DEMO_STUDENT.joinCode}
                maxLength={10}
                className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-foreground/10 bg-card focus:border-primary outline-none font-mono text-lg tracking-widest text-center"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/60 uppercase tracking-wide">
                Tu código personal
              </label>
              <input
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                placeholder={isSupabaseConfigured ? "X9YZ2" : DEFAULT_DEMO_STUDENT.studentCode}
                maxLength={10}
                className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-foreground/10 bg-card focus:border-primary outline-none font-mono text-lg tracking-widest text-center"
                required
              />
            </div>
            {error && <div className="text-sm text-destructive font-bold">{error}</div>}
            <button
              type="submit"
              disabled={busy || !joinCode || !studentCode}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {busy ? "Validando códigos..." : "Entrar a mi clase"}
            </button>
          </form>
          <Link
            to="/cartilla/lecciones"
            className="mt-4 flex w-full items-center justify-center rounded-xl border-2 border-foreground/10 bg-white px-4 py-3 text-sm font-black text-foreground/70 hover:bg-muted"
          >
            Explorar el cuaderno sin código
          </Link>
          {!isSupabaseConfigured && (
            <section className="mt-4 rounded-3xl border-2 border-vowel-i/20 bg-vowel-i/5 p-4">
              <h2 className="text-base font-bold text-vowel-i">Accesos de prueba locales</h2>
              <div className="mt-3 space-y-2 text-sm">
                {DEMO_STUDENT_ACCESS.map((student) => (
                  <button
                    key={`${student.joinCode}-${student.studentCode}`}
                    type="button"
                    onClick={() => {
                      setJoinCode(student.joinCode);
                      setStudentCode(student.studentCode);
                    }}
                    className="w-full rounded-2xl border border-foreground/10 bg-card p-3 text-left hover:border-vowel-i"
                  >
                    <span className="block font-bold">{student.name}</span>
                    <span className="block font-mono text-xs text-foreground/70">
                      Clase {student.joinCode} / Código {student.studentCode}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

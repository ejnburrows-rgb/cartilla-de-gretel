import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, LogIn, Loader2, LogOut } from "lucide-react";
import { joinClass } from "@/lib/student.functions";
import { setStudentSession, useStudentSession } from "@/lib/student-session";
import { SEED_STUDENT_ACCESS } from "@/lib/seed-data";
import { GretelMascot } from "@/components/gretel/GretelMascot";

export const Route = createFileRoute("/cartilla/unirse")({
  component: JoinPage,
  head: () => ({ meta: [{ title: "Únete a una clase — La Cartilla de Gretel" }] }),
});

const quickStudentAccess = SEED_STUDENT_ACCESS.slice(0, 2);

function JoinPage() {
  const navigate = useNavigate();
  const join = useServerFn(joinClass);
  const session = useStudentSession();
  const [joinCode, setJoinCode] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await join({ data: { joinCode, studentCode } });
      setStudentSession(res);
      navigate({ to: "/cartilla/student/lecciones" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setBusy(false);
    }
  };

  const enterWithQuickStudent = async (access: (typeof SEED_STUDENT_ACCESS)[number]) => {
    setBusy(true);
    setError(null);
    try {
      const res = await join({
        data: { joinCode: access.joinCode, studentCode: access.studentCode },
      });
      setStudentSession(res);
      navigate({ to: "/cartilla/student/lecciones" });
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
        <h1 className="mt-4 text-3xl font-bold">Únete a tu clase</h1>
        <p className="text-sm text-foreground/60 mt-1">
          Pídele a tu maestra o maestro los dos códigos.
        </p>
      </header>

      {session ? (
        <div className="mt-8 kid-card p-6 text-center flex flex-col items-center">
          <div className="mb-4">
            <GretelMascot
              pose="welcome"
              text={`¡Hola, ${session.studentName}!\n¡Qué alegría verte aquí!\nEntra a tu clase para comenzar.`}
              bubblePosition="top"
            />
          </div>
          <p className="font-bold text-lg mt-2">¡Hola, {session.studentName}!</p>
          <p className="text-sm text-foreground/60 mt-1">
            Estás en la clase <strong>{session.className}</strong>.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              to="/cartilla/student/lecciones"
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
        <div className="mt-8 space-y-5">
          <section className="kid-card p-4">
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground/60">
              Acceso rápido
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {quickStudentAccess.map((access) => (
                <button
                  key={`${access.joinCode}-${access.studentCode}`}
                  type="button"
                  onClick={() => enterWithQuickStudent(access)}
                  disabled={busy}
                  className="rounded-2xl border-2 border-foreground/10 bg-white/80 px-3 py-4 text-center font-black shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 disabled:opacity-50"
                  aria-label={`Entrar como ${access.name}`}
                >
                  {access.name}
                </button>
              ))}
            </div>
          </section>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-foreground/60 uppercase tracking-wide">
                Código de la clase
              </label>
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
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
                placeholder="X9YZ2"
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
              Entrar
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, LogIn, Loader2, LogOut, Sparkles } from "lucide-react";
import { joinClass } from "@/lib/student.functions";
import { setStudentSession, useStudentSession } from "@/lib/student-session";
import { SEED_STUDENT_ACCESS } from "@/lib/seed-data";
import { GretelMascot } from "@/components/gretel/GretelMascot";

export const Route = createFileRoute("/cartilla/unirse")({
  component: JoinPage,
  head: () => ({ meta: [{ title: "Únete a una clase — La Cartilla de Gretel" }] }),
});

function JoinPage() {
  const navigate = useNavigate();
  const join = useServerFn(joinClass);
  const session = useStudentSession();
  const [joinCode, setJoinCode] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleQuickDemo = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await join({ data: { joinCode: "DEMO12", studentCode: "DEMO1" } });
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

      {!mounted ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : session ? (
        <div className="mt-8 kid-card p-6 text-center flex flex-col items-center">
          <div className="mb-4">
            <GretelMascot
              pose="wave"
              text={`¡Hola! Soy Gretel\n¡Qué alegría verte, ${session.studentName}!\nEntra a tu clase para comenzar.`}
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

          <div className="border-2 border-dashed border-foreground/15 rounded-2xl p-5 bg-card hover:border-primary/40 transition-colors mt-6 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-vowel-i/10 text-vowel-i mb-1">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-foreground">Demostración Fuera de Línea</h2>
            <p className="text-xs text-foreground/60 leading-relaxed max-w-xs mx-auto">
              ¿Quieres probar la aplicación sin conexión al servidor? Usa nuestro estudiante de prueba local.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={busy}
                className="w-full py-2.5 rounded-xl bg-foreground text-background hover:opacity-90 active:scale-[0.98] transition font-bold text-sm flex items-center justify-center gap-2"
              >
                Entrar en Modo Demo
              </button>
              <button
                type="button"
                onClick={() => {
                  setJoinCode("DEMO12");
                  setStudentCode("DEMO1");
                }}
                disabled={busy}
                className="w-full py-2.5 rounded-xl border border-foreground/10 bg-card hover:bg-secondary active:scale-[0.98] transition font-bold text-sm text-foreground/80"
              >
                Cargar credenciales demo
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

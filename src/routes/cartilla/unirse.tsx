import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, Loader2, LogOut, KeyRound } from "lucide-react";
import { listClassStudents, enterClassAsStudent } from "@/lib/student.functions";
import { setStudentSession, useStudentSession } from "@/lib/student-session";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { GardenBackdrop } from "@/components/cartilla/GardenBackdrop";
import { sCopy } from "@/content/student-copy";
import "@/styles/interactive-exercises.css";

export const Route = createFileRoute("/cartilla/unirse")({
  component: JoinPage,
  head: () => ({ meta: [{ title: "Únete a una clase — La Cartilla de Gretel" }] }),
});

type Step = "code" | "pick";

function JoinPage() {
  const { lang } = useLanguage();
  const t = sCopy;
  const navigate = useNavigate();
  const listStudents = useServerFn(listClassStudents);
  const enterClass = useServerFn(enterClassAsStudent);
  const session = useStudentSession();
  const [step, setStep] = useState<Step>("code");
  const [joinCode, setJoinCode] = useState("");
  const [roster, setRoster] = useState<Array<{ studentId: string; displayName: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const students = await listStudents({ data: { joinCode } });
      setRoster(students);
      setStep("pick");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : lang === "es" ? "Error desconocido" : "Unknown error",
      );
    } finally {
      setBusy(false);
    }
  };

  const pickStudent = async (studentId: string) => {
    setBusy(true);
    setError(null);
    try {
      await supabase.auth.signOut(); // Ensure no teacher session remains
      const res = await enterClass({ data: { joinCode, studentId } });
      setStudentSession(res);
      navigate({ to: "/cartilla/lecciones" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : lang === "es" ? "Error desconocido" : "Unknown error",
      );
    } finally {
      setBusy(false);
    }
  };

  const backToCode = () => {
    setStep("code");
    setRoster([]);
    setError(null);
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center py-10">
      <GardenBackdrop />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="flex items-center justify-between gap-3 mb-8">
          <Link
            to="/cartilla"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur text-stone-800 font-bold rounded-full transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Atrás
          </Link>
          <div className="bg-white/40 hover:bg-white/60 backdrop-blur rounded-full px-2 py-1 transition shadow-sm">
            <LanguageToggle />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] border-4 border-white">
          <header className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-[#ea580c] to-[#c2410c] text-white flex items-center justify-center shadow-inner mb-4">
              <KeyRound className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black font-fredoka text-foreground">
              {t.soyEstudiante[lang]}
            </h1>
            <p className="text-sm font-bold text-muted-foreground mt-2">{t.pideleMaestra[lang]}</p>
          </header>

          {session ? (
            <div className="text-center bg-white/60 rounded-3xl p-6 border-2 border-white">
              <p className="font-black text-xl text-[#3b2a12] mb-1">
                {t.holaName[lang].replace("{name}", session.studentName)}!
              </p>
              <p className="text-sm font-bold text-stone-500 mb-6">
                {t.estasEnClase[lang]} <strong className="text-primary">{session.className}</strong>
                .
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/cartilla/lecciones"
                  className="px-6 py-4 rounded-full bg-primary text-primary-foreground font-black text-lg shadow-md hover:-translate-y-1 transition-all"
                >
                  {t.continuarLecciones[lang]}
                </Link>
                <button
                  onClick={() => setStudentSession(null)}
                  className="text-sm font-bold text-stone-400 hover:text-destructive transition-colors inline-flex items-center justify-center gap-1 py-2"
                >
                  <LogOut className="w-4 h-4" /> {t.salir[lang]}
                </button>
              </div>
            </div>
          ) : step === "code" ? (
            <form onSubmit={submitCode} className="space-y-5">
              <div>
                <label className="text-xs font-black text-stone-500 uppercase tracking-widest ml-4 mb-2 block">
                  {t.codigoClase[lang]}
                </label>
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={10}
                  className="w-full px-6 py-4 rounded-full border-4 border-white bg-white/60 focus:bg-white shadow-inner font-mono text-2xl font-black tracking-[0.2em] text-center text-stone-700 outline-none focus:ring-4 focus:ring-primary/30 transition-all placeholder:text-stone-300 placeholder:font-bold"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 font-bold text-sm text-center py-3 px-4 rounded-2xl border-2 border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy || !joinCode}
                className="w-full mt-4 py-4 rounded-full bg-primary text-primary-foreground font-black text-xl disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-lg hover:bg-primary/90 hover:-translate-y-1 transition-all active:translate-y-0"
              >
                {busy ? <Loader2 className="w-6 h-6 animate-spin" /> : t.entrar[lang]}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <h2 className="text-center text-xl font-black text-[#3b2a12]">
                {t.elijeTuNombre[lang]}
              </h2>

              {error && (
                <div className="bg-red-50 text-red-600 font-bold text-sm text-center py-3 px-4 rounded-2xl border-2 border-red-100">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {roster.map((s) => (
                  <button
                    key={s.studentId}
                    onClick={() => pickStudent(s.studentId)}
                    disabled={busy}
                    className="min-h-[4.5rem] px-4 py-3 rounded-3xl border-4 border-white bg-white/70 hover:bg-white shadow-md hover:-translate-y-1 active:translate-y-0 transition-all font-black text-lg text-stone-800 disabled:opacity-50 flex items-center justify-center text-center"
                  >
                    {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : s.displayName}
                  </button>
                ))}
              </div>

              <button
                onClick={backToCode}
                disabled={busy}
                className="w-full text-sm font-bold text-stone-400 hover:text-stone-600 transition-colors inline-flex items-center justify-center gap-1 py-2"
              >
                <ArrowLeft className="w-4 h-4" /> {t.cambiarCodigo[lang]}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

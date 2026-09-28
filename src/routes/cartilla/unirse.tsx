import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, Loader2, LogOut, KeyRound } from "lucide-react";
import { joinClass } from "@/lib/student.functions";
import { setStudentSession, useStudentSession } from "@/lib/student-session";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { GardenBackdrop } from "@/components/cartilla/GardenBackdrop";
import { sCopy } from "@/content/student-copy";
import "@/styles/interactive-exercises.css";

export const Route = createFileRoute("/cartilla/unirse")({
  beforeLoad: () => {
    if (import.meta.env.VITE_CRM_REVIEW === "true") {
      throw redirect({ to: "/cartilla/lecciones" });
    }
  },
  component: JoinPage,
  head: () => ({
    meta: [{ title: "Únete a una clase — La Cartilla de Gretel" }],
  }),
});

function JoinPage() {
  const { lang } = useLanguage();
  const t = sCopy;
  const navigate = useNavigate();
  const join = useServerFn(joinClass);
  const session = useStudentSession();
  const [joinCode, setJoinCode] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await supabase.auth.signOut();
      const result = await join({ data: { joinCode, studentCode } });
      setStudentSession(result);
      navigate({ to: "/cartilla/lecciones" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setBusy(false);
    }
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
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] border-4 border-white">
          <header className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-[#ea580c] to-[#c2410c] text-white flex items-center justify-center shadow-inner mb-4">
              <KeyRound className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black font-fredoka text-[#3b2a12]">
              {t.soyEstudiante[lang]}
            </h1>
            <p className="text-sm font-bold text-[#7a6040] mt-2">
              Ingresa el código de tu clase y tu código personal.
            </p>
          </header>

          {session ? (
            <div className="text-center bg-white/60 rounded-3xl p-6 border-2 border-white">
              <p className="font-black text-xl text-[#3b2a12] mb-1">
                {t.holaName[lang].replace("{name}", session.studentName)}!
              </p>
              <p className="text-sm font-bold text-stone-500 mb-6">
                {t.estasEnClase[lang]} <strong className="text-primary">{session.className}</strong>.
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
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="join-code" className="text-xs font-black text-stone-500 uppercase tracking-widest ml-4 mb-2 block">
                  {t.codigoClase[lang]}
                </label>
                <input
                  id="join-code"
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={10}
                  className="w-full px-6 py-4 rounded-full border-4 border-white bg-white/60 focus:bg-white shadow-inner font-mono text-2xl font-black tracking-[0.2em] text-center text-stone-700 outline-none focus:ring-4 focus:ring-primary/30 transition-all placeholder:text-stone-300 placeholder:font-bold"
                  required
                  autoFocus
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="student-code" className="text-xs font-black text-stone-500 uppercase tracking-widest ml-4 mb-2 block">
                  Tu código personal
                </label>
                <input
                  id="student-code"
                  value={studentCode}
                  onChange={(event) => setStudentCode(event.target.value.toUpperCase())}
                  placeholder="A2B3C"
                  maxLength={10}
                  className="w-full px-6 py-4 rounded-full border-4 border-white bg-white/60 focus:bg-white shadow-inner font-mono text-2xl font-black tracking-[0.2em] text-center text-stone-700 outline-none focus:ring-4 focus:ring-primary/30 transition-all placeholder:text-stone-300 placeholder:font-bold"
                  required
                  autoComplete="off"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 font-bold text-sm text-center py-3 px-4 rounded-2xl border-2 border-red-100" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy || !joinCode || !studentCode}
                className="w-full mt-4 py-4 rounded-full bg-primary text-primary-foreground font-black text-xl disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-lg hover:bg-primary/90 hover:-translate-y-1 transition-all active:translate-y-0"
              >
                {busy ? <Loader2 className="w-6 h-6 animate-spin" /> : t.entrar[lang]}
              </button>
              <p className="text-center text-xs font-bold text-stone-500">
                Tu maestra te entrega ambos códigos. El código personal protege tu progreso.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

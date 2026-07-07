import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, Loader2, LogOut, KeyRound } from "lucide-react";
import { joinClass } from "@/lib/student.functions";
import { setStudentSession, useStudentSession } from "@/lib/student-session";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { sCopy } from "@/content/student-copy";
import "@/styles/interactive-exercises.css";

export const Route = createFileRoute("/cartilla/unirse")({
  component: JoinPage,
  head: () => ({ meta: [{ title: "Únete a una clase — La Cartilla de Gretel" }] }),
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await join({ data: { joinCode, studentCode } });
      setStudentSession(res);
      navigate({ to: "/cartilla/lecciones" });
    } catch (err) {
      setError(err instanceof Error ? err.message : lang === "es" ? "Error desconocido" : "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center py-10" style={{ background: "radial-gradient(circle, #e5c531 0%, #0d6b38 100%)" }}>
      {/* 3D CSS Garden Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Sun */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full blur-xl opacity-80 animate-pulse" />
        <div className="absolute top-12 right-12 w-28 h-28 bg-yellow-400 rounded-full" />
        
        {/* Clouds */}
        <div className="absolute top-20 left-10 w-48 h-16 bg-white/80 rounded-full blur-md animate-[float_10s_ease-in-out_infinite]" />
        <div className="absolute top-40 right-1/4 w-32 h-12 bg-white/70 rounded-full blur-md animate-[float_14s_ease-in-out_infinite_reverse]" />
        
        {/* Rolling Hills (CSS curves) */}
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-emerald-400 [clip-path:ellipse(120%_100%_at_50%_100%)] shadow-inner" />
        <div className="absolute bottom-0 left-[-20%] right-[-20%] h-[30vh] bg-green-500 [clip-path:ellipse(100%_100%_at_20%_100%)] opacity-80" />
        <div className="absolute bottom-0 left-[-20%] right-[-20%] h-[25vh] bg-emerald-600 [clip-path:ellipse(100%_100%_at_80%_100%)] opacity-60" />
      </div>

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
            <h1 className="text-3xl font-black font-fredoka text-[#3b2a12]">{t.soyEstudiante[lang]}</h1>
            <p className="text-sm font-bold text-[#7a6040] mt-2">
              {t.pideleMaestra[lang]}
            </p>
          </header>

          {session ? (
            <div className="text-center bg-white/60 rounded-3xl p-6 border-2 border-white">
              <p className="font-black text-xl text-[#3b2a12] mb-1">{t.holaName[lang].replace("{name}", session.studentName)}!</p>
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
                />
              </div>
              <div>
                <label className="text-xs font-black text-stone-500 uppercase tracking-widest ml-4 mb-2 block">
                  {t.tuCodigoPersonal[lang]}
                </label>
                <input
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                  placeholder="X9YZ2"
                  maxLength={10}
                  className="w-full px-6 py-4 rounded-full border-4 border-white bg-white/60 focus:bg-white shadow-inner font-mono text-2xl font-black tracking-[0.2em] text-center text-stone-700 outline-none focus:ring-4 focus:ring-[#0284c7]/30 transition-all placeholder:text-stone-300 placeholder:font-bold"
                  required
                />
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 font-bold text-sm text-center py-3 px-4 rounded-2xl border-2 border-red-100">
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
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

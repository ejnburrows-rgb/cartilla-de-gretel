import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Download, MonitorPlay, RotateCcw, WifiOff } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { GRETEL_APPROVED_MASTER_SRC } from "@/lib/gretel-master";
import { isLessonCompleted } from "@/lib/lesson-progress";
import { CACHE_NAMES } from "@/lib/cache-version";
import {
  SUBSTITUTE_INACTIVITY_MS,
  buildLocalSubstituteReport,
  createSubstituteSession,
  getSubstituteLesson,
  readSubstituteSession,
  recordSubstituteAnswer,
  saveSubstituteSession,
  startSubstitutePractice,
  verifyWorkbookCompletion,
  type SubstituteSession,
} from "@/lib/offline-substitute-teacher";

export const Route = createFileRoute("/cartilla/suplente")({
  component: SubstituteTeacherPage,
  head: () => ({ meta: [{ title: "Maestra suplente — La Cartilla de Gretel" }] }),
});

function SubstituteTeacherPage() {
  const [session, setSession] = useState<SubstituteSession>(
    () => readSubstituteSession() ?? createSubstituteSession(1),
  );
  const [feedback, setFeedback] = useState("");
  const [saveOk, setSaveOk] = useState(true);
  const [offline, setOffline] = useState(
    () => typeof navigator !== "undefined" && !navigator.onLine,
  );
  const [packMessage, setPackMessage] = useState("");
  const [preparing, setPreparing] = useState(false);
  const lesson = useMemo(() => getSubstituteLesson(session.lesson), [session.lesson]);
  const question = lesson?.questions[session.questionIndex];

  useEffect(() => {
    setSaveOk(saveSubstituteSession(session));
  }, [session]);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener("offline", update);
    window.addEventListener("online", update);
    return () => {
      window.removeEventListener("offline", update);
      window.removeEventListener("online", update);
    };
  }, []);

  useEffect(() => {
    if (session.stage !== "practica") return;
    const id = window.setTimeout(() => {
      setFeedback((before) => before || "¿Necesitas ayuda? Mira la palabra con calma y vuelve a intentarlo.");
    }, SUBSTITUTE_INACTIVITY_MS);
    return () => window.clearTimeout(id);
  }, [session.stage, session.questionIndex, session.retries, session.updatedAt]);

  const selectLesson = (lessonNumber: number) => {
    setSession(createSubstituteSession(lessonNumber));
    setFeedback("");
    setPackMessage("");
  };

  const answer = (choice: string) => {
    if (!question || session.stage !== "practica") return;
    const correct = choice === question.answer;
    setSession((previous) => recordSubstituteAnswer(previous, choice));
    setFeedback(correct ? "Bien. Sigamos con la siguiente palabra." : question.hint);
  };

  const verifyWorkbook = () => {
    const verified = isLessonCompleted(session.lesson);
    setSession((current) => verifyWorkbookCompletion(current, verified));
    setFeedback(
      verified
        ? "El cuaderno registra la lección como completada. Tu guía terminó."
        : "El cuaderno todavía no registra la lección como completada. Termina las actividades antes de cerrar.",
    );
  };

  const downloadReport = () => {
    const report = buildLocalSubstituteReport(session, isLessonCompleted(session.lesson));
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cartilla-guia-local-leccion-${session.lesson}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setFeedback("Resumen descargado en este dispositivo. No se ha enviado a ningún servidor.");
  };

  const prepareOffline = useCallback(async () => {
    if (preparing) return;
    setPreparing(true);
    setPackMessage("");
    try {
      if (!("caches" in window) || !("serviceWorker" in navigator)) {
        throw new Error("Este navegador no permite guardar la guía sin conexión.");
      }
      await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("El modo sin conexión aún no está activo; recarga la página.")), 6000)),
      ]);
      if (!navigator.serviceWorker.controller) {
        throw new Error("Recarga esta página una vez para activar el modo sin conexión.");
      }
      const urls = new Set<string>([
        "/cartilla/suplente",
        "/cartilla/lecciones",
        "/offline.html",
      ]);
      for (const item of performance.getEntriesByType("resource")) {
        const url = new URL(item.name);
        if (url.origin !== location.origin) continue;
        if (/\.(?:js|css|woff2?)(?:\?|$)/.test(url.pathname)) {
          urls.add(url.pathname + url.search);
        }
      }
      const shellCache = await caches.open(CACHE_NAMES.appShell);
      const assetsCache = await caches.open(CACHE_NAMES.assets);
      for (const url of urls) {
        const response = await fetch(url, { cache: "reload" });
        if (!response.ok) throw new Error(`No se pudo guardar ${url}.`);
        const resource = url.split("?")[0] ?? url;
        const cache = resource.endsWith(".js") || resource.endsWith(".css") || resource.endsWith(".woff") || resource.endsWith(".woff2") || resource.includes("/assets/") ? assetsCache : shellCache;
        await cache.put(url, response);
      }
      for (const url of urls) {
        const resource = url.split("?")[0] ?? url;
        const cache = resource.endsWith(".js") || resource.endsWith(".css") || resource.endsWith(".woff") || resource.endsWith(".woff2") || resource.includes("/assets/") ? assetsCache : shellCache;
        if (!(await cache.match(url))) throw new Error("No se pudo verificar el paquete local.");
      }
      setPackMessage("Guía y archivos cargados guardados. Prueba desconectando internet; las páginas del libro deben visitarse previamente.");
    } catch (error) {
      setPackMessage(error instanceof Error ? error.message : "No fue posible preparar el acceso sin conexión.");
    } finally {
      setPreparing(false);
    }
  }, [preparing]);

  if (!lesson) return <main className="p-5">Lección no disponible.</main>;

  return (
    <main className="min-h-screen bg-[#fbf7ee] px-3 py-6 text-stone-800 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <Link to="/cartilla/teacher/gretel" className="inline-flex min-h-11 items-center text-sm font-bold text-teal-800">
          ← Volver a Gretel para maestros
        </Link>

        <header className="flex items-center gap-4 rounded-3xl border border-teal-200 bg-white p-4 shadow-sm sm:p-6">
          <img src={GRETEL_APPROVED_MASTER_SRC} alt="Gretel original" className="h-20 w-20 shrink-0 rounded-2xl object-contain sm:h-28 sm:w-28" />
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-teal-700">Guía preprogramada · Sin IA en línea</p>
            <h1 className="text-2xl font-black sm:text-3xl">Maestra suplente</h1>
            <p className="mt-1 text-sm text-stone-600">
              La Cartilla real, paso por paso. Respuestas por toque; voz y micrófono no disponibles sin grabaciones/modelo verificados.
            </p>
          </div>
        </header>

        <section className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="block text-sm font-bold">
            Lección del libro
            <select
              aria-label="Elegir lección para maestra suplente"
              className="mt-2 min-h-12 w-full rounded-xl border border-stone-300 bg-[#fbf7ee] p-3 text-sm font-semibold"
              value={session.lesson}
              onChange={(event) => selectLesson(Number(event.target.value))}
            >
              {CATALOG.map((item) => (
                <option key={item.n} value={item.n}>Lección {item.n} · {item.title}</option>
              ))}
            </select>
          </label>
          <button onClick={() => void prepareOffline()} disabled={preparing || offline} className="min-h-12 rounded-xl bg-teal-800 px-4 text-sm font-bold text-white disabled:opacity-50" type="button">
            {preparing ? "Guardando..." : "Guardar guía sin conexión"}
          </button>
          <p className="text-xs text-stone-600 sm:col-span-2" role="status">
            {offline ? "Sin internet: las respuestas y el progreso se guardan en este dispositivo." : "Con conexión: puedes preparar esta guía para volver a abrirla sin internet."}
            {packMessage && <span className="mt-1 block font-semibold">{packMessage}</span>}
          </p>
        </section>

        <section aria-label="Secuencia de la clase" className="grid grid-cols-4 gap-1.5 text-center text-[11px] font-bold sm:gap-3 sm:text-sm">
          {([
            ["presentacion", "1. Presentar"],
            ["practica", "2. Practicar"],
            ["cuaderno", "3. Cuaderno"],
            ["cierre", "4. Terminar"],
          ] as const).map(([id, name]) => (
            <div key={id} className={`rounded-xl border px-1 py-3 ${session.stage === id ? "border-teal-600 bg-teal-100 text-teal-900" : "border-stone-200 bg-white text-stone-500"}`}>
              {name}
            </div>
          ))}
        </section>

        <section className="min-h-72 rounded-3xl border border-teal-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-black sm:text-2xl">Lección {lesson.number}: {lesson.title}</h2>
          <p className="mt-1 text-sm text-stone-600">{lesson.subtitle}</p>

          {session.stage === "presentacion" && (
            <div className="mt-6 space-y-5">
              <p className="text-base leading-relaxed">Primero presenta la lámina original del rotafolio. Luego practica únicamente las vocales o sílabas que aparecen en esta lección.</p>
              <a href={lesson.flipchartPath} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-teal-600 px-4 py-3 font-bold text-teal-800">
                <MonitorPlay size={19} /> Abrir rotafolio auténtico
              </a>
              <div>
                <button type="button" onClick={() => { setSession((s) => startSubstitutePractice(s)); setFeedback(""); }} className="min-h-12 rounded-xl bg-teal-800 px-5 py-3 font-bold text-white">
                  Comenzar preguntas guiadas
                </button>
              </div>
            </div>
          )}

          {session.stage === "practica" && question && (
            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between gap-2 text-sm font-bold text-teal-800">
                <span>Pregunta {session.questionIndex + 1} de {lesson.questions.length}</span>
                <span>{session.correct} correctas · {session.retries} intentos para repetir</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-100" aria-hidden>
                <div className="h-full rounded-full bg-teal-600" style={{ width: `${(session.correct / Math.max(1, lesson.questions.length)) * 100}%` }} />
              </div>
              <h3 className="text-xl font-extrabold leading-snug sm:text-3xl">{question.prompt}</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5" role="group" aria-label="Elige una respuesta">
                {question.options.map((choice) => (
                  <button key={choice} type="button" onClick={() => answer(choice)} className="min-h-16 rounded-2xl border-2 border-teal-300 bg-[#fbf7ee] px-3 py-4 text-2xl font-black text-stone-900 hover:bg-teal-50 focus-visible:outline-4 focus-visible:outline-teal-700">
                    {choice}
                  </button>
                ))}
              </div>
              <p aria-live="polite" className="min-h-7 text-sm font-semibold text-teal-800">{feedback || "Toca una respuesta. Si te equivocas, puedes intentarlo otra vez."}</p>
            </div>
          )}

          {session.stage === "cuaderno" && (
            <div className="mt-6 space-y-5">
              <p className="font-semibold text-teal-800"><CheckCircle2 className="mr-2 inline" size={20} /> Terminaste las preguntas guiadas.</p>
              <p>Ahora abre tu cuaderno auténtico y realiza las actividades de esta lección. La guía no marca ejercicios terminados por sí sola.</p>
              <a href={lesson.workbookPath} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-teal-800 px-5 py-3 font-bold text-white">
                <BookOpen size={19} /> Abrir cuaderno real
              </a>
              <div>
                <button type="button" onClick={verifyWorkbook} className="min-h-12 rounded-xl border border-teal-700 px-4 py-3 font-bold text-teal-900">
                  Revisar si la lección se completó
                </button>
              </div>
              <p aria-live="polite" className="text-sm font-semibold text-stone-700">{feedback}</p>
            </div>
          )}

          {session.stage === "cierre" && (
            <div className="mt-6 space-y-5">
              <p className="flex items-center gap-2 text-lg font-bold text-teal-800"><CheckCircle2 /> ¡Lección registrada como completada!</p>
              <p>El cuaderno confirmó la finalización. Puedes descargar el resumen de esta sesión o seleccionar otra lección.</p>
              <button type="button" onClick={() => selectLesson(Math.min(24, session.lesson + 1))} className="min-h-12 rounded-xl bg-teal-800 px-5 py-3 font-bold text-white">Siguiente lección</button>
            </div>
          )}
        </section>

        <section className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
          <p className="text-sm text-stone-600">
            {saveOk ? "Sesión guardada en este navegador. Se reanuda después de recargar." : "El navegador no permitió guardar. No cierres la página."}
            <span className="block text-xs">Sin nombres de alumnos, sin grabación, sin sincronización ni envío de informes.</span>
          </p>
          <button type="button" onClick={downloadReport} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 font-bold"><Download size={17} /> Descargar resumen local</button>
          <button type="button" onClick={() => selectLesson(session.lesson)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 font-bold"><RotateCcw size={17} /> Reiniciar guía</button>
        </section>

        <p className="flex items-center gap-2 text-xs font-semibold text-stone-600"><WifiOff size={16} /> Funciona sin servicios de IA. El acceso sin conexión tras cerrar el navegador requiere haber guardado antes los archivos necesarios.</p>
      </div>
    </main>
  );
}

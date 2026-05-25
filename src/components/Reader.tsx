import { Suspense, useCallback, useEffect, useMemo, useState, lazy } from "react";
import { motion } from "framer-motion";
import { ProgressBar } from "./ProgressBar";
import { LessonTimer, type TimerMode } from "./LessonTimer";
import { storage } from "@/lib/storage";
import { ThemeToggle } from "./ThemeToggle";
import { Downloads } from "./Downloads";
import { assetPath } from "@/lib/assets";

const PdfViewer = lazy(() => import("./PdfViewer").then((m) => ({ default: m.PdfViewer })));

const PDF_URL = assetPath("book/book.pdf");

const readerInitial = { opacity: 0, y: 8 };
const readerAnimate = { opacity: 1, y: 0 };
const readerTransition = { duration: 0.25 };

async function exists(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

export function Reader() {
  const [bookReady, setBookReady] = useState<boolean | null>(null);
  const [unit, setUnit] = useState<string>("Inicio");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [mode, setMode] = useState<TimerMode>(() =>
    storage.get<TimerMode>("reader.timer.mode", "up"),
  );
  const [minutes, setMinutes] = useState<number>(() =>
    storage.get<number>("reader.timer.minutes", 2),
  );
  const [autoAdvance, setAutoAdvance] = useState<boolean>(() =>
    storage.get<boolean>("reader.pdf.autoAdvance", false),
  );
  const [advanceSignal, setAdvanceSignal] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    exists(PDF_URL).then(setBookReady);
  }, []);

  useEffect(() => {
    storage.set("reader.format", "pdf");
  }, []);
  useEffect(() => {
    storage.set("reader.timer.mode", mode);
  }, [mode]);
  useEffect(() => {
    storage.set("reader.timer.minutes", minutes);
  }, [minutes]);
  useEffect(() => {
    storage.set("reader.pdf.autoAdvance", autoAdvance);
  }, [autoAdvance]);

  const handleElapsed = () => {
    if (autoAdvance) setAdvanceSignal((signal) => signal + 1);
  };

  const unitKey = useMemo(() => `pdf:${unit}`, [unit]);
  const handleUnitChange = useCallback((nextUnit: string) => {
    setUnit((current) => (current === nextUnit ? current : nextUnit));
  }, []);
  const handleProgress = useCallback((current: number, total: number) => {
    setProgress((previous) =>
      previous.current === current && previous.total === total ? previous : { current, total },
    );
  }, []);

  if (bookReady === null) {
    return (
      <div className="flex h-screen items-center justify-center text-foreground/60">Cargando…</div>
    );
  }
  if (!bookReady) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <h1 className="mb-2 text-2xl font-bold">No hay libro</h1>
        <p className="text-foreground/70">
          Coloca el PDF oficial en la ruta pública configurada y vuelve a ejecutar el build.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-2 backdrop-blur">
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="truncate font-bold">{unit}</div>
            <div className="flex items-center gap-2">
              <LessonTimer
                unitKey={unitKey}
                mode={mode}
                countdownMinutes={minutes}
                onElapsed={handleElapsed}
              />
              <ThemeToggle />
              <button
                onClick={() => setShowSettings((value) => !value)}
                className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
              >
                ⚙
              </button>
            </div>
          </div>
          <ProgressBar current={progress.current} total={progress.total} label="Páginas" />
          {showSettings && (
            <div className="flex flex-wrap items-center gap-3 rounded-md bg-muted px-3 py-2 text-sm">
              <label className="flex items-center gap-1">
                <input type="radio" checked={mode === "up"} onChange={() => setMode("up")} />{" "}
                Ascendente
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" checked={mode === "down"} onChange={() => setMode("down")} />{" "}
                Regresivo
              </label>
              {mode === "down" && (
                <label className="flex items-center gap-2">
                  Minutos:
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={minutes}
                    onChange={(event) =>
                      setMinutes(Math.max(1, Number.parseInt(event.target.value) || 1))
                    }
                    className="w-16 rounded border border-border bg-background px-2 py-1"
                  />
                </label>
              )}
              {mode === "down" && (
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(event) => setAutoAdvance(event.target.checked)}
                  />
                  Auto-avanzar página al terminar
                </label>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="relative h-[calc(100vh-180px)] min-h-[420px] overflow-hidden">
        <motion.div
          initial={readerInitial}
          animate={readerAnimate}
          transition={readerTransition}
          className="absolute inset-0"
        >
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-foreground/60">
                Cargando visor…
              </div>
            }
          >
            <div className="h-full overflow-auto">
              <PdfViewer
                url={PDF_URL}
                onUnitChange={handleUnitChange}
                onProgress={handleProgress}
                advanceSignal={advanceSignal}
              />
            </div>
          </Suspense>
        </motion.div>
      </main>
      <Downloads />
    </div>
  );
}

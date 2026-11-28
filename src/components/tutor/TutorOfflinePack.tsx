/**
 * TutorOfflinePack — teacher-side control for the tutor offline pack
 * (spec §18.1 + Milestone 12 modular per-lesson, avatar, Vosk & optional Tier-3 slots).
 *
 * Spanish strings preserved verbatim from spec:
 *   - "Preparar sin internet"     (download button)
 *   - "Listo sin internet"        (done status, shown with the pack version)
 *   - "Hay que preparar de nuevo" (cleared-storage state — never a broken screen)
 */
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Download, HardDrive, Trash2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  clearTutorPack,
  clearTutorPackSlot,
  downloadTutorPack,
  downloadTutorPackSlot,
  getTutorPackStatus,
  getTutorStorageSummary,
  listTutorPackSlots,
  recoverTutorPackStorage,
  TIER3_PACK_SLOTS,
  type TutorPackSlotId,
  type TutorPackSlotStatus,
  type TutorPackState,
  type TutorSlotDownloadProgress,
  type TutorStorageSummary,
} from "@/lib/tutor-offline-pack";

function formatMB(bytes: number): string {
  if (bytes <= 0) return "0.0 MB";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TutorOfflinePack() {
  const [pack, setPack] = useState<TutorPackState | null>(null);
  const [slots, setSlots] = useState<TutorPackSlotStatus[]>([]);
  const [storage, setStorage] = useState<TutorStorageSummary | null>(null);
  const [failed, setFailed] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [recoveryNotice, setRecoveryNotice] = useState<string | null>(null);
  const [busySlot, setBusySlot] = useState<TutorPackSlotId | null>(null);
  const [slotProgress, setSlotProgress] = useState<TutorSlotDownloadProgress | null>(null);
  const [expanded, setExpanded] = useState(false);

  const refreshState = useCallback(async () => {
    const [status, slotList, summary] = await Promise.all([
      getTutorPackStatus().catch(() => ({ state: "idle" as const })),
      listTutorPackSlots().catch(() => []),
      getTutorStorageSummary().catch(() => null),
    ]);
    setPack(status);
    setSlots(slotList);
    setStorage(summary);
  }, []);

  useEffect(() => {
    let alive = true;
    void Promise.all([
      getTutorPackStatus().catch(() => ({ state: "idle" as const })),
      listTutorPackSlots().catch(() => []),
      getTutorStorageSummary().catch(() => null),
    ]).then(([status, slotList, summary]) => {
      if (!alive) return;
      setPack(status);
      setSlots(slotList);
      setStorage(summary);
    });
    return () => {
      alive = false;
    };
  }, []);

  const prepare = useCallback(async () => {
    setFailed(false);
    setSlotError(null);
    setRecoveryNotice(null);
    setPack({
      state: "downloading",
      receivedBytes: 0,
      filesDone: 0,
      filesTotal: 0,
    });
    try {
      const result = await downloadTutorPack(setPack);
      setPack(result);
      await refreshState();
    } catch (error) {
      console.warn("Tutor preparation incomplete", error);
      setFailed(true);
      await refreshState();
    }
  }, [refreshState]);

  const handleDownloadSlot = useCallback(
    async (slotId: TutorPackSlotId) => {
      setSlotError(null);
      setRecoveryNotice(null);
      setBusySlot(slotId);
      setSlotProgress({
        slotId,
        state: "downloading",
        receivedBytes: 0,
        filesDone: 0,
        filesTotal: 0,
      });
      try {
        await downloadTutorPackSlot(slotId, setSlotProgress);
        await refreshState();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "No se pudo descargar este paquete.";
        setSlotError(message);
        await refreshState();
      } finally {
        setBusySlot(null);
        setSlotProgress(null);
      }
    },
    [refreshState],
  );

  const handleClearSlot = useCallback(
    async (slotId: TutorPackSlotId) => {
      setSlotError(null);
      setRecoveryNotice(null);
      setBusySlot(slotId);
      try {
        await clearTutorPackSlot(slotId);
        setRecoveryNotice("Paquete borrado. La memoria y el progreso del estudiante se conservan.");
        await refreshState();
      } catch (error) {
        setSlotError(error instanceof Error ? error.message : "No se pudo borrar el paquete.");
      } finally {
        setBusySlot(null);
      }
    },
    [refreshState],
  );

  const handleRecoverStorage = useCallback(async () => {
    setSlotError(null);
    const result = await recoverTutorPackStorage();
    setRecoveryNotice(
      result.reclaimedCaches > 0
        ? `Se liberaron ${result.reclaimedCaches} cachés obsoletos. La memoria del estudiante se conserva.`
        : "No había cachés obsoletos por liberar. La memoria del estudiante se conserva.",
    );
    await refreshState();
  }, [refreshState]);

  const handleClearAllPacks = useCallback(async () => {
    setSlotError(null);
    try {
      await clearTutorPack();
      setRecoveryNotice(
        "Paquetes sin internet borrados. La memoria y el progreso del estudiante se conservan.",
      );
      await refreshState();
    } catch (error) {
      setSlotError(error instanceof Error ? error.message : "No se pudieron borrar los paquetes.");
    }
  }, [refreshState]);

  const downloading = pack?.state === "downloading";
  const done = pack?.state === "done";
  const cleared = pack?.state === "cleared";

  const coreSlots = slots.filter(
    (s) => s.kind === "universal" || s.kind === "avatar" || s.kind === "vosk",
  );
  const lessonSlots = slots.filter((s) => s.kind === "lesson");
  const tier3Slots = slots.filter((s) => s.kind === "tier3");
  const readyLessonsCount = lessonSlots.filter((s) => s.state === "ready").length;

  return (
    <section
      data-tutor-offline-pack=""
      className="rounded-2xl border border-foreground/10 bg-background p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-foreground">
            <WifiOff className="h-5 w-5" aria-hidden="true" />
            Tutor — uso sin internet
          </h2>
          <p className="mt-1 max-w-prose text-sm text-foreground/70">
            Preparación verificada por versión y suma SHA-256 del material del tutor en este
            dispositivo. El progreso y la memoria del estudiante se guardan aparte.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          data-tutor-pack-toggle=""
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-foreground/15 px-3 py-2 text-xs font-bold text-foreground hover:bg-foreground/5"
        >
          <HardDrive className="h-4 w-4" aria-hidden="true" />
          <span>Paquetes por lección (1–24) y Nivel 3</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={prepare} disabled={downloading} aria-busy={downloading}>
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          Preparar sin internet
        </Button>

        <p role="status" aria-live="polite" className="text-sm font-bold text-foreground">
          {done && !failed && pack && `Listo sin internet — ${pack.version}`}
          {cleared && "Hay que preparar de nuevo"}
          {downloading &&
            pack &&
            `${formatMB(pack.receivedBytes)}${pack.filesTotal > 0 ? ` (${pack.filesDone}/${pack.filesTotal})` : ""}`}
          {failed && "Preparación incompleta. Puedes volver a intentarlo."}
        </p>
      </div>

      {storage ? (
        <p className="mt-3 text-xs text-foreground/70">
          Almacenamiento del tutor: <strong>{formatMB(storage.tutorPackBytes)}</strong>
          {readyLessonsCount > 0 ? ` · ${readyLessonsCount}/24 lecciones listas` : ""}
          {storage.orphanedCacheCount > 0
            ? ` · ${storage.orphanedCacheCount} cachés obsoletos recuperables`
            : ""}
        </p>
      ) : null}

      {slotError ? (
        <p role="alert" className="mt-2 text-xs font-bold text-rose-700">
          {slotError}
        </p>
      ) : null}

      {recoveryNotice ? (
        <p role="status" className="mt-2 text-xs font-bold text-emerald-700">
          {recoveryNotice}
        </p>
      ) : null}

      {expanded ? (
        <div className="mt-5 space-y-5 border-t border-foreground/10 pt-5">
          {/* Core modular packs: Universal, Avatar, Vosk */}
          <div>
            <h3 className="text-sm font-black text-foreground">
              Paquetes base (Nivel 1 y Nivel 2)
            </h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {coreSlots.map((slot) => {
                const isBusy = busySlot === slot.id;
                return (
                  <div
                    key={slot.id}
                    data-pack-slot={slot.id}
                    data-pack-state={slot.state}
                    className="flex flex-col justify-between gap-2 rounded-xl border border-foreground/10 p-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-foreground">{slot.label}</p>
                      <p className="mt-0.5 text-foreground/70">
                        {slot.state === "ready"
                          ? `Listo · ${formatMB(slot.downloadedBytes)}`
                          : slot.state === "cleared"
                            ? "Hay que preparar de nuevo"
                            : `~${formatMB(slot.estimatedBytes)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isBusy || downloading}
                        onClick={() => void handleDownloadSlot(slot.id)}
                        className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-foreground/15 px-2.5 py-1 font-bold hover:bg-foreground/5 disabled:opacity-50"
                      >
                        {slot.state === "ready" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                        ) : (
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        <span>
                          {isBusy && slotProgress?.slotId === slot.id
                            ? formatMB(slotProgress.receivedBytes)
                            : slot.state === "ready"
                              ? "Actualizar"
                              : "Descargar"}
                        </span>
                      </button>
                      {slot.state === "ready" ? (
                        <button
                          type="button"
                          disabled={isBusy || downloading}
                          onClick={() => void handleClearSlot(slot.id)}
                          aria-label={`Borrar ${slot.label}`}
                          className="inline-flex min-h-8 items-center rounded-lg border border-foreground/15 px-2 py-1 text-foreground/70 hover:bg-foreground/5 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Per-lesson packs (Lessons 1–24) */}
          <div>
            <h3 className="text-sm font-black text-foreground">
              Paquetes por lección (Lecciones 1–24 · carga diferida)
            </h3>
            <p className="mt-0.5 text-xs text-foreground/70">
              Cada lección carga únicamente su manifiesto de diálogo y grabaciones aprobadas.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {lessonSlots.map((slot) => {
                const isBusy = busySlot === slot.id;
                return (
                  <div
                    key={slot.id}
                    data-pack-slot={slot.id}
                    data-pack-state={slot.state}
                    className="flex flex-col justify-between gap-1.5 rounded-xl border border-foreground/10 p-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-foreground">L{slot.lesson}</span>
                      <span className="text-[11px] text-foreground/70">
                        {slot.state === "ready"
                          ? "Lista"
                          : slot.state === "cleared"
                            ? "Reinstalar"
                            : formatMB(slot.estimatedBytes)}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={isBusy || downloading}
                      onClick={() => void handleDownloadSlot(slot.id)}
                      className="min-h-8 rounded-lg border border-foreground/15 px-2 py-1 text-[11px] font-bold hover:bg-foreground/5 disabled:opacity-50"
                    >
                      {isBusy ? "Guardando..." : slot.state === "ready" ? "Verificada" : "Guardar"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Separate optional Tier-3 pack slots */}
          <div>
            <h3 className="text-sm font-black text-foreground">
              Nivel 3 — módulos opcionales (desactivados por defecto)
            </h3>
            <p className="mt-0.5 text-xs text-foreground/70">
              No se descargan modelos pesados sin verificar. El tutor de Nivel 1 y Nivel 2 funciona
              al 100% sin ningún módulo de Nivel 3.
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {tier3Slots.map((slot) => {
                const info = TIER3_PACK_SLOTS.find((item) => item.id === slot.id);
                return (
                  <div
                    key={slot.id}
                    data-pack-slot={slot.id}
                    data-pack-state={slot.state}
                    className="rounded-xl border border-dashed border-foreground/20 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-foreground">{slot.label}</span>
                      <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-bold text-foreground/80">
                        {slot.state === "unavailable"
                          ? "No incluido por defecto"
                          : "Opcional · 0 MB"}
                      </span>
                    </div>
                    {info ? <p className="mt-1 text-foreground/70">{info.description}</p> : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Storage recovery & learner-memory-safe clearing */}
          <div className="flex flex-wrap items-center gap-2 border-t border-foreground/10 pt-4">
            <button
              type="button"
              onClick={() => void handleRecoverStorage()}
              disabled={downloading || busySlot !== null}
              className="min-h-9 rounded-xl border border-foreground/15 px-3 py-1.5 text-xs font-bold hover:bg-foreground/5 disabled:opacity-50"
            >
              Recuperar espacio (cachés obsoletos)
            </button>
            <button
              type="button"
              onClick={() => void handleClearAllPacks()}
              disabled={downloading || busySlot !== null}
              className="min-h-9 rounded-xl border border-foreground/15 px-3 py-1.5 text-xs font-bold text-foreground/80 hover:bg-foreground/5 disabled:opacity-50"
            >
              Borrar paquetes descargados (conserva memoria)
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default TutorOfflinePack;

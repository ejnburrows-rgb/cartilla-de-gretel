/**
 * TutorOfflinePack — teacher-side control for the tutor offline pack
 * (spec §18.1, milestone 6).
 *
 * Spanish strings are the spec's exact owner-facing wording:
 *   - "Preparar sin internet"     (download button)
 *   - "Listo sin internet"        (done status, shown with the pack version)
 *   - "Hay que preparar de nuevo" (cleared-storage state — never a broken screen)
 *
 * Any wording NOT in the spec is marked DRAFT below and needs owner
 * approval before release.
 */
import { useCallback, useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  downloadTutorPack,
  getTutorPackStatus,
  type TutorPackState,
} from "@/lib/tutor-offline-pack";

function formatMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TutorOfflinePack() {
  const [pack, setPack] = useState<TutorPackState | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    getTutorPackStatus()
      .then((status) => {
        if (alive) setPack(status);
      })
      .catch(() => {
        if (alive) setPack({ state: "idle" });
      });
    return () => {
      alive = false;
    };
  }, []);

  const prepare = useCallback(async () => {
    setFailed(false);
    setPack({
      state: "downloading",
      receivedBytes: 0,
      filesDone: 0,
      filesTotal: 0,
    });
    try {
      setPack(await downloadTutorPack(setPack));
    } catch {
      setFailed(true);
      // Fall back to whatever is actually on disk — never a broken screen.
      setPack(await getTutorPackStatus().catch(() => ({ state: "idle" as const })));
    }
  }, []);

  const downloading = pack?.state === "downloading";
  const done = pack?.state === "done";
  const cleared = pack?.state === "cleared";

  return (
    <section className="rounded-2xl border border-foreground/10 bg-background p-6">
      <h2 className="flex items-center gap-2 text-lg font-black text-foreground">
        <WifiOff className="h-5 w-5" aria-hidden="true" />
        Tutor — uso sin internet
      </h2>

      <p className="mt-2 max-w-prose text-sm text-foreground/70">
        {/* DRAFT wording (owner to approve): the explanatory sentence below. */}
        Preparación única del material del tutor (lecciones 1–3) en este dispositivo.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={prepare} disabled={downloading} aria-busy={downloading}>
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          Preparar sin internet
        </Button>

        <p role="status" aria-live="polite" className="text-sm font-bold text-foreground">
          {done && pack && `Listo sin internet — ${pack.version}`}
          {cleared && "Hay que preparar de nuevo"}
          {downloading && pack && formatMB(pack.state === "downloading" ? pack.receivedBytes : 0)}
          {failed && "Hay que preparar de nuevo"}
        </p>
      </div>
    </section>
  );
}

export default TutorOfflinePack;

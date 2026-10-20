import { useEffect, useState, type ReactNode } from "react";
import type { GameContent } from "@/lib/games/gameContent";
import { playInstruction, stopGameAudio } from "@/lib/games/wordAudio";

export function RecordedGameFrame({
  content,
  children,
}: {
  content: GameContent;
  children: ReactNode;
}) {
  const [notice, setNotice] = useState("");
  useEffect(() => {
    setNotice("");
    return stopGameAudio;
  }, [content.id]);
  useEffect(() => {
    if (content.type === "payaso-chano") return;
    const onStatus = (event: Event) => {
      const detail = (event as CustomEvent<{ status: string; key: string; source?: string }>)
        .detail;
      if (!detail || detail.source !== "game") return;
      const label = detail.key ? ` para «${detail.key}»` : "";
      setNotice(
        detail.status === "missing-recording"
          ? `Audio pendiente${label}. Puedes continuar con la actividad escrita.`
          : detail.status === "failed"
            ? `No se pudo reproducir el audio${label}. Inténtalo de nuevo o continúa con la actividad escrita.`
            : detail.status === "muted"
              ? "Audio silenciado. Puedes continuar con la actividad escrita."
              : "",
      );
    };
    window.addEventListener("cartilla:recorded-speech-status", onStatus);
    return () => window.removeEventListener("cartilla:recorded-speech-status", onStatus);
  }, [content.id, content.type]);
  return (
    <div
      data-recorded-game={content.id}
      className={
        content.type === "payaso-chano"
          ? "flex min-h-0 flex-1 flex-col gap-2"
          : "relative flex min-h-0 flex-1 flex-col gap-2"
      }
      onClickCapture={(event) => {
        // The excluded Chano route keeps its exact original capture behavior.
        if (content.type !== "payaso-chano") return;
        const target = event.target instanceof Element ? event.target : null;
        const button = target?.closest("button");
        const match = button?.getAttribute("aria-label")?.match(/^Escuchar instrucción (\d+)$/);
        if (match) {
          event.stopPropagation();
          playInstruction(
            content.instructionAudioUrls?.[Number(match[1]) - 1],
            content.instructions[Number(match[1]) - 1],
          );
        }
      }}
    >
      {children}
      {notice && (
        <p
          role="status"
          className="pointer-events-none absolute bottom-2 left-2 right-2 z-20 rounded-xl border bg-white p-2 text-sm shadow"
        >
          {notice}
        </p>
      )}
    </div>
  );
}

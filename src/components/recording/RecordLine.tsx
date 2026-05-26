import { useMemo, useState } from "react";
import { Mic, Square, RotateCcw, Send } from "lucide-react";
import { useAudioRecorder } from "@/lib/audio-recorder";
import { enqueue } from "@/lib/audio-clone-jobs";
import { getLang, pickByLang } from "@/lib/locale";

type RecordLineProps = {
  lessonId: string;
  lineId: string;
  text: string;
};

export function RecordLine({ lessonId, lineId, text }: RecordLineProps) {
  const recorder = useAudioRecorder();
  const [submitted, setSubmitted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const lang = getLang();
  const labels = useMemo(
    () => ({
      record: pickByLang("Grabar", "Record", lang),
      stop: pickByLang("Detener", "Stop", lang),
      rerecord: pickByLang("Volver a grabar", "Re-record", lang),
      submit: pickByLang("Enviar a cola", "Submit to queue", lang),
      preview: pickByLang("Escuchar grabacion", "Play recording", lang),
      queued: pickByLang("En cola", "Queued", lang),
      denied: pickByLang("Permiso de microfono denegado.", "Microphone permission denied.", lang),
      unsupported: pickByLang("Este navegador no permite grabar audio.", "This browser cannot record audio.", lang),
    }),
    [lang],
  );

  const start = async () => {
    setSubmitted(false);
    setPreviewUrl(null);
    await recorder.start();
  };

  const stop = async () => {
    const blob = await recorder.stop();
    if (blob) setPreviewUrl(URL.createObjectURL(blob));
  };

  const submit = async () => {
    if (!recorder.lastBlob) return;
    await enqueue(recorder.lastBlob, lessonId, lineId);
    setSubmitted(true);
  };

  const errorText = recorder.error === "denied" ? labels.denied : recorder.error === "unsupported" ? labels.unsupported : null;

  return (
    <article className="rounded-2xl border border-amber-900/15 bg-white p-4 shadow-sm">
      <p className="text-lg font-black text-[#3A281E]">{text}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!recorder.isRecording ? (
          <button
            type="button"
            onClick={start}
            className="inline-flex h-16 min-w-16 items-center justify-center gap-2 rounded-full bg-rose-700 px-5 text-sm font-black text-white shadow-lg"
          >
            <Mic className="h-5 w-5" />
            {labels.record}
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="inline-flex h-16 min-w-16 items-center justify-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-black text-white shadow-lg"
          >
            <Square className="h-5 w-5" />
            {labels.stop}
          </button>
        )}
        <div className="h-3 w-32 overflow-hidden rounded-full bg-amber-100" aria-label="Nivel de audio">
          <div className="h-full bg-amber-700 transition-all" style={{ width: `${Math.round(recorder.level * 100)}%` }} />
        </div>
        {previewUrl ? <audio aria-label={labels.preview} controls src={previewUrl} className="max-w-full" /> : null}
        {recorder.lastBlob ? (
          <button type="button" onClick={start} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold">
            <RotateCcw className="h-4 w-4" />
            {labels.rerecord}
          </button>
        ) : null}
        {recorder.lastBlob ? (
          <button type="button" onClick={submit} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-black text-white">
            <Send className="h-4 w-4" />
            {submitted ? labels.queued : labels.submit}
          </button>
        ) : null}
      </div>
      {errorText ? <p className="mt-3 text-sm font-bold text-rose-700">{errorText}</p> : null}
    </article>
  );
}

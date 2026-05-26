import "../../styles/a11y.css";
import { useEffect, useMemo, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { configure, getLastUtterance, replayLastUtterance } from "@/lib/speak";

type AudioSettings = {
  rate: number;
  voiceURI: string | null;
};

const AUDIO_KEY = "cartilla:audio:settings";
const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  rate: 1,
  voiceURI: null,
};

function readAudioSettings(): AudioSettings {
  if (typeof window === "undefined") return DEFAULT_AUDIO_SETTINGS;
  try {
    const raw = localStorage.getItem(AUDIO_KEY);
    return raw ? (JSON.parse(raw) as AudioSettings) : DEFAULT_AUDIO_SETTINGS;
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

export function AudioControls() {
  const [settings, setSettings] = useState<AudioSettings>(readAudioSettings);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const selectedVoice = useMemo(
    () => voices.find((voice) => voice.voiceURI === settings.voiceURI) ?? null,
    [settings.voiceURI, voices],
  );

  useEffect(() => {
    configure(settings);
    localStorage.setItem(AUDIO_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const spanishVoices = window.speechSynthesis
        .getVoices()
        .filter((voice) => voice.lang.toLowerCase().startsWith("es"));
      setVoices(spanishVoices);
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  return (
    <div className="cartilla-floating-control fixed cartilla-floating-stack z-50 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-2 rounded-2xl border-2 border-amber-900/20 bg-white/95 p-2 text-[#3A281E] shadow-2xl backdrop-blur">
      <button
        type="button"
        aria-label="Reproducir o repetir la ultima lectura"
        onClick={replayLastUtterance}
        className="cartilla-focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-amber-800 px-3 py-2 text-sm font-black text-white"
      >
        {getLastUtterance() ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        Audio
      </button>
      <label className="flex items-center gap-2 text-xs font-bold" aria-label="Velocidad de lectura">
        <span>Vel.</span>
        <input
          aria-label="Velocidad de lectura"
          type="range"
          min="0.75"
          max="1.25"
          step="0.25"
          value={settings.rate}
          onChange={(event) => setSettings((current) => ({ ...current, rate: Number(event.currentTarget.value) }))}
          className="cartilla-focus-ring w-20 accent-amber-800"
        />
        <span>{settings.rate.toFixed(2)}x</span>
      </label>
      <select
        aria-label="Voz en espanol"
        value={selectedVoice?.voiceURI ?? ""}
        onChange={(event) => setSettings((current) => ({ ...current, voiceURI: event.currentTarget.value || null }))}
        className="cartilla-focus-ring max-w-36 rounded-xl border border-amber-900/20 bg-white px-2 py-2 text-xs font-bold"
      >
        <option value="">Voz espanola</option>
        {voices.map((voice) => (
          <option key={voice.voiceURI} value={voice.voiceURI}>
            {voice.name}
          </option>
        ))}
      </select>
    </div>
  );
}

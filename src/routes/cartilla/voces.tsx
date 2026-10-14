import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  speakAsGretel,
  cancelGretelSpeech,
  setGretelVoiceProviderConfig,
  getGretelVoiceProviderConfig,
  getAvailableGretelVoices,
} from "@/lib/gretel-voice";

export const Route = createFileRoute("/cartilla/voces")({
  component: VoiceAudition,
  head: () => ({ meta: [{ title: "Audición de voces — La Cartilla de Gretel" }] }),
});

// Real printed instruction, Lección 1, page 1 (already verb-swapped
// per canon: "Circula" -> "Presiona") — never invented text, so every
// candidate reads exactly what a student will actually hear.
const AUDITION_LINE =
  "Presiona los dibujos de las palabras en cada línea horizontal que comienzan con el mismo sonido.";

const NEUTRAL_LATAM_LANGS = new Set(["es-mx", "es-us", "es-419"]);

function isNeutralLatAm(lang: string): boolean {
  return NEUTRAL_LATAM_LANGS.has(lang.toLowerCase());
}

const FEMALE_NAME_HINTS =
  /(sabina|dalia|elvira|ximena|helena|paulina|mónica|monica|lucia|lucía|laura|sara|camila|valentina|isabela|marisol|conchita|penélope|penelope|lupe|karen|carla|renata|victoria|antonia|yolanda|miriam|marina|candela|female|mujer|niña)/i;
const MALE_NAME_HINTS = /(diego|jorge|carlos|enrique|miguel|pablo|javier|juan(?!ita)|male|hombre)/i;

interface Candidate {
  key: string;
  label: string;
  description: string;
  voice: SpeechSynthesisVoice;
  pitch: number;
  rate: number;
}

function buildCandidates(voices: SpeechSynthesisVoice[]): Candidate[] {
  const esVoices = voices.filter((v) => (v.lang || "").toLowerCase().startsWith("es"));

  const scored = esVoices
    .map((v) => {
      const lang = (v.lang || "").toLowerCase();
      let score = isNeutralLatAm(lang) ? 1000 : 0;
      if (FEMALE_NAME_HINTS.test(v.name)) score += 200;
      if (MALE_NAME_HINTS.test(v.name)) score -= 500;
      if (/natural|neural|online|premium|enhanced/i.test(v.name)) score += 50;
      return { v, score };
    })
    .sort((a, b) => b.score - a.score);

  const preferred = scored.filter((s) => s.score >= -100);
  const pool = (preferred.length ? preferred : scored).map((s) => s.v);

  const seen = new Set<string>();
  const baseVoices: SpeechSynthesisVoice[] = [];
  for (const v of pool) {
    const key = v.voiceURI || v.name;
    if (seen.has(key)) continue;
    seen.add(key);
    baseVoices.push(v);
    if (baseVoices.length >= 3) break;
  }

  const candidates: Candidate[] = [];
  let n = 1;
  const localeLabel = (v: SpeechSynthesisVoice) =>
    isNeutralLatAm(v.lang) ? v.lang : `${v.lang} (no es neutro LatAm)`;

  baseVoices.forEach((v, i) => {
    candidates.push({
      key: `${v.voiceURI || v.name}-natural`,
      label: `Voz ${n}`,
      description: `${v.name} · ${localeLabel(v)} · tono natural`,
      voice: v,
      pitch: 1.05,
      rate: 0.92,
    });
    n++;
    if (i < 2 && candidates.length < 5) {
      candidates.push({
        key: `${v.voiceURI || v.name}-young`,
        label: `Voz ${n}`,
        description: `${v.name} · ${localeLabel(v)} · más aguda y ligera (afinada para sonar más joven)`,
        voice: v,
        pitch: 1.55,
        rate: 1.02,
      });
      n++;
    }
  });

  return candidates.slice(0, 5);
}

function VoiceAudition() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ready, setReady] = useState(false);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newText, setNewText] = useState("Mañana el pingüino leerá una palabra nueva.");
  const originalProvider = useMemo(() => getGretelVoiceProviderConfig(), []);
  const customAvailable = originalProvider.type === "custom" && Boolean(originalProvider.speakFn);
  useEffect(() => {
    const onCustomVoiceError = () => {
      setPlayingKey(null);
      setError("El motor de voz de Gretel no está disponible. No se sustituyó por una voz del navegador.");
    };
    window.addEventListener("gretel:speak_error", onCustomVoiceError);
    return () => window.removeEventListener("gretel:speak_error", onCustomVoiceError);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setReady(true);
      return;
    }
    const load = () => {
      const list = getAvailableGretelVoices();
      if (list.length) {
        setVoices(list);
        setReady(true);
      }
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    const timeout = setTimeout(() => {
      load();
      setReady(true);
    }, 1500);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      clearTimeout(timeout);
      cancelGretelSpeech();
      // The audition page must not silently erase the workbook custom voice.
      setGretelVoiceProviderConfig(originalProvider);
    };
  }, [originalProvider]);

  const candidates = useMemo(() => buildCandidates(voices), [voices]);

  const playCustom = async () => {
    setError(null);
    cancelGretelSpeech();
    setGretelVoiceProviderConfig(originalProvider);
    setPlayingKey("gretel-custom");
    try {
      await speakAsGretel(newText, { onEnd: () => setPlayingKey(null) });
    } catch {
      setError("El motor de voz personalizado no respondió.");
      setPlayingKey(null);
    }
  };

  const play = async (c: Candidate) => {
    setError(null);
    cancelGretelSpeech();
    setPlayingKey(c.key);

    setGretelVoiceProviderConfig({
      type: "browser-tts",
      name: `Audition (${c.label} - ${c.voice.name})`,
      primaryVoiceName: c.voice.name,
      pitch: c.pitch,
      rate: c.rate,
    });

    try {
      await speakAsGretel(AUDITION_LINE, {
        onStart: () => {
          setPlayingKey(c.key);
        },
        onEnd: () => {
          setPlayingKey(null);
        },
      });
    } catch {
      setPlayingKey(null);
      setError("Esta voz no pudo reproducirse en este navegador.");
    }
  };

  return (
    <main className="min-h-screen w-full bg-stone-100 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-stone-800 mb-2">Audición de voces de Gretel</h1>
        <p className="text-stone-500 font-medium mb-8">
          Escucha la voz personalizada de Gretel cuando esté disponible. Las voces del navegador
          aparecen únicamente como alternativas de comparación, no como reemplazo automático.
        </p>

        <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-8 text-stone-600 text-sm font-medium italic">
          "{AUDITION_LINE}"
        </div>

        {customAvailable && (
          <section className="rounded-2xl border-2 border-primary/40 bg-white p-5 mb-8 space-y-3">
            <h2 className="font-black text-stone-800">Gretel — voz personalizada</h2>
            <p className="text-sm text-stone-500">Escribe una oración nueva para comprobar la síntesis real.</p>
            <input
              aria-label="Oración nueva para Gretel"
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-stone-800"
              value={newText}
              maxLength={320}
              onChange={(event) => setNewText(event.target.value)}
            />
            <button
              className="rounded-xl bg-primary px-5 py-3 font-bold text-white disabled:opacity-50"
              disabled={!newText.trim() || playingKey === "gretel-custom"}
              onClick={() => void playCustom()}
            >
              {playingKey === "gretel-custom" ? "Reproduciendo…" : "Escuchar con Gretel"}
            </button>
          </section>
        )}

        {customAvailable ? null : !ready ? (
          <p className="text-stone-400 font-medium">
            Cargando voces disponibles en este navegador…
          </p>
        ) : candidates.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900">
            <p className="font-black mb-2">
              Este navegador no tiene ninguna voz en español instalada.
            </p>
            <p className="text-sm">
              Prueba a abrir esta misma página en Chrome o Edge, o revisa la sección de voces del
              sistema operativo. Si el problema persiste, ver la nota honesta más abajo sobre las
              opciones de pago.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {candidates.map((c) => (
              <button
                key={c.key}
                onClick={() => void play(c)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 rounded-2xl border-2 border-stone-200 bg-white hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <div>
                  <div className="font-black text-stone-800">{c.label}</div>
                  <div className="text-sm text-stone-500 font-medium">{c.description}</div>
                </div>
                <span className="shrink-0 font-black text-primary">
                  {playingKey === c.key ? "▶ reproduciendo…" : "▶ escuchar"}
                </span>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 font-bold text-sm text-center py-3 px-4 rounded-2xl border-2 border-red-100 mb-8">
            {error}
          </div>
        )}

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-sm text-stone-600 space-y-3 mb-8">
          <div className="flex items-center justify-between">
            <p className="font-black text-stone-800">Estado de preparación técnica</p>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
              {customAvailable ? "Motor Gretel configurado — audio real pendiente de verificación" : "Motor Gretel no configurado — sin prueba de voz personalizada"}
            </span>
          </div>
          <p className="text-xs text-stone-500">
            La lectura del cuaderno, las vocales, las instrucciones, las palabras y las reacciones tienen rutas hacia el motor personalizado. Esto no significa que exista un modelo entrenado ni que la voz ya haya sido aprobada. Una prueba con audio nuevo, en la voz de Gretel, sigue siendo obligatoria.
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-sm text-stone-600 space-y-2">
          <p className="font-black text-stone-800">Una sola voz de Gretel</p>
          <p>
            El propietario ya entregó una grabación de más de 32 minutos.
            Las voces genéricas de este navegador NO son la voz personalizada de Gretel.
            No se aceptan grabaciones ensambladas como prueba de texto-a-voz.
          </p>
          <p>
            Para completar esta función se debe generar y escuchar una frase nueva,
            demostrar que conserva el timbre y la pronunciación de Gretel, y comprobar
            las actividades del cuaderno con el servicio real.
          </p>
        </div>
      </div>
    </main>
  );
}

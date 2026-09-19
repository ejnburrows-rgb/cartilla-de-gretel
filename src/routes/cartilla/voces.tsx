import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

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

// Names browser/OS Spanish voice packs commonly ship as female (used only
// to rank candidates for this audition — a name is not proof of anything,
// just the same kind of heuristic every device voice-picker uses).
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

  // Prefer clearly-not-male voices, but never end up with zero candidates
  // just because every voice on this device happens to score low.
  const preferred = scored.filter((s) => s.score >= -100);
  const pool = (preferred.length ? preferred : scored).map((s) => s.v);

  // De-dupe by voiceURI/name so the same underlying voice isn't listed twice.
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
    // Natural (production-matching) version of every base voice.
    candidates.push({
      key: `${v.voiceURI}-natural`,
      label: `Voz ${n}`,
      description: `${v.name} · ${localeLabel(v)} · tono natural`,
      voice: v,
      pitch: 1.05,
      rate: 0.92,
    });
    n++;
    // Tuned-younger version of the top 2 base voices only, to stay within 5 total.
    if (i < 2 && candidates.length < 5) {
      candidates.push({
        key: `${v.voiceURI}-young`,
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

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setReady(true);
      return;
    }
    const synth = window.speechSynthesis;
    const load = () => {
      const list = synth.getVoices();
      if (list.length) {
        setVoices(list);
        setReady(true);
      }
    };
    load();
    synth.addEventListener("voiceschanged", load);
    const timeout = setTimeout(() => setReady(true), 1500);
    return () => {
      synth.removeEventListener("voiceschanged", load);
      clearTimeout(timeout);
    };
  }, []);

  const candidates = useMemo(() => buildCandidates(voices), [voices]);

  const play = (c: Candidate) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setError(null);
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(AUDITION_LINE);
    u.voice = c.voice;
    u.lang = c.voice.lang;
    u.pitch = c.pitch;
    u.rate = c.rate;
    u.volume = 1;
    setPlayingKey(c.key);
    u.onend = () => setPlayingKey(null);
    u.onerror = () => {
      setPlayingKey(null);
      setError("Esta voz no pudo reproducirse en este navegador.");
    };
    synth.speak(u);
  };

  return (
    <main className="min-h-screen w-full bg-stone-100 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-stone-800 mb-2">Audición de voces de Gretel</h1>
        <p className="text-stone-500 font-medium mb-8">
          Cada botón lee la misma línea real del libro (Lección 1) con una voz distinta. Toca cada
          una, escucha, y responde con el número que prefieras — esa será la voz de Gretel en toda
          la app.
        </p>

        <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-8 text-stone-600 text-sm font-medium italic">
          "{AUDITION_LINE}"
        </div>

        {!ready ? (
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
                onClick={() => play(c)}
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

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-sm text-stone-600 space-y-2">
          <p className="font-black text-stone-800">Honestidad, no promesas:</p>
          <p>
            Las voces gratuitas incorporadas del navegador (arriba) son voces de mujer adulta —
            ninguna suena genuinamente como una niña pequeña, ni afinando el tono. Es un límite real
            de lo que el navegador ofrece gratis, no algo que se pueda arreglar con más código.
          </p>
          <p>
            Lo que SÍ sonaría como una niña de verdad: (1) un servicio de voz pagado con voces
            infantiles reales — por ejemplo ElevenLabs (voces por suscripción, desde unos $5–22
            USD/mes) o Google Cloud / Azure Neural TTS (se cobra por caracteres leídos, típicamente
            unos $4–16 USD por cada millón de caracteres, que para esta app es un costo pequeño pero
            real cada mes); o (2) grabar la voz real de una niña y usar esos audios grabados en vez
            de texto-a-voz. Ninguna de las dos opciones se ha contratado ni pagado — es tu decisión,
            no la mía.
          </p>
        </div>
      </div>
    </main>
  );
}

/** Index of already RECORDED MP3s, from the owner-provided 67-clip archive.
 * The repo must contain the matching files in public/audio/gretel/clips/.
 * Nothing here synthesizes text or pretends to narrate unrecorded lessons.
 */
import { onGretelSpeak, type GretelSpeakDetail } from "./gretel-speak";
import { playGretelRecordingQueue } from "./gretel-recorded-playback";
import { isGretelVoiceMuted } from "./gretel-voice";
import existingCatalog from "@/data/gretel-existing-audio-catalog.json";

const EXTRA_CLIP_IDS = [
  "01_oh","02_viste","03_sorpresa","04_hmm","05_que_crees",
  "06_que_interesante","07_descubrirlo","08_gato","09_despues",
  "10_atencion","11_favorita","12_toca_letra","13_busca_dibujo",
  "14_microfono","15_te_escucho","16_voz_alta","17_lapiz",
  "18_terminaste","19_siguiente",
] as const;
export const EXISTING_GRETEL_CLIP_IDS = [
  ...Array.from({length:48},(_,i)=>"gretel_"+String(i+1).padStart(2,"0")),
  ...EXTRA_CLIP_IDS,
];
const KNOWN = new Set(EXISTING_GRETEL_CLIP_IDS);
/** The rejected music/stutter archive remains preserved, never selected for playback. */
const PLAYABLE = new Set(existingCatalog.assets.filter(asset => asset.playback_status === "approved_clean").map(asset => asset.id));

export function recordedClipUrl(id: string): string | null {
  return KNOWN.has(id) && PLAYABLE.has(id) ? "/audio/gretel/clips/rec_"+id+".mp3" : null;
}

export const RECORDED_OUTCOME_CLIP: Record<GretelSpeakDetail["outcome"],string> = {
  correct:"gretel_23",
  close:"gretel_29",
  "try-again":"gretel_30",
  streak:"gretel_27",
  "lesson-complete":"gretel_41",
  start:"gretel_05",
};

/** Contextual instructions, NOT a claim that these are verbatim book pages. */
export function recordedIntroClipIds(lesson:number): string[] {
  if(!Number.isInteger(lesson)||lesson<1||lesson>24)return [];
  if(lesson===1)return ["gretel_01","gretel_08"];
  if(lesson>=2&&lesson<=6)return ["gretel_10"];
  if(lesson===7)return ["gretel_11","gretel_12","gretel_13"];
  if(lesson===8)return ["gretel_18"];
  return ["gretel_35"];
}
export function recordedPracticeClipIds(lesson:number): string[] {
  if(!Number.isInteger(lesson)||lesson<1||lesson>24)return [];
  return lesson<=6?["gretel_10","gretel_36"]:["gretel_36","gretel_37","gretel_40"];
}

/** Whole-phrase stitching: each listed clip is already a complete, real recording.
 * Do not splice syllable fragments or claim a sequence is verbatim workbook narration.
 * Source phrases are documented in gretel-existing-audio-catalog.json.
 */
export const RECORDED_OUTCOME_SEQUENCE: Record<GretelSpeakDetail["outcome"], readonly string[]> = {
  correct: ["gretel_23", "gretel_24"],
  close: ["gretel_29", "gretel_34"],
  "try-again": ["gretel_29", "gretel_34"],
  streak: ["gretel_27", "gretel_28"],
  "lesson-complete": ["gretel_41", "gretel_25"],
  start: ["gretel_05"],
};

export function recordedOutcomeUrls(outcome:GretelSpeakDetail["outcome"]):string[] {
  return RECORDED_OUTCOME_SEQUENCE[outcome]
    .map(recordedClipUrl)
    .filter((url):url is string => url !== null);
}

export function recordedOutcomeUrl(outcome:GretelSpeakDetail["outcome"]):string|null {
  return recordedClipUrl(RECORDED_OUTCOME_CLIP[outcome]);
}

let installed=false;
/** Wire EXISTING Gretel activity feedback to the single speech owner.
 * Check assets first. Missing files produce silence, never a different voice.
 */
export function installExistingGretelRecordedFeedback():()=>void {
  if(installed)return ()=>{};
  installed=true;
  const ready=new Set<string>();
  const urls=[...new Set(Object.values(RECORDED_OUTCOME_SEQUENCE).flat().map(recordedClipUrl).filter((x):x is string=>!!x))];
  let disposed=false;
  void Promise.allSettled(urls.map(async url=>{
    try{
      const response=await fetch(url,{method:"HEAD"});
      const contentType=response.headers.get("content-type")??"";
      if(response.ok&&/^(audio\/|application\/octet-stream)/i.test(contentType)&&!disposed)ready.add(url);
    }catch{ /* Missing asset: no playback or substitute voice. */ }
  }));
  const remove=onGretelSpeak(detail=>{
    if(isGretelVoiceMuted())return;
    const sequence=recordedOutcomeUrls(detail.outcome);
    // Never speak a partial stitched sentence if a required original MP3 is unavailable.
    if(sequence.length && sequence.every(url=>ready.has(url)))void playGretelRecordingQueue(sequence);
  });
  return ()=>{disposed=true;ready.clear();remove();installed=false;};
}

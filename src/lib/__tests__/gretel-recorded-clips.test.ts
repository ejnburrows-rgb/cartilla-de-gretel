import { describe, expect, it } from "vitest";
import { pageRecordingUrls, lessonIntroRecordingUrls, exactRecordedPhraseUrls, type GretelRecording } from "../gretel-recorded-clips";
describe("Gretel local recording selection", () => {
  const clips: GretelRecording[] = [
    {clip_id:"GR0041",text:"Circula",page:"1",lesson:"1",category:"03_workbook_instrucciones_verbatim",status:"approved",audio_verified:true,urls:["/audio/gretel/clips/GR0041-0123456789ab-01.mp3"]},
    {clip_id:"GR0042",text:"Guide",page:"1",lesson:"1",category:"03_workbook_guia_propuesta",urls:["/audio/gretel/clips/GR0042-0123456789ab-01.mp3"]},
    {clip_id:"GR0043",text:"Different",page:"2",lesson:"1",category:"03_workbook_instrucciones_verbatim",urls:["/audio/gretel/clips/GR0043-0123456789ab-01.mp3"]},
    {clip_id:"GR0044",text:"Remote",page:"1",lesson:"1",category:"03_workbook_instrucciones_verbatim",urls:["https://example.org/track.mp3"]},
  ];
  it("matches only the exact whole recorded phrase, never an invented word splice", () => {
    expect(exactRecordedPhraseUrls("¡Sí! ¡Lo hiciste muy bien!")).toEqual([
      "/audio/gretel/clips/rec_gretel_23.mp3",
    ]);
    expect(exactRecordedPhraseUrls("sí lo hiciste muy bien")).toEqual([
      "/audio/gretel/clips/rec_gretel_23.mp3",
    ]);
    expect(exactRecordedPhraseUrls("¡Hola! ¡Qué alegría verte otra vez!")).toEqual([
      "/audio/gretel/clips/rec_gretel_01.mp3",
    ]);
    expect(exactRecordedPhraseUrls("ma")).toEqual([]);
    expect(exactRecordedPhraseUrls("¡Terminaste la lección!")).toEqual([]);
  });

  it("uses only source-book local MP3 audio", () => {
    expect(pageRecordingUrls(1,clips)).toEqual(["/audio/gretel/clips/GR0041-0123456789ab-01.mp3"]);
  });
  it("hides pending voice candidates even with a well-formed MP3 URL", () => {
    const pending: GretelRecording[] = [{...clips[0]!, status:"needs_owner_review"}];
    expect(pageRecordingUrls(1,pending)).toEqual([]);
    expect(pageRecordingUrls(1,[{...clips[0]!,audio_verified:false}])).toEqual([]);
  });
  it("blocks missing-source pages", () => {
    expect(pageRecordingUrls(86,clips)).toEqual([]);
    expect(pageRecordingUrls(87,clips)).toEqual([]);
  });
  it("does not advertise missing audio", () => {
    expect(pageRecordingUrls(8,clips)).toEqual([]);
  });
  it("includes owner-verified page vocabulary that was previously excluded", () => {
    const word: GretelRecording = {
      clip_id:"GR0726",text:"abrigo",page:"1",lesson:"1",
      category:"08_vocabulario_ejercicios",status:"approved",audio_verified:true,
      urls:["/audio/gretel/clips/gretel_gr0726.mp3"],
    };
    expect(pageRecordingUrls(1,[word])).toEqual(["/audio/gretel/clips/gretel_gr0726.mp3"]);
    expect(pageRecordingUrls(2,[word])).toEqual([]);
  });

  it("attaches an approved introduction only to its exact lesson", () => {
    const intro: GretelRecording = {
      clip_id:"GR0017",text:"Hoy vamos a conocer las cinco vocales.",
      page:"",lesson:"1",category:"02_entradas_24_lecciones",
      status:"approved",audio_verified:true,
      urls:["/audio/gretel/clips/gretel_gr0017.mp3"],
    };
    expect(lessonIntroRecordingUrls(1,[intro])).toEqual(["/audio/gretel/clips/gretel_gr0017.mp3"]);
    expect(lessonIntroRecordingUrls(2,[intro])).toEqual([]);
    expect(pageRecordingUrls(1,[intro])).toEqual([]);
    expect(lessonIntroRecordingUrls(1,[{...intro,status:"unverified"}])).toEqual([]);
  });

});

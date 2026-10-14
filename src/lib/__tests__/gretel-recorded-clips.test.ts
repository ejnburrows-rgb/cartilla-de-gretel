import { describe, expect, it } from "vitest";
import { pageRecordingUrls, type GretelRecording } from "../gretel-recorded-clips";
describe("Gretel local recording selection", () => {
  const clips: GretelRecording[] = [
    {clip_id:"GR0041",text:"Circula",page:"1",lesson:"1",category:"03_workbook_instrucciones_verbatim",urls:["/audio/gretel/clips/GR0041-0123456789ab-01.mp3"]},
    {clip_id:"GR0042",text:"Guide",page:"1",lesson:"1",category:"03_workbook_guia_propuesta",urls:["/audio/gretel/clips/GR0042-0123456789ab-01.mp3"]},
    {clip_id:"GR0043",text:"Different",page:"2",lesson:"1",category:"03_workbook_instrucciones_verbatim",urls:["/audio/gretel/clips/GR0043-0123456789ab-01.mp3"]},
    {clip_id:"GR0044",text:"Remote",page:"1",lesson:"1",category:"03_workbook_instrucciones_verbatim",urls:["https://example.org/track.mp3"]},
  ];
  it("uses only source-book local MP3 audio", () => {
    expect(pageRecordingUrls(1,clips)).toEqual(["/audio/gretel/clips/GR0041-0123456789ab-01.mp3"]);
  });
  it("blocks missing-source pages", () => {
    expect(pageRecordingUrls(86,clips)).toEqual([]);
    expect(pageRecordingUrls(87,clips)).toEqual([]);
  });
  it("does not advertise missing audio", () => {
    expect(pageRecordingUrls(8,clips)).toEqual([]);
  });
});

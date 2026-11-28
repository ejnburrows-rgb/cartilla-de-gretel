import models from "../content/tutor-picture-models.json";

const bySource = new Map(Object.entries(models).map(([src, model]) => [
  src,
  { ...model, src, lineId: `picture-model/${src.split("/").at(-1)}` },
]));
const byId = new Map([...bySource.values()].map((model) => [model.lineId, model]));

export function pictureModelForWord(text: string, src: string | null | undefined) {
  const model = src ? bySource.get(src) : undefined;
  return model?.text.normalize("NFC").toLocaleLowerCase("es") ===
    text.normalize("NFC").toLocaleLowerCase("es")
    ? model
    : undefined;
}

export function pictureModelById(lineId: string) {
  return byId.get(lineId);
}

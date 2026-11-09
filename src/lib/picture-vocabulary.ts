import vocabulary from "@/content/picture-vocabulary.json";
import recordings from "@/content/picture-name-recordings.json";

export type VerifiedPictureName = { key: string; name: string; images: string[] };
export function pictureNameKey(name: string): string {
  return name.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
}
const byImage = new Map<string, VerifiedPictureName[]>();
for (const entry of vocabulary)
  for (const src of entry.images) byImage.set(src, [...(byImage.get(src) ?? []), entry]);
/** An authored label disambiguates shared art. Unknown names and filenames never become vocabulary. */
export function resolvePictureName(src: string, authoredLabel = ""): VerifiedPictureName | null {
  const candidates = byImage.get(src) ?? [];
  if (authoredLabel.trim())
    return candidates.find((entry) => entry.key === pictureNameKey(authoredLabel)) ?? null;
  return candidates.length === 1 ? candidates[0]! : null;
}
/** Resolve authored vocabulary by exact canonical label, never by free-form text. */
export function resolvePictureNameByLabel(label: string): VerifiedPictureName | null {
  const key = pictureNameKey(label);
  const matches = vocabulary.filter((entry) => entry.key === key);
  return matches.length === 1 ? matches[0]! : null;
}
/** Resolve an exact authored word only when it maps to one approved vocabulary recording. */
export function resolveRecordedPictureName(label: string): VerifiedPictureName | null {
  const normalized = pictureNameKey(label);
  if (!normalized) return null;
  const matches = vocabulary.filter(
    (entry) =>
      pictureNameKey(entry.key) === normalized || pictureNameKey(entry.name) === normalized,
  );
  if (matches.length !== 1 || !approvedPictureRecording(matches[0]!.key)) return null;
  return matches[0]!;
}
export function approvedPictureRecording(key: string): string | undefined {
  const approved = recordings.approved as Array<{ key: string; src: string; approval: string }>;
  return approved.find((entry) => entry.key === key && entry.approval)?.src;
}

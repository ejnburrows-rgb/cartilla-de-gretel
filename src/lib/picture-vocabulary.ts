import vocabulary from '@/content/picture-vocabulary.json';
import recordings from '@/content/picture-name-recordings.json';

export type VerifiedPictureName = { key: string; name: string; images: string[] };
export function pictureNameKey(name: string): string { return name.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('es'); }
const byImage = new Map<string, VerifiedPictureName[]>();
for (const entry of vocabulary) for (const src of entry.images) byImage.set(src, [...(byImage.get(src) ?? []), entry]);
/** An authored label disambiguates shared art. Unknown names and filenames never become vocabulary. */
export function resolvePictureName(src: string, authoredLabel = ''): VerifiedPictureName | null {
  const candidates = byImage.get(src) ?? [];
  if (authoredLabel.trim()) return candidates.find(entry => entry.key === pictureNameKey(authoredLabel)) ?? null;
  return candidates.length === 1 ? candidates[0]! : null;
}
export function approvedPictureRecording(key: string): string | undefined {
  const approved = recordings.approved as Array<{ key: string; src: string; approval: string }>;
  return approved.find(entry => entry.key === key && entry.approval)?.src;
}

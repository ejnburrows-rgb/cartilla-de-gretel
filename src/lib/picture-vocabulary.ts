import vocabulary from '@/content/picture-vocabulary.json';
import recordings from '@/content/picture-name-recordings.json';
import slots from '@/content/picture-recording-slots.json';
import { TRUE_BLINK_FRAMES } from './living-blink-map';

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
  const direct = approved.find(entry => entry.key === key && entry.approval)?.src;
  if (direct) return direct;
  // Exact source-backed alias only; never strip labels or guess scene words.
  if (key === 'oso (parpadeo)' &&
      TRUE_BLINK_FRAMES['/cartilla/art/faithful/vocal-o/oso.webp'] === '/cartilla/art/faithful/vocal-o/oso-blink.webp') {
    return approved.find(entry => entry.key === 'oso' && entry.approval)?.src;
  }
  return undefined;
}

/** Pending file paths are explicit wiring, not permission to play unverified files. */
export function pictureRecordingSlot(key: string): { src: string; state: 'approved' | 'pending' } | undefined {
  const approved = approvedPictureRecording(key);
  if (approved) return { src: approved, state: 'approved' };
  const pending = slots.pending.find(entry => entry.key === key);
  return pending ? { src: pending.src, state: 'pending' } : undefined;
}

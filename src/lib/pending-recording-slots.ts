import nativeAssets from '@/data/flipchart-native-assets.json';
import slots from '@/content/picture-recording-slots.json';
import vocabulary from '@/content/picture-vocabulary.json';

/** Bind by exact authored source image, never infer a page or utterance from a filename. */
export function pendingRecordingSlotsForPage(pageNumber: number): Array<{ key: string; src: string; pageNumber: number }> {
  const assets = (nativeAssets as Record<string, Array<{ src: string }>>)[String(pageNumber)] ?? [];
  const images = new Set(assets.map(asset => asset.src));
  return slots.pending.filter(slot => slot.state === 'pending' && vocabulary.some(word => word.key === slot.key && word.images.some(image => images.has(image))))
    .map(slot => ({ key: slot.key, src: slot.src, pageNumber }));
}

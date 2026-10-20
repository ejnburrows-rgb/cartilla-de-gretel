import { expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import vocabulary from '@/content/picture-vocabulary.json';
import slots from '@/content/picture-recording-slots.json';
import { approvedPictureRecording, pictureRecordingSlot } from '../picture-vocabulary';
it('wires each of the 37 original missing rows to its exact reserved filename without approval or fabricated speech', () => {
 const csv = readFileSync('docs/audio/MISSING_PICTURE_RECORDINGS.csv','utf8').trim().split(/\r?\n/).slice(1);
 expect(slots.pending).toHaveLength(37);
 for (const entry of slots.pending) {
   const row = csv.find(row => row.startsWith(entry.key+','));
   expect(row).toBeDefined(); expect(row).toContain(entry.src.slice(1));
   expect(vocabulary.some(word => word.key === entry.key)).toBe(true);
   if (entry.key === 'oso (parpadeo)') {
     expect(pictureRecordingSlot(entry.key)).toEqual({ src: '/audio/voz/vocabulario/oso.mp3', state: 'approved' });
   } else {
     expect(pictureRecordingSlot(entry.key)).toEqual({ src: entry.src, state: 'pending' });
     expect(approvedPictureRecording(entry.key)).toBeUndefined();
   }
   expect(entry.spokenText).toBe(entry.key === 'oso (parpadeo)' ? 'oso' : null); expect(existsSync('public'+entry.src)).toBe(false);
 }
});
it('preserves the 162 historical approved vocabulary entries and installed files', () => {
 const entries = JSON.parse(readFileSync('src/content/picture-name-recordings.json','utf8')).approved;
 expect(entries).toHaveLength(162);
 for (const entry of entries) {
   expect(approvedPictureRecording(entry.key)).toBe(entry.src);
   expect(existsSync('public'+entry.src)).toBe(true);
 }
});

import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import text from '@/data/flipchart-text-3-22.json';
import content from '@/data/content-manifest.json';
import {resolvePictureName,approvedPictureRecording} from '../picture-vocabulary';

describe('owner-corrected character name',()=>{
 it('uses the corrected title and story name on flipchart sheet 6',()=>{
  const lines=(text as Record<string,Array<{text:string}>>)['6'].map(x=>x.text);
  expect(lines).toContain('La niña distraída');
  expect(lines).toContain('Distraída es la “Ee”');
 });
 it('uses the corrected accessible picture name without the old spoken recording',()=>{
  const p=resolvePictureName('/cartilla/art/optimized/flipchart-native/p006-scene.png','niña distraída');
  expect(p?.name).toBe('niña distraída');
  expect(approvedPictureRecording(p!.key)).toBeUndefined();
 });
 it('has no old character name in active app, guide or audio mapping text',()=>{
  const files=['public/cartilla/art/manifest.json','src/data/flipchart-production-art.json','src/data/flipchart-text-3-22.json','src/data/content-manifest.json','src/content/picture-vocabulary.json','src/content/picture-name-recordings.json','src/content/guides/lesson-4.tsx','src/content/guia/lesson-4.json','src/content/guia/lesson-1.json'];
  for(const p of files) expect(readFileSync(p,'utf8').toLocaleLowerCase('es'),p).not.toMatch(/sordita|sord%69ta|sord\\u0069ta/);
  expect(JSON.stringify(content)).toContain('La niña distraída');
 });
});

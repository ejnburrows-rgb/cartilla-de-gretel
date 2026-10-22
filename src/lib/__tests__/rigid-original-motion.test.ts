import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
const manifest=JSON.parse(readFileSync('scripts/living-motion/manifest.json','utf8'));
const names=['abanico','vocal-a-abanico','leccion-1-carro','leccion-1-maiz','leccion-1-ojos','vocal-a-aguja','vocal-a-alas','vocal-a-ardilla','vocal-e-estrella','vocal-o-oruga','vocal-u-unicornio','fc_p015_sopa','fc_p024_lala','vocal-i-iman','vocal-e-escoba'];
describe('rigid original-art motion',()=>{
 for(const name of names)it(name+' has no pixel-warp filters and has an exact reduced-motion still',()=>{
  const e=manifest[name],svg=readFileSync(e.alive,'utf8');
  expect(svg).not.toMatch(/feDisplacementMap|feTurbulence/);
  expect(svg).toContain(readFileSync(e.still).toString('base64'));
  expect(svg).toContain('prefers-reduced-motion:reduce');
  expect(svg).toContain('.moving{display:none}');
 });
});

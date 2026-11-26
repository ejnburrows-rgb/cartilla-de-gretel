import {describe,it,expect} from 'vitest';
import {execFileSync} from 'node:child_process';
import bounds from '@/data/flipchart-art-content-bounds.json';
import stale from '@/data/stale-motion-art.json';
import {getLivingActor,LIVING_ACTORS} from '../living-actor-registry';
describe('current supplied still wins over stale embedded motion',()=>{
 it('freshness index matches actual committed still bytes',()=>{
  expect(()=>execFileSync('node',['scripts/check-motion-art-freshness.mjs','--check'])).not.toThrow();
 });
 it('has no stale motion left; the three repaired pictures move again from their current stills',()=>{
  // Rebuilt 2026-11-26 from the replaced stills (work/assets-motion); a future
  // still replacement re-enters the stale index and blocks motion again.
  expect(Object.keys(stale)).toEqual([]);
  for(const src of [
   '/cartilla/art/faithful/leccion-1/wb-p1/abeja.svg',
   '/cartilla/art/optimized/flipchart-native/p006-elefante.png',
   '/cartilla/art/faithful/vocal-a/abeja.webp',
  ]){
   expect(getLivingActor(src)?.aliveSrc).toBe(LIVING_ACTORS[src].aliveSrc);
  }
 });
 it('uses the replacement canvas bounds so the flipchart does not crop the elephant',()=>{
  // The full original-PDF elephant replaced the old 320px trimmed canvas.
  expect(bounds['/cartilla/art/optimized/flipchart-native/p006-elefante.png']).toEqual([570,540,0,0,570,540]);
 });
 it('keeps unaffected verified moving pictures available',()=>{
  expect(getLivingActor('/cartilla/art/faithful/vocal-o/oso.webp')?.aliveSrc).toContain('oso-alive.svg');
 });
});

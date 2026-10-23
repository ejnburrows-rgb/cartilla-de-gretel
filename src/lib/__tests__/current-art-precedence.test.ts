import {describe,it,expect} from 'vitest';
import {execFileSync} from 'node:child_process';
import bounds from '@/data/flipchart-art-content-bounds.json';
import stale from '@/data/stale-motion-art.json';
import {getLivingActor,LIVING_ACTORS} from '../living-actor-registry';
describe('current supplied still wins over stale embedded motion',()=>{
 it('freshness index matches actual committed still bytes',()=>{
  expect(()=>execFileSync('node',['scripts/check-motion-art-freshness.mjs','--check'])).not.toThrow();
 });
 it('blocks all old picture overrides without altering originals',()=>{
  expect(Object.keys(stale)).toHaveLength(6);
  for(const src of Object.keys(stale)){
   expect(LIVING_ACTORS[src].aliveSrc).toBeTruthy();
   expect(getLivingActor(src)).toBeNull();
  }
 });
 it('uses the replacement canvas bounds so the flipchart does not crop the elephant',()=>{
  expect(bounds['/cartilla/art/optimized/flipchart-native/p006-elefante.png']).toEqual([320,320,12,24,296,271]);
 });
 it('keeps unaffected verified moving pictures available',()=>{
  expect(getLivingActor('/cartilla/art/faithful/vocal-o/oso.webp')?.aliveSrc).toContain('oso-alive.svg');
 });
});

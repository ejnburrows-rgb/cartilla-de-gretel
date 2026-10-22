import {describe,it,expect} from 'vitest';
import {execFileSync} from 'node:child_process';
import stale from '@/data/stale-motion-art.json';
import {getLivingActor,LIVING_ACTORS} from '../living-actor-registry';
describe('current supplied still wins over stale embedded motion',()=>{
 it('freshness index matches actual committed still bytes',()=>{
  expect(()=>execFileSync('node',['scripts/check-motion-art-freshness.mjs','--check'])).not.toThrow();
 });
 it('blocks all four old picture overrides without altering originals',()=>{
  expect(Object.keys(stale)).toHaveLength(4);
  for(const src of Object.keys(stale)){
   expect(LIVING_ACTORS[src].aliveSrc).toBeTruthy();
   expect(getLivingActor(src)).toBeNull();
  }
 });
 it('keeps unaffected verified moving pictures available',()=>{
  expect(getLivingActor('/cartilla/art/faithful/vocal-o/oso.webp')?.aliveSrc).toContain('oso-alive.svg');
 });
});

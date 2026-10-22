// @vitest-environment node
import { describe,it,expect } from 'vitest';
import {qualifyVisualEvidence,screenSharpness,sha256} from '../check-art-visual-evidence.mjs';
const dir='docs/proofs/arbol-visual-regression/';
const bad=dir+'fixtures/arbol-known-bad.webp';
const good=dir+'fixtures/arbol-owner-good.webp';
const comparison={reviewed:true,assetSha256:sha256(good),sourceSha256:sha256('public/cartilla/art/owner-intake/2026-10-22/arbol-original-15ec6eb6.jpg'),evidencePath:dir+'before-after-grey-white-cream.png',reviewer:'visual review 2026-10-22',verdict:'MATCH'};
describe('owner arbol known-bad regression and evidence-first labels',()=>{
 it('rejects the old jagged tree, accepts the supplied clean tree screen',async()=>{
  expect((await screenSharpness(bad)).status).toBe('FAIL');
  expect((await screenSharpness(good)).status).toBe('PASS');
 });
 it('technical PASS alone never asserts fidelity',async()=>{
  const r=await qualifyVisualEvidence({file:good,technicalPass:true});
  expect(r.label).toContain('fidelity NOT verified');expect(r.lookCompared).toBe(false);
 });
 it('requires both screen and current-hash-bound look comparison',async()=>{
  expect((await qualifyVisualEvidence({file:good,technicalPass:true,comparison})).fidelityStatus).toBe('VISUALLY REVIEWED MATCH');
  expect((await qualifyVisualEvidence({file:bad,technicalPass:true,comparison:{...comparison,assetSha256:sha256(bad)}})).fidelityStatus).toBe('fidelity NOT verified');
  expect((await qualifyVisualEvidence({file:good,technicalPass:true,comparison:{...comparison,assetSha256:'stale'}})).fidelityStatus).toBe('fidelity NOT verified');
 });
});

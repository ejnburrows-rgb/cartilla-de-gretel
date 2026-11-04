import test from 'node:test';
import assert from 'node:assert/strict';
import { assessMerge, validatePolicy } from '../check-merge-policy.mjs';

const docs = {
 'AGENTS.md': 'SonarQube is OPTIONAL and NON-BLOCKING. Jules is the implementation and focused-test worker. Before merge, record exact head SHA, material changed-file list, applicable test command/results.',
 'PROJECT_SOURCE_OF_TRUTH.md': 'SonarCloud is advisory and non-blocking. A confirmed serious defect must be fixed. Meaningful PRs require current head review and targeted verification.',
 'PROJECT_FINISH_DEFINITION.md': 'SonarCloud review is advisory and non-blocking; final clean direct-cloud release verification passes; confirmed defects are blockers.',
 'tasks/plan.md': 'SonarCloud is advisory and non-blocking. Release proof requires current tests.'
};
const good = {changedFiles:['src/example.ts'],headMatches:true,scopeAuthorized:true,reviewed:true,tests:{status:'pass',headMatches:true},uiRequired:false,seriousDefects:[],ownerGateSatisfied:true,sonar:'failure'};
test('advisory Sonar failure does not block tested reviewed material code',()=>{const x=assessMerge(good);assert.equal(x.ok,true);assert.match(x.advisories.join(' '),/Sonar/i)});
test('Sonar success cannot pass an empty PR',()=>assert.equal(assessMerge({...good,changedFiles:[],sonar:'success'}).ok,false));
test('missing Jules test proof blocks relevant code',()=>assert.equal(assessMerge({...good,tests:{status:'missing'}}).ok,false));
test('stale head proof blocks merge',()=>assert.equal(assessMerge({...good,headMatches:false}).ok,false));
test('unverified test revision blocks merge',()=>assert.equal(assessMerge({...good,tests:{status:'pass',headMatches:false}}).ok,false));
test('actual serious defect blocks despite green Sonar',()=>assert.equal(assessMerge({...good,sonar:'success',seriousDefects:['Pointer cancel advances page']}).ok,false));
test('real visual change requires existing visible proof',()=>assert.equal(assessMerge({...good,uiRequired:true,uiEvidence:false}).ok,false));
test('owner-gated work remains blocked',()=>assert.equal(assessMerge({...good,ownerGateSatisfied:false}).ok,false));
test('unauthorized scope stays blocked',()=>assert.equal(assessMerge({...good,scopeAuthorized:false}).ok,false));
test('documentation-only PR does not need a Jules product test',()=>assert.equal(assessMerge({...good,changedFiles:['docs/guide.md'],tests:{status:'not-applicable'}}).ok,true));
test('legacy mandatory-Sonar wording is detected',()=>{let d={...docs,'PROJECT_SOURCE_OF_TRUTH.md':'merge proof also requires dual independent review of the exact current head: controller/assistant review plus SonarQube Cloud PR analysis.'};assert.equal(validatePolicy(d).ok,false)});
test('all governing docs agree on Sonar advisory rule',()=>assert.equal(validatePolicy(docs).ok,true));
test('missing governing file fails closed',()=>assert.equal(validatePolicy({...docs,'PROJECT_FINISH_DEFINITION.md':''}).ok,false));

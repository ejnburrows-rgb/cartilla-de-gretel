import test from 'node:test';
import assert from 'node:assert/strict';
import { assessMerge, assessCompletion, validatePolicy } from '../check-merge-policy.mjs';

const docs = {
 'AGENTS.md': 'SonarQube is OPTIONAL and NON-BLOCKING. Jules is the implementation and focused-test worker. Before merge, record exact head SHA, material changed-file list, applicable test command/results.',
 'PROJECT_SOURCE_OF_TRUTH.md': 'SonarCloud is advisory and non-blocking. A confirmed serious defect must be fixed. Meaningful PRs require current head review and targeted verification.',
 'PROJECT_FINISH_DEFINITION.md': 'SonarCloud review is advisory and non-blocking; final clean direct-cloud release verification passes; confirmed defects are blockers.',
 'tasks/plan.md': 'SonarCloud is advisory and non-blocking. Release proof requires current tests.'
};
const H='a'.repeat(40);
const OA={approvedBy:'owner',channel:'whatsapp',messageId:'wamid.HBgLMTk1NDg3MjI3NjIVAgASGCBBQzkwRTc3ODU1QThDMjg2',receivedAt:'2026-10-19T11:00:00Z',quote:'Yes, merge this one'};
const good = {pr:{number:1},headSha:H,currentHeadSha:H,headCommittedAt:'2026-10-19T10:00:00Z',ownerApproval:{...OA,prNumber:1,headSha:H},changedFiles:['src/example.ts'],headMatches:true,scopeAuthorized:true,reviewed:true,tests:{status:'pass',headMatches:true,command:'pnpm vitest run',passed:12,failed:0,headSha:H},uiRequired:false,seriousDefects:[],ownerGateSatisfied:true,sonar:'failure'};
test('advisory Sonar failure does not block tested reviewed material code',()=>{const x=assessMerge(good);assert.equal(x.ok,true);assert.match(x.advisories.join(' '),/Sonar/i)});
test('Sonar success cannot pass an empty PR',()=>assert.equal(assessMerge({...good,changedFiles:[],sonar:'success'}).ok,false));
test('missing Jules test proof blocks relevant code',()=>assert.equal(assessMerge({...good,tests:{status:'missing'}}).ok,false));
test('stale head proof blocks merge',()=>assert.equal(assessMerge({...good,headMatches:false}).ok,false));
test('unverified test revision blocks merge',()=>assert.equal(assessMerge({...good,tests:{...good.tests,headMatches:false}}).ok,false));
test('actual serious defect blocks despite green Sonar',()=>assert.equal(assessMerge({...good,sonar:'success',seriousDefects:['Pointer cancel advances page']}).ok,false));
test('real visual change requires existing visible proof',()=>assert.equal(assessMerge({...good,uiRequired:true,uiEvidence:false}).ok,false));
test('owner-gated work remains blocked',()=>assert.equal(assessMerge({...good,ownerGateSatisfied:false}).ok,false));
test('unauthorized scope stays blocked',()=>assert.equal(assessMerge({...good,scopeAuthorized:false}).ok,false));
test('documentation-only PR does not need a Jules product test',()=>assert.equal(assessMerge({...good,changedFiles:['docs/guide.md'],tests:{status:'not-applicable'}}).ok,true));
test('legacy mandatory-Sonar wording is detected',()=>{let d={...docs,'PROJECT_SOURCE_OF_TRUTH.md':'merge proof also requires dual independent review of the exact current head: controller/assistant review plus SonarQube Cloud PR analysis.'};assert.equal(validatePolicy(d).ok,false)});
test('all governing docs agree on Sonar advisory rule',()=>assert.equal(validatePolicy(docs).ok,true));
test('missing governing file fails closed',()=>assert.equal(validatePolicy({...docs,'PROJECT_FINISH_DEFINITION.md':''}).ok,false));

test('merge-readiness without owner approval is rejected',()=>{const {ownerApproval,...x}=good;const r=assessMerge(x);assert.equal(r.ok,false);assert.match(r.errors.join(' '),/OWNER_APPROVAL_MISSING/)});
test('agent-authored approval is rejected',()=>assert.equal(assessMerge({...good,ownerApproval:{...good.ownerApproval,approvedBy:'muse'}}).ok,false));
test('approval for another PR is rejected',()=>assert.equal(assessMerge({...good,ownerApproval:{...good.ownerApproval,prNumber:2}}).ok,false));
test('approval is invalidated when the head changes',()=>{const r=assessMerge({...good,currentHeadSha:'b'.repeat(40)});assert.equal(r.ok,false);assert.match(r.errors.join(' '),/STALE_HEAD/)});
test('approval of an older SHA does not cover a newer head',()=>{const n='b'.repeat(40);assert.equal(assessMerge({...good,headSha:n,currentHeadSha:n}).ok,false)});

const act={pr:7,headSha:H,headCommittedAt:'2026-10-19T10:00:00Z',files:['src/a.ts','src/a.test.ts'],reservation:{id:'job-7',state:'running',files:[{path:'src',mode:'exclusive'}]}};
const claim={outcome:'IMPLEMENTED',assignmentId:'job-7',pr:7,headSha:H,changedFiles:['src/a.ts','src/a.test.ts'],tests:{command:'pnpm vitest run src/a.test.ts',passed:4,failed:0,headSha:H},uiRequired:false,seriousDefects:[]};
test('valid completion claim passes',()=>assert.equal(assessCompletion(claim,act).ok,true));
test('completion without live data fails closed',()=>assert.equal(assessCompletion(claim,null).ok,false));
test('empty implementation claim fails',()=>assert.match(assessCompletion({...claim,changedFiles:[]},{...act,files:[]}).errors.join(' '),/NO_MATERIAL_CHANGE/));
test('missing tests fail',()=>assert.match(assessCompletion({...claim,tests:undefined},act).errors.join(' '),/TEST_EVIDENCE_INVALID/));
test('tests for an older SHA fail',()=>assert.equal(assessCompletion({...claim,tests:{...claim.tests,headSha:'c'.repeat(40)}},act).ok,false));
test('wrong or stale head SHA fails',()=>assert.match(assessCompletion({...claim,headSha:'d'.repeat(40)},act).errors.join(' '),/STALE_OR_WRONG_SHA/));
test('fabricated PR number fails',()=>assert.match(assessCompletion({...claim,pr:99},act).errors.join(' '),/PR_MISMATCH/));
test('claimed files that are not in the PR fail',()=>assert.match(assessCompletion({...claim,changedFiles:['src/a.ts','src/ghost.ts']},act).errors.join(' '),/FILES_MISMATCH/));
test('files outside the RESERVED paths fail',()=>assert.match(assessCompletion(claim,{...act,reservation:{...act.reservation,files:[{path:'docs',mode:'exclusive'}]}}).errors.join(' '),/SCOPE_VIOLATION/));
test('FINDING 7: claimant-supplied allowedPaths cannot widen scope',()=>assert.match(assessCompletion({...claim,allowedPaths:['src/','docs/','tests/']},{...act,reservation:{...act.reservation,files:[{path:'docs',mode:'exclusive'}]}}).errors.join(' '),/SCOPE_VIOLATION/));
test('FINDING 7: completion without a live reservation fails',()=>{const {reservation,...noRes}=act;assert.match(assessCompletion(claim,noRes).errors.join(' '),/RESERVATION_MISSING/)});
test('FINDING 7: claim for a different assignment than the reservation fails',()=>assert.match(assessCompletion({...claim,assignmentId:'job-8'},act).errors.join(' '),/ASSIGNMENT_MISMATCH/));
test('path traversal in changed files fails scope',()=>{const f=['src/../secrets/x.ts'];assert.match(assessCompletion({...claim,changedFiles:f},{...act,files:f}).errors.join(' '),/SCOPE_VIOLATION/)});
test('placeholder render proof fails',()=>assert.match(assessCompletion({...claim,uiRequired:true,renderProof:{kind:'screenshot',url:'https://example.com/shot.png',headSha:H}},act).errors.join(' '),/RENDER_PROOF_INVALID/));
test('real render proof for the actual head passes',()=>assert.equal(assessCompletion({...claim,uiRequired:true,renderProof:{kind:'screenshot',url:'https://files.example.net/p/shot.png',headSha:H}},act).ok,true));
test('UI applicability must be assessed',()=>assert.equal(assessCompletion({...claim,uiRequired:undefined},act).ok,false));
test('investigation is a distinct outcome, not implementation',()=>{const r=assessCompletion({outcome:'INVESTIGATED_NO_CHANGE_REQUIRED',evidenceRefs:['pr#1'],changedFiles:[]},act);assert.equal(r.ok,true);assert.match(r.note,/NOT an implementation/)});
test('investigation cannot carry code changes',()=>assert.equal(assessCompletion({outcome:'INVESTIGATED_NO_CHANGE_REQUIRED',evidenceRefs:['x'],changedFiles:['src/a.ts']},act).ok,false));
test('reviewed/approved/merged/deployed stages need their own evidence',()=>{for(const stage of ['reviewed','approved','merged','deployed','verified'])assert.equal(assessCompletion({...claim,stage},act).ok,false,stage)});

test('FINDING 5: fabricated owner approval provenance fails merge-readiness',()=>{
  for (const bad of [{messageId:'invented'},{messageId:'wamid.short'},{messageId:'wamid.INVENTEDINVENTEDINVENTED'},{channel:'email'},{receivedAt:'soon'},{receivedAt:'2999-01-01T00:00:00Z'},{quote:''},{approvedBy:'chatgpt'}]) {
    const r=assessMerge({...good,ownerApproval:{...good.ownerApproval,...bad}}); assert.equal(r.ok,false,JSON.stringify(bad));
  }
  const old=assessMerge({...good,ownerApproval:{...good.ownerApproval,receivedAt:'2026-10-19T09:00:00Z'}}); assert.match(old.errors.join(' '),/PREDATES_HEAD/);
  const noTime=assessMerge({...good,headCommittedAt:undefined}); assert.match(noTime.errors.join(' '),/HEAD_TIME_MISSING/);
});
test('FINDING 5: stage approved needs well-formed owner provenance bound to the head',()=>{
  const base={...claim,stage:'approved',review:{headSha:H}};
  assert.equal(assessCompletion({...base,ownerApproval:{...OA,prNumber:7,headSha:H}},act).ok,true);
  for (const bad of [{messageId:'invented'},{headSha:'b'.repeat(40)},{prNumber:8},{receivedAt:'2026-10-19T09:00:00Z'}]) assert.equal(assessCompletion({...base,ownerApproval:{...OA,prNumber:7,headSha:H,...bad}},act).ok,false,JSON.stringify(bad));
  assert.equal(assessCompletion({...base,ownerApproval:undefined},act).ok,false);
});
test('EXTRA: docs/ code files are not documentation-only; tests are still required',()=>{
  const f=['docs/tool.mjs']; const r=assessMerge({...good,changedFiles:f,tests:{status:'not-applicable'}}); assert.equal(r.ok,false);
  assert.equal(assessMerge({...good,changedFiles:['docs/guide.md'],tests:{status:'not-applicable'}}).ok,true);
  assert.equal(assessMerge({...good,changedFiles:['docs/../src/x.ts'],tests:{status:'not-applicable'}}).ok,false);
});
test('EXTRA: merge-readiness test evidence needs command, counts and the current head',()=>{
  assert.equal(assessMerge({...good,tests:{status:'pass',headMatches:true}}).ok,false);
  assert.equal(assessMerge({...good,tests:{...good.tests,headSha:'c'.repeat(40)}}).ok,false);
  assert.equal(assessMerge({...good,tests:{...good.tests,passed:0}}).ok,false);
});

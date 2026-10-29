import test from 'node:test';
import assert from 'node:assert/strict';
import { assessMerge, validatePolicy, validateRouting } from '../check-merge-policy.mjs';

const docs = {
 'AGENTS.md': 'SonarQube is OPTIONAL and NON-BLOCKING. GitHub #877. One active assignment = one bounded deliverable. Continue the next eligible already-assigned task in the same available session. Independent formal GitHub approval required. No self-approval. Mariposas is included. Before merge, record exact head SHA, material changed-file list, applicable test command/results.',
 'PROJECT_SOURCE_OF_TRUTH.md': 'SonarCloud is advisory and non-blocking. Existing assignments in GitHub #877. Separate formal GitHub review and merge authorization.',
 'PROJECT_FINISH_DEFINITION.md': 'SonarCloud review is advisory and non-blocking. Existing assignments on GitHub #877. Formal independent GitHub approval required.',
 'tasks/plan.md': 'SonarCloud is advisory and non-blocking. GitHub #877. Immediately continue the next independent eligible task in the same available session.'
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

test('old one-session one-deliverable stop instruction is rejected',()=>{const x=validatePolicy({...docs,'AGENTS.md':docs['AGENTS.md']+'\nOne session = one bounded deliverable.'});assert.equal(x.ok,false);assert.match(x.errors.join(' '),/session-ending/i)});
test('automatic Jules refill instructions are rejected',()=>{const x=validatePolicy({...docs,'AGENTS.md':docs['AGENTS.md']+'\nAutomatically refill verified idle slots.'});assert.equal(x.ok,false)});
test('obsolete voice choice is rejected',()=>{const x=validatePolicy({...docs,'PROJECT_SOURCE_OF_TRUTH.md':docs['PROJECT_SOURCE_OF_TRUTH.md']+'\nFinal voice/TTS direction is deferred until owner approves.'});assert.equal(x.ok,false)});
test('missing continue-next-task rule fails',()=>{const x=validatePolicy({...docs,'AGENTS.md':docs['AGENTS.md'].replace('Continue the next eligible already-assigned task in the same available session.','')});assert.equal(x.ok,false)});
test('missing formal GitHub approval rule fails',()=>{const x=validatePolicy({...docs,'AGENTS.md':docs['AGENTS.md'].replace('Independent formal GitHub approval required.','')});assert.equal(x.ok,false)});
test('stale blanket merge authorization is rejected',()=>{const x=validatePolicy({...docs,'PROJECT_FINISH_DEFINITION.md':docs['PROJECT_FINISH_DEFINITION.md']+'\nThe owner is not required to approve ordinary technical merges individually.'});assert.equal(x.ok,false)});
test('missing Mariposas inclusion rule fails',()=>{const x=validatePolicy({...docs,'AGENTS.md':docs['AGENTS.md'].replace('Mariposas is included.','')});assert.equal(x.ok,false)});

const routing = {
 'MASTER_REFERENCE.md': 'Execution policy: AGENTS.md. Current assignments/status: GitHub #877. GITHUB STATUS: not maintained in this file.',
 'docs/JOBS.md': 'Live queue: GitHub issue #877.',
 'tasks/todo.md': 'The only current work queue is GitHub issue #877.',
 '.agents/PROJECT_MEMORY.md': 'Historical session notes — not live instructions. Use GitHub issue #877.'
};
test('routing docs that defer to #877 pass',()=>assert.equal(validateRouting(routing).ok,true));
test('dated GitHub status snapshot in a routing doc is rejected',()=>{const x=validateRouting({...routing,'MASTER_REFERENCE.md':routing['MASTER_REFERENCE.md']+'\nGITHUB STATUS (verified 2026-10-28): #1079 OPEN and UNMERGED.'});assert.equal(x.ok,false);assert.match(x.errors.join(' '),/snapshot/)});
test('separate master completion plan reference is rejected',()=>assert.equal(validateRouting({...routing,'MASTER_REFERENCE.md':routing['MASTER_REFERENCE.md']+'\nController maintains this reference and the October 28 master completion plan.'}).ok,false));
test('routing doc without #877 is rejected',()=>assert.equal(validateRouting({...routing,'docs/JOBS.md':'Job board.'}).ok,false));
test('memory file without historical banner is rejected',()=>assert.equal(validateRouting({...routing,'.agents/PROJECT_MEMORY.md':'Swarm dispatcher checkpoint. #877'}).ok,false));
test('divergent merge-gate wording is rejected',()=>assert.equal(validateRouting({...routing,'MASTER_REFERENCE.md':routing['MASTER_REFERENCE.md']+'\nprotected-main approval remains mandatory.'}).ok,false));

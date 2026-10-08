import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers.mjs';
import {api} from '../src/api.mjs';
import {Runner} from '../src/runner.mjs';
const env={GITHUB_REPO:'owner/repo',CONTROLLER_ADMIN_TOKEN:'a'.repeat(40),CONTROLLER_READ_TOKEN:'r'.repeat(40)};
const request=(body,token=env.CONTROLLER_ADMIN_TOKEN)=>({url:'/api/jobs',method:'POST',headers:{authorization:'Bearer '+token},body:Buffer.from(JSON.stringify(body))});
const body={kind:'release_verification',pr_number:7,idempotency_key:'durable-release-request',test_paths:['src/example.test.ts']};
test('release request is durable before 202 even if GitHub and Inngest are unavailable',async()=>{
 const f=await fixture();let reads=0;const deps={ledger:f.ledger,send:async()=>{throw Error('queue unavailable');},github:{request:async()=>{reads++;throw Error('GitHub unavailable');}}};
 const result=await api(request(body),deps,env);assert.equal(result.status,202);assert.equal(result.body.stored,true);assert.equal(reads,0);assert.equal((await f.ledger.get(result.body.jobId)).source.lane,'release_request');await f.p.close();
});
test('repeated request uses one canonical durable job and rejects changed payload',async()=>{
 const f=await fixture(),deps={ledger:f.ledger,send:async()=>{}};
 const first=await api(request(body),deps,env),again=await api(request(body),deps,env);assert.equal(first.body.jobId,again.body.jobId);assert.equal((await f.ledger.jobs()).length,1);
 assert.equal((await api(request({...body,pr_number:8}),deps,env)).status,409);await f.p.close();
});
test('read-only token cannot dispatch a deferred verifier request',async()=>{
 const f=await fixture();assert.equal((await api(request(body,env.CONTROLLER_READ_TOKEN),{ledger:f.ledger},env)).status,401);assert.equal((await f.ledger.jobs()).length,0);await f.p.close();
});
test('deferred request uses fresh exact GitHub head and preserves canonical child on redelivery',async()=>{
 const f=await fixture(),head='a'.repeat(40),main='b'.repeat(40);
 const github={repo:'owner/repo',request:async path=>path.startsWith('/compare/')?{status:'ahead'}:{number:7,state:'open',head:{sha:head,repo:{full_name:'owner/repo'}},base:{ref:'main'},labels:[]},main:async()=>({sha:main}),pages:async()=>[{filename:'src/example.test.ts'}]};
 const parent=await f.ledger.create({key:'request-intake',kind:'reconcile',source:{lane:'release_request',pr:7},spec:{test_paths:['src/example.test.ts']}});
 const runner=new Runner({ledger:f.ledger,github,worker:{},send:async()=>{},env:{}});
 const result=await runner.process(parent.id);assert.equal(result.head,head);assert.equal(result.main,main);assert.equal(result.intake_only,true);assert.equal((await f.ledger.get(result.release_job)).source.head,head);assert.equal((await f.ledger.get(parent.id)).status,'verified');assert.equal((await runner.process(parent.id)).skipped,true);await f.p.close();
});
test('quota denial defers a stored release request instead of consuming worker capacity',async()=>{
 const f=await fixture();const job=await f.ledger.create({key:'request-quota',kind:'reconcile',source:{lane:'release_request',pr:7},spec:{}});
 const github={repo:'owner/repo',request:async()=>{const e=Error('GITHUB_RATE_LIMITED');e.retryAt=new Date(Date.now()+60000).toISOString();throw e;}};
 const runner=new Runner({ledger:f.ledger,github,worker:{},send:async()=>{},env:{}});
 await assert.rejects(runner.process(job.id),/GITHUB_RATE_LIMITED/);assert.equal((await f.ledger.get(job.id)).status,'retrying');assert.equal((await f.ledger.attempt(job.id)).worker,'controller');await f.p.close();
});
test('legacy open implementation verification becomes WAITING until mandatory new proofs pass',async()=>{
 const f=await fixture();const j=await f.ledger.create({key:'legacy-verified',kind:'issue_implementation',issue:7,spec:{}});
 await f.db.query("UPDATE jobs SET status='verified' WHERE id=$1",[j.id]);assert.equal(await f.ledger.supersedeVerification(j.id,{head:'a'.repeat(40),pr:7,main:'b'.repeat(40)}),true);
 assert.equal((await f.ledger.get(j.id)).status,'waiting');assert.equal((await f.ledger.get(j.id)).owner_action,'Nothing');await assert.rejects(f.ledger.supersedeVerification(j.id,{head:'HEAD',pr:7}),/FRESH_VERIFICATION_CONTEXT_REQUIRED/);await f.p.close();
});

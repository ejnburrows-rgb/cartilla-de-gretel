import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers.mjs';
import {ReleaseLoop,independentExecutionChecks} from '../src/release-loop.mjs';
const head='a'.repeat(40),main='b'.repeat(40);
async function setup(){
 const f=await fixture(),sent=[];let creates=0,starts=0,polls=0,finished=false,passed=true;
 const github={repo:'owner/repo',request:async()=>({number:7,head:{sha:head}}),main:async()=>({sha:main})};
 const executor={create:async()=>{creates++;return {sandbox_id:'sandbox-'+creates};},sandbox:async()=>({status:'RUNNING'}),start:async()=>{starts++;return {ready:true,command_id:'command-'+starts};},poll:async(s,c,p)=>{polls++;return {terminal:finished,passed,exit_code:passed?0:1,head:p.head,payload_hash:p.hash,command_id:c};},pause:async()=>({success:true})};
 const loop=new ReleaseLoop({ledger:f.ledger,github,executor,send:async e=>sent.push(e),env:{OPENHANDS_ENABLED:'true'}});
 const job=await f.ledger.create({key:'release-fixture',kind:'reconcile',source:{lane:'release_verifier',pr:7,head,main},spec:{files:['src/example.test.ts'],ui:false}});
 return {...f,loop,job,executor,github,sent,finish:()=>{finished=true;},fail:()=>{finished=true;passed=false;},counts:()=>({creates,starts,polls})};
}
test('release survives controller restart and polls same sandbox/command with one durable attempt',async()=>{
 const f=await setup();assert.equal((await f.loop.advance(f.job.id)).done,false);
 const before=await f.ledger.attempt(f.job.id);assert.equal(before.external_id,'sandbox-1');assert.equal(before.start_task_id,'command-1');f.finish();
 const restarted=new ReleaseLoop({ledger:f.ledger,github:f.github,executor:f.executor,send:async e=>f.sent.push(e),env:{OPENHANDS_ENABLED:'true'}});
 assert.equal((await restarted.advance(f.job.id)).passed,true);assert.equal((await f.ledger.get(f.job.id)).status,'verified');assert.equal((await f.ledger.get(f.job.id)).attempt_count,1);assert.deepEqual(f.counts(),{creates:1,starts:1,polls:2});await f.p.close();
});
test('unknown provisioning outcome blocks and never creates duplicate sandbox',async()=>{
 const f=await setup();let calls=0;f.executor.create=async()=>{calls++;throw Error('uncertain network response');};
 await f.loop.advance(f.job.id);await f.loop.advance(f.job.id);assert.equal(calls,1);assert.equal((await f.ledger.get(f.job.id)).status,'blocked');assert.equal((await f.ledger.attempt(f.job.id)).state,'ambiguous');await f.p.close();
});
test('unknown command response preserves sandbox and cannot blindly retry',async()=>{
 const f=await setup();let calls=0;f.executor.start=async()=>{calls++;throw Error('accepted command, lost response');};
 await f.loop.advance(f.job.id);await f.loop.advance(f.job.id);assert.equal(calls,1);assert.equal((await f.ledger.attempt(f.job.id)).external_id,'sandbox-1');await assert.rejects(f.ledger.retry(f.job.id,'confirmed_not_created'),/RETRY_UNSAFE/);await f.p.close();
});
test('changed PR head is rejected before paid provisioning',async()=>{
 const f=await setup();f.github.request=async()=>({number:7,head:{sha:'c'.repeat(40)}});await f.loop.advance(f.job.id);assert.equal(f.counts().creates,0);assert.equal((await f.ledger.get(f.job.id)).failure_reason,'RELEASE_STATE_CHANGED');await f.p.close();
});
test('failed releases retry within bounds and become visible dead letter',async()=>{
 const f=await setup();f.fail();for(let n=0;n<3;n++){await f.loop.advance(f.job.id);if(n<2)await f.db.query('UPDATE jobs SET retry_at=now()-interval \'1 second\' WHERE id=$1',[f.job.id]);}
 assert.equal((await f.ledger.get(f.job.id)).status,'dead_letter');assert.equal(f.counts().creates,3);assert.equal((await f.db.query('SELECT count(*)::int AS n FROM dead_letters WHERE job_id=$1',[f.job.id])).rows[0].n,1);await f.p.close();
});
test('release completion immediately refills queued verifier capacity',async()=>{
 const f=await setup();const next=await f.ledger.create({key:'next-release',kind:'reconcile',source:{lane:'release_verifier',pr:8,head,main},spec:{files:['src/another.test.ts']}});f.finish();await f.loop.advance(f.job.id);assert.ok(f.sent.some(e=>e.name==='cartilla/release.poll'&&e.data.jobId===next.id));await f.p.close();
});

test('terminal output survives pause uncertainty and restart without polling a paused runtime',async()=>{
 const f=await setup();f.finish();let pauses=0;f.executor.pause=async()=>{if(++pauses===1)throw Error('pause pending');return {success:true};};
 assert.equal((await f.loop.advance(f.job.id)).pause_pending,true);
 f.executor.poll=async()=>{throw Error('paused runtime must never be repolled');};
 assert.equal((await f.loop.advance(f.job.id)).passed,true);assert.equal(f.counts().creates,1);await f.p.close();
});
test('blocked deadline cannot be reopened by duplicate poll events',async()=>{
 const f=await setup();await f.loop.advance(f.job.id);await f.db.query("UPDATE job_attempts SET deadline=now()-interval '1 minute' WHERE job_id=$1",[f.job.id]);
 await f.loop.advance(f.job.id);assert.equal((await f.ledger.get(f.job.id)).failure_reason,'RELEASE_DEADLINE_EXCEEDED');await f.loop.advance(f.job.id);assert.equal(f.counts().creates,1);await f.p.close();
});

test('cancelled release retains capacity until the existing sandbox is confirmed paused',async()=>{
 const f=await setup();await f.loop.advance(f.job.id);await f.ledger.cancel(f.job.id);let pauses=0;f.executor.pause=async()=>{pauses++;return {success:true};};
 assert.equal((await f.loop.advance(f.job.id)).cancelled,true);assert.equal(pauses,1);assert.equal((await f.ledger.attempt(f.job.id)).state,'failed');assert.equal(f.counts().creates,1);await f.p.close();
});

test('GitHub quota wait pauses finished compute and cannot certify without fresh evidence',async()=>{
 const f=await setup();await f.loop.advance(f.job.id);f.finish();const request=f.github.request;let pauses=0;f.executor.pause=async()=>{pauses++;return {success:true};};f.github.request=async()=>{const e=Error('GITHUB_RATE_LIMITED');e.retryAt=new Date(Date.now()+60000).toISOString();throw e;};
 assert.ok((await f.loop.advance(f.job.id)).github_resume_at);assert.equal(pauses,1);assert.notEqual((await f.ledger.get(f.job.id)).status,'verified');
 f.github.request=request;f.executor.poll=async()=>{throw Error('paused runtime must not be polled');};assert.equal((await f.loop.advance(f.job.id)).passed,true);await f.p.close();
});
test('controller plan upgrade pauses the known sandbox and never duplicates dispatch',async()=>{
 const f=await setup();await f.loop.advance(f.job.id);let pauses=0;f.executor.pause=async()=>{pauses++;return {success:true};};await f.db.query("UPDATE job_attempts SET payload_hash='old-contract' WHERE job_id=$1",[f.job.id]);
 await f.loop.advance(f.job.id);assert.equal(pauses,1);assert.equal((await f.ledger.get(f.job.id)).failure_reason,'RELEASE_PLAN_CHANGED');assert.equal((await f.ledger.attempt(f.job.id)).state,'failed');assert.equal(f.counts().creates,1);await f.p.close();
});

test('generic release success never certifies UI browser or visual proof',()=>{
 assert.deepEqual(independentExecutionChecks,['targeted','worker','release']);
 assert.equal(independentExecutionChecks.includes('browser'),false);
 assert.equal(independentExecutionChecks.includes('visual'),false);
});

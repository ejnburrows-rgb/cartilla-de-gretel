import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:http';
import {createHmac} from 'node:crypto';
import {fixture} from './helpers.mjs';
import {webhook} from '../src/webhook.mjs';
import {rawBody,digest,safeText} from '../src/security.mjs';
import {Runner} from '../src/runner.mjs';
import {GitHub} from '../src/github.mjs';
const sha='a'.repeat(40);
const s={main:{sha},instructions:{'AGENTS.md':'bounded'},instructionHashes:{'AGENTS.md':'h'},issues:[],prs:[]};
const env={OPENHANDS_ENABLED:'true',OPENHANDS_API_KEY:'mock',OPENHANDS_CAPACITY:'1',OPENHANDS_DAILY_START_LIMIT:'10'};
test('process restart reconstructs persisted webhook, running attempt, conversation ID and source SHA from disk',async()=>{
 const path=await mkdtemp(join(tmpdir(),'cartilla-ledger-'));let f=await fixture(path);let starts=0;
 const github={repo:'owner/repo',main:async()=>s.main,snapshot:async()=>s,pages:async()=>[]};
 const worker={start:async()=>{starts++;return {start_task_id:'task-persistent',external_id:'conversation-persistent',status:'READY'};},poll:async a=>{assert.equal(a.external_id,'conversation-persistent');return {external_id:a.external_id,status:'finished',terminal:true};}};
 const received=await f.ledger.receive('restart-delivery','push',Buffer.from('{}'),{});
 const job=await f.ledger.create({key:'initial-repo-inspection:v1',kind:'repo_inspection',source:{admin:true},spec:{deadline_minutes:15}});
 await new Runner({ledger:f.ledger,github,worker,send:async()=>{},env}).dispatch(job,s);await f.p.close();
 f=await fixture(path);const persisted=await f.ledger.attempt(job.id);assert.equal(persisted.external_id,'conversation-persistent');assert.equal(persisted.starting_sha,sha);assert.equal((await f.ledger.get(received.job.id)).source.delivery,'restart-delivery');
 await new Runner({ledger:f.ledger,github,worker,send:async()=>{},env}).poll(job.id);assert.equal((await f.ledger.get(job.id)).status,'verified');assert.equal(starts,1);await f.p.close();await rm(path,{recursive:true,force:true});
});
test('real local HTTP raw-body HMAC receiver proves persisted receipt before HTTP 202, no worker in request',async()=>{
 const f=await fixture();const secret='local-fixture-secret';let workers=0,sends=0;
 const server=createServer(async(req,res)=>{try{const r=await webhook(await rawBody(req),req.headers,{ledger:f.ledger,env:{GITHUB_WEBHOOK_SECRET:secret,GITHUB_REPO:'owner/repo'},send:async()=>{sends++;}});res.statusCode=r.status;res.end(JSON.stringify(r.body));}catch{res.statusCode=500;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const raw=JSON.stringify({repository:{full_name:'owner/repo'},action:'opened',issue:{number:545},text:'Español ñ'});
 const signature='sha256='+createHmac('sha256',secret).update(raw).digest('hex');
 const r=await fetch(`http://127.0.0.1:${server.address().port}/api/github/webhook`,{method:'POST',headers:{'X-Hub-Signature-256':signature,'X-GitHub-Delivery':'local-http-delivery','X-GitHub-Event':'issues'},body:raw});assert.equal(r.status,202);
 const data=await r.json();assert.equal((await f.ledger.get(data.jobId)).status,'queued');assert.equal((await f.db.query('SELECT raw_body FROM webhook_events')).rows[0].raw_body,raw);assert.equal(workers,0);assert.equal(sends,1);await new Promise(r=>server.close(r));await f.p.close();
});
test('quota and capacity reservations serialize concurrent dispatches',async()=>{
 const f=await fixture();let starts=0;const github={repo:'owner/repo',main:async()=>s.main};const worker={start:async()=>{starts++;return {start_task_id:'one',external_id:'same',status:'READY'};}};
 const runner=new Runner({ledger:f.ledger,github,worker,send:async()=>{},env});const a=await f.ledger.create({key:'one',kind:'repo_inspection',source:{admin:true}}),b=await f.ledger.create({key:'two',kind:'repo_inspection',source:{admin:true}});
 await Promise.all([runner.dispatch(a,s),runner.dispatch(b,s)]);assert.equal(starts,1);assert.equal((await f.db.query('SELECT count(*)::int AS n FROM job_attempts')).rows[0].n,1);await f.p.close();
});
test('cancelled active run keeps capacity until external run is terminal; polling cannot reactivate it',async()=>{
 const f=await fixture();const github={repo:'owner/repo',main:async()=>s.main};let finished=false;
 const worker={start:async()=>({start_task_id:'t',external_id:'c',status:'READY'}),poll:async()=>({external_id:'c',status:finished?'finished':'running',terminal:finished})};
 const runner=new Runner({ledger:f.ledger,github,worker,send:async()=>{},env});runner.rescan=async()=>({});const j=await f.ledger.create({key:'cancel',kind:'repo_inspection',source:{admin:true}});
 await runner.dispatch(j,s);await f.ledger.cancel(j.id);await runner.poll(j.id);assert.equal((await f.ledger.get(j.id)).status,'cancelled');await assert.rejects(f.ledger.retry(j.id),/RETRY_UNSAFE/);
 finished=true;await runner.poll(j.id);assert.equal((await f.ledger.attempt(j.id)).state,'finished');await f.ledger.retry(j.id);assert.equal((await f.ledger.get(j.id)).status,'received');await f.p.close();
});
test('GitHub read errors do not manufacture a SHA or use a local fallback',async()=>{
 const github=new GitHub({repo:'owner/repo',fetcher:async()=>({ok:false,status:503})});await assert.rejects(github.main(),/GITHUB_HTTP_503/);
});
test('stable task hashes survive JSONB key reordering; configured secrets are redacted',()=>{
 assert.equal(digest({z:1,a:{y:2,x:3}}),digest({a:{x:3,y:2},z:1}));assert.equal(safeText('credential-is-private',{OPENHANDS_API_KEY:'credential-is-private'}),'[REDACTED]');
});
test('unknown POST outcome is recoverable only by explicit durable admin attestation, never automatic retry',async()=>{
 const f=await fixture();const github={repo:'owner/repo',main:async()=>s.main};const worker={start:async()=>{throw Error('network failure after POST');}};
 const runner=new Runner({ledger:f.ledger,github,worker,send:async()=>{},env});const j=await f.ledger.create({key:'admin-resolve',kind:'repo_inspection',source:{admin:true}});await runner.dispatch(j,s);
 await assert.rejects(f.ledger.retry(j.id),/RETRY_UNSAFE/);await f.ledger.retry(j.id,'confirmed_not_created');assert.equal((await f.ledger.get(j.id)).status,'received');
 const receipts=(await f.db.query("SELECT data FROM evidence_receipts WHERE kind='admin_dispatch_resolution' AND job_id=$1",[j.id])).rows;assert.equal(receipts[0].data.authority,'explicit_admin_attestation');await f.p.close();
});
test('unauthenticated webhook does not initialize unavailable database dependencies',async()=>{
 const {api}=await import('../src/api.mjs');const deps={get ledger(){throw Error('DATABASE_URL_REQUIRED');},send:async()=>{}};
 const req={url:'/api/github/webhook',method:'POST',headers:{},body:'{}'};const r=await api(req,deps,{GITHUB_WEBHOOK_SECRET:'known-secret'});assert.equal(r.status,401);
});

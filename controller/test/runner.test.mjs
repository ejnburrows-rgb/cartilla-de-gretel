import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {fixture} from './helpers.mjs';
import {Runner} from '../src/runner.mjs';
import {OpenHands} from '../src/openhands.mjs';
import {validateChange,candidates} from '../src/policy.mjs';
import {api} from '../src/api.mjs';
const sha='a'.repeat(40),head='b'.repeat(40);
const spec={action:'Repair narrow test behavior',paths:['src/example.ts'],dependencies:[],required_checks:['Independent tests'],deadline_minutes:15};
const issue=n=>({number:n,body:'```cartilla-controller\n'+JSON.stringify(spec)+'\n```',state:'open',labels:[{name:'controller:ready'}],user:{login:'owner'},html_url:`https://github.com/owner/repo/issues/${n}`});
const snapshot=()=>({main:{sha,url:'https://github.com/owner/repo/commit/'+sha},instructions:{'AGENTS.md':'bounded instructions'},instructionHashes:{'AGENTS.md':'hash'},issues:[],prs:[],fetched_at:new Date().toISOString()});
const gh=()=>({repo:'owner/repo',snapshot:async()=>snapshot(),main:async()=>snapshot().main,pages:async()=>[],request:async p=>issue(Number(p.split('/').at(-1)))});
const env={OPENHANDS_ENABLED:'true',OPENHANDS_API_KEY:'mock-only',OPENHANDS_DAILY_START_LIMIT:'10',OPENHANDS_CAPACITY:'2',TRUSTED_CHECK_APP_IDS:'123'};
async function setup(worker={start:async()=>({start_task_id:randomUUID(),external_id:randomUUID(),status:'READY'}),poll:async a=>({external_id:a.external_id,status:'finished',terminal:true})},extra={}){
 const f=await fixture();const sent=[];const github=gh();const runner=new Runner({ledger:f.ledger,github,worker,send:async e=>sent.push(e),env:{...env,...extra}});return {...f,runner,github,sent};
}
test('OpenHands Cloud start task followed by polling the same conversation; status checks never POST',async()=>{
 const calls=[];let poll=0;const client=new OpenHands({key:'mock',fetcher:async(url,init)=>{calls.push({url,method:init.method});return {ok:true,json:async()=>init.method==='POST'?{id:'start1',status:'WORKING'}:url.includes('start-tasks')?[{status:'READY',app_conversation_id:'conversation1'}]:[{id:'conversation1',execution_status:++poll===3?'finished':'running',sandbox_status:'RUNNING'}]};}});
 const start=await client.start('owner/repo','bounded');const a={start_task_id:start.start_task_id};a.external_id=(await client.poll(a)).external_id;
 await client.poll(a);await client.poll(a);const r=await client.poll(a);assert.equal(r.terminal,true);assert.equal(calls.filter(c=>c.method==='POST').length,1);assert.equal(calls.filter(c=>c.url.includes('?ids=conversation1')).length,3);
});
test('worker progress reads same conversation and excludes session keys and event content',async()=>{
 const calls=[];const client=new OpenHands({key:'mock',fetcher:async(url,init)=>{calls.push({url,method:init.method});return {ok:true,json:async()=>url.endsWith('/count')?27:url.includes('/events/search')?{items:[{kind:'ActionEvent',timestamp:'2026-10-08T01:00:00Z',command:'private command',session_api_key:'private session key'}]}:[{execution_status:'running',session_api_key:'private session key',metrics:{accumulated_cost:0.1},updated_at:'2026-10-08T01:00:00Z'}]};}});
 const r=await client.poll({external_id:'existing-conversation'});
 assert.equal(r.progress.event_count,27);assert.equal(r.progress.cost,0.1);
 assert.equal(JSON.stringify(r).includes('private'),false);assert.ok(calls.every(c=>c.method==='GET'&&c.url.includes('existing-conversation')));
});
test('quota is durable, reservations include uncertain dispatches and new status polls do not consume it',async()=>{
 const {p,ledger,runner,db}=await setup(undefined,{OPENHANDS_DAILY_START_LIMIT:'1'});const s=snapshot();
 const a=await ledger.create({key:'inspect-a',kind:'repo_inspection',source:{admin:true},spec:{deadline_minutes:15}});const b=await ledger.create({key:'inspect-b',kind:'repo_inspection',source:{admin:true},spec:{deadline_minutes:15}});
 assert.equal(await runner.dispatch(a,s),true);const before=(await db.query("SELECT count(*)::int AS n FROM job_attempts WHERE worker='openhands'")).rows[0].n;
 await runner.poll(a.id);assert.equal((await ledger.get(a.id)).status,'verified');assert.equal(await runner.dispatch(b,s),false);assert.equal((await ledger.get(b.id)).failure_reason,'DAILY_START_LIMIT');
 assert.equal((await db.query("SELECT count(*)::int AS n FROM job_attempts WHERE worker='openhands'")).rows[0].n,before);await p.close();
});
test('uncertain start outcome blocks redelivery and reserves capacity',async()=>{
 let starts=0;const {p,ledger,runner,db}=await setup({start:async()=>{starts++;throw Error('timeout after server accepted');}},{OPENHANDS_CAPACITY:'1'});
 const a=await ledger.create({key:'ambiguous',kind:'repo_inspection',source:{admin:true},spec:{deadline_minutes:15}});
 await runner.dispatch(a,snapshot());await runner.dispatch(await ledger.get(a.id),snapshot());
 assert.equal(starts,1);assert.equal((await ledger.get(a.id)).status,'blocked');assert.equal((await db.query('SELECT state FROM job_attempts')).rows[0].state,'ambiguous');await p.close();
});
test('single paid authorization excludes other jobs and cannot restart after UTC rollover',async()=>{
 const {p,ledger,runner,db}=await setup();
 const a=await ledger.create({key:'one-paid-run',kind:'repo_inspection',source:{admin:true},spec:{}});
 const b=await ledger.create({key:'unapproved-run',kind:'repo_inspection',source:{admin:true},spec:{}});
 runner.env.OPENHANDS_SINGLE_JOB_ID=a.id;
 assert.equal(await runner.dispatch(b,snapshot()),false);
 assert.equal(await runner.dispatch(a,snapshot()),true);
 await db.query("UPDATE job_attempts SET state='failed',dispatched_at=now()-interval '2 days' WHERE job_id=$1",[a.id]);
 await ledger.set(a.id,'retrying','simulated failure',{retry_at:new Date(0).toISOString()});
 assert.equal(await runner.dispatch(await ledger.get(a.id),snapshot()),false);
 assert.equal((await db.query("SELECT count(*)::int AS n FROM job_attempts WHERE worker='openhands'")).rows[0].n,1);
 await p.close();
});
const evidence=()=>({pr:{number:1,head,body:'Fixes #7'},compare:{status:'ahead',ahead_by:1},files:[{filename:'src/example.ts',status:'modified',additions:4,deletions:2}],checks:[{name:'Independent tests',head_sha:head,app_id:123,status:'completed',conclusion:'success',started_at:new Date().toISOString()}]});
test('rescan failure after independent validation cannot taint a verified worker job',async()=>{
 const {p,ledger,runner}=await setup();
 const j=await ledger.create({key:'verified-before-rescan',kind:'repo_inspection',source:{admin:true},spec:{}});
 await runner.dispatch(j,snapshot());runner.rescan=async()=>{throw Error('GITHUB_HTTP_403');};
 await assert.rejects(runner.poll(j.id),/GITHUB_HTTP_403/);
 const done=await ledger.get(j.id);assert.equal(done.status,'verified');assert.equal(done.failure_reason,null);
 await p.close();
});
test('worker success without material GitHub change is rejected; exact-head trusted checks and material change pass',()=>{
 const job={issue_number:7,spec};const e=evidence();assert.equal(validateChange(job,{...e,files:[]},[123]).passed,false);assert.equal(validateChange(job,{...e,checks:[]},[123]).passed,false);assert.equal(validateChange(job,e,[]).passed,false);assert.equal(validateChange(job,e,[123]).passed,true);
 assert.equal(validateChange(job,{...e,files:[{filename:'AGENTS.md',status:'modified',additions:1,deletions:0}]},[123]).reason,'SCOPE_VIOLATION');
 assert.equal(validateChange(job,{...e,checks:[{...e.checks[0],head_sha:sha}]},[123]).passed,false);
});
test('finished worker cannot certify a false implementation; terminal job immediately rescans',async()=>{
 const {p,ledger,runner,github}=await setup();github.changes=async()=>({passed:false,reason:'NO_EXPECTED_PR'});
 const j=await ledger.create({key:'implementation',kind:'issue_implementation',issue:7,source:{issue:7},spec});await runner.dispatch(j,snapshot());let rescans=0;runner.rescan=async()=>{rescans++;return {};};
 await runner.poll(j.id);assert.notEqual((await ledger.get(j.id)).status,'verified');assert.equal(rescans,1);assert.equal((await ledger.db.query('SELECT passed FROM validations WHERE job_id=$1',[j.id])).rows[0].passed,false);await p.close();
});
test('independent GitHub validation of a material PR verifies job and refills next safe job',async()=>{
 const {p,ledger,runner,github,db}=await setup(undefined,{OPENHANDS_CAPACITY:'1'});
 const inspect=await ledger.create({key:'initial-repo-inspection:v1',kind:'repo_inspection',source:{bootstrap:true},spec:{deadline_minutes:15}});await runner.dispatch(inspect,snapshot());
 const s=snapshot();s.issues=[issue(7),{...issue(8),body:'```cartilla-controller\n'+JSON.stringify({...spec,paths:['src/another.ts']})+'\n```'}];github.snapshot=async()=>s;github.request=async p=>s.issues.find(i=>i.number===Number(p.split('/').at(-1)));github.changes=async()=>evidence();
 await runner.poll(inspect.id);let jobs=await ledger.jobs();const first=jobs.find(j=>j.issue_number===7);assert.equal(first.status,'running');const second=jobs.find(j=>j.issue_number===8);assert.equal(second.status,'queued');
 await runner.poll(first.id);assert.equal((await ledger.get(first.id)).status,'verified');assert.equal((await ledger.get(second.id)).status,'running');assert.equal((await db.query('SELECT * FROM job_attempts')).rows.length,3);await p.close();
});
test('10-minute reconciliation discovers stranded received, queued, expired local and overdue retry jobs',async()=>{
 const {p,ledger,runner,db,sent}=await setup(undefined,{OPENHANDS_ENABLED:'false'});
 const received=await ledger.create({key:'stranded',kind:'reconcile',source:{event:true}});const queued=await ledger.create({key:'queued',kind:'reconcile',source:{event:true}});await db.query("UPDATE jobs SET status='queued',updated_at=now()-interval '11 minutes' WHERE id=$1",[queued.id]);
 const running=await ledger.create({key:'crashed',kind:'reconcile',source:{event:true}});const a=await ledger.claimLocal(running.id);await db.query("UPDATE jobs SET deadline=now()-interval '1 minute',lease_until=now()-interval '1 minute' WHERE id=$1",[running.id]);
 const retry=await ledger.create({key:'retry',kind:'reconcile',source:{event:true}});await ledger.set(retry.id,'retrying','offline',{retry_at:new Date(Date.now()-10000).toISOString()});
 await runner.reconcile();assert.ok(sent.some(e=>e.data.jobId===received.id));assert.ok(sent.some(e=>e.data.jobId===queued.id));assert.ok(sent.some(e=>e.data.jobId===retry.id));assert.equal((await ledger.get(running.id)).status,'retrying');assert.equal((await db.query('SELECT state FROM job_attempts WHERE id=$1',[a.id])).rows[0].state,'failed');await p.close();
});
test('dependencies, owner gates, unbounded scope and file overlap prevent unsafe allocation',()=>{
 const s=snapshot();s.issues=[issue(7),issue(8),{...issue(9),labels:[{name:'controller:ready'},{name:'owner-gated'}]}];const result=candidates(s,[],'owner/repo');assert.equal(result.selected.length,1);assert.ok(result.blocked.some(b=>b.reason==='FILE_OWNERSHIP_OVERLAP'));assert.ok(result.blocked.some(b=>b.reason==='ISSUE_GATED'));
});
test('read token cannot retry/cancel/dispatch; missing tokens and command fields fail closed',async()=>{
 const {p,ledger}=await fixture();const tokens={CONTROLLER_READ_TOKEN:'r'.repeat(40),CONTROLLER_ADMIN_TOKEN:'a'.repeat(40)};
 const j=await ledger.create({key:'auth',kind:'reconcile',source:{admin:true}});const deps={ledger,send:async()=>{}};
 for(const path of ['/api/jobs',`/api/jobs/${j.id}/retry`,`/api/jobs/${j.id}/cancel`])assert.equal((await api({url:path,method:'POST',headers:{authorization:'Bearer '+tokens.CONTROLLER_READ_TOKEN}},deps,tokens)).status,401);
 assert.equal((await api({url:'/api/jobs',method:'GET',headers:{}},deps,{})).status,401);
 assert.equal((await api({url:'/api/jobs',method:'POST',headers:{authorization:'Bearer '+tokens.CONTROLLER_ADMIN_TOKEN},body:JSON.stringify({kind:'repo_inspection',idempotency_key:'valid-idempotency',command:'rm -rf'})},deps,tokens)).status,400);await p.close();
});

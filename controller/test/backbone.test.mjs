import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHmac} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {Ledger} from '../src/ledger.mjs';
import {webhook} from '../src/webhook.mjs';
export async function fixture(path){
 const p=new PGlite(path);await p.exec(await readFile(new URL('../migrations/001-ledger.sql',import.meta.url),'utf8'));await p.exec('SET search_path TO cartilla_controller,public');
 // Tests exercise real PostgreSQL SQL; transactions are serialized like a checked-out pg connection.
 let chain=Promise.resolve();
 const db={query:(sql,args)=>p.query(sql,args),connect:async()=>{let release;const prior=chain;chain=new Promise(r=>release=r);await prior;return {query:db.query,release};}};
 return {p,db,ledger:new Ledger(db)};
}
const env={GITHUB_REPO:'owner/repo',GITHUB_WEBHOOK_SECRET:'test-only-signing-secret'};
const raw=Buffer.from(JSON.stringify({repository:{full_name:'owner/repo'},action:'opened'}));
const headers={'x-hub-signature-256':`sha256=${createHmac('sha256',env.GITHUB_WEBHOOK_SECRET).update(raw).digest('hex')}`,'x-github-delivery':'delivery-real-hmac-fixture','x-github-event':'issues'};
test('signed webhook commits event AND canonical job before acknowledging; duplicates create one job',async()=>{
 const {p,ledger,db}=await fixture();let sends=0;
 const send=async()=>{sends++;assert.equal((await db.query('SELECT count(*)::int AS n FROM webhook_events')).rows[0].n,1);assert.equal((await ledger.jobs()).length,1);};
 for(let i=0;i<8;i++){const r=await webhook(raw,headers,{ledger,send,env});assert.equal(r.status,202);assert.equal(r.body.duplicate,i>0);}
 assert.equal(sends,1);assert.equal((await ledger.jobs()).length,1);await p.close();
});
test('Inngest send failure leaves persisted job recoverable and a fresh queue generation',async()=>{
 const {p,ledger}=await fixture();const r=await webhook(raw,headers,{ledger,send:async()=>{throw Error('offline');},env});
 assert.equal(r.body.stored,true);assert.equal(r.body.queued,false);const j=await ledger.get(r.body.jobId);assert.equal(j.status,'received');
 let sent;await ledger.queue(j,async e=>sent=e);assert.match(sent.id,/:2$/);assert.equal((await ledger.get(j.id)).status,'queued');await p.close();
});
test('orphan stored event is reconstructable after process crash',async()=>{
 const {p,db,ledger}=await fixture();await db.query('INSERT INTO webhook_events(delivery_id,event_type,raw_body,payload) VALUES($1,$2,$3,$4)',['orphan','push','{}','{}']);
 assert.equal(await ledger.recoverOrphans(),1);assert.equal(await ledger.recoverOrphans(),0);assert.equal((await ledger.jobs()).length,1);await p.close();
});
test('concurrent deliveries are transactionally idempotent',async()=>{
 const {p,ledger}=await fixture();const r=await Promise.all(Array.from({length:10},()=>ledger.receive('concurrent','issues',raw,JSON.parse(raw))));
 assert.equal(new Set(r.map(x=>x.job.id)).size,1);assert.equal(r.filter(x=>!x.duplicate).length,1);await p.close();
});
test('worker failure has bounded retries then visible recoverable dead-letter',async()=>{
 const {p,ledger,db}=await fixture();const j=await ledger.create({key:'forced-fail',kind:'reconcile',source:{admin:true}});
 for(let i=0;i<3;i++){await db.query("UPDATE jobs SET status='received' WHERE id=$1",[j.id]);const a=await ledger.claimLocal(j.id);assert.equal(a.attempt_number,i+1);await db.query("UPDATE job_attempts SET state='failed' WHERE id=$1",[a.id]);await ledger.fail(j.id,'FORCED_CRASH');}
 assert.equal((await ledger.get(j.id)).status,'dead_letter');assert.equal((await db.query('SELECT * FROM dead_letters')).rows.length,1);assert.equal((await db.query('SELECT * FROM job_transitions')).rows.length,9);
 await ledger.retry(j.id);assert.equal((await ledger.get(j.id)).status,'received');await p.close();
});
test('missing evidence and generic status update cannot certify completion',async()=>{
 const {p,ledger,db}=await fixture();const j=await ledger.create({key:'no-evidence',kind:'reconcile',source:{admin:true}});const a=await ledger.claimLocal(j.id);
 await db.query("UPDATE job_attempts SET state='finished' WHERE id=$1",[a.id]);await assert.rejects(ledger.verify(j.id,a,'main',{passed:true}),/COMPLETION_DENIED/);
 await assert.rejects(ledger.set(j.id,'verified'),/VALIDATION_GATE/);await p.close();
});
test('invalid signature, missing secret and wrong repository fail closed',async()=>{
 const {p,ledger}=await fixture();const options={ledger,send:async()=>{},env};
 assert.equal((await webhook(raw,{...headers,'x-hub-signature-256':'sha256=bad'},options)).status,401);
 assert.equal((await webhook(raw,headers,{...options,env:{}})).status,503);
 assert.equal((await webhook(raw,headers,{...options,env:{...env,GITHUB_REPO:'other/repo'}})).status,403);assert.equal((await ledger.jobs()).length,0);await p.close();
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers.mjs';
import {api} from '../src/api.mjs';
import {VerificationPipeline} from '../src/verification.mjs';
const head='a'.repeat(40),main='b'.repeat(40),tokens={CONTROLLER_READ_TOKEN:'r'.repeat(40),CONTROLLER_ADMIN_TOKEN:'a'.repeat(40),GITHUB_REPO:'owner/repo'};
test('read token cannot certify independent review; stale head is rejected',async()=>{
 const f=await fixture();const j=await f.ledger.create({key:'review-auth',kind:'issue_implementation',issue:7,source:{issue:7},spec:{}});
 const deps={ledger:f.ledger,github:{changes:async()=>({pr:{head}}),main:async()=>({sha:main})},send:async()=>{}};
 const req={url:'/api/jobs/'+j.id+'/review',method:'POST',headers:{authorization:'Bearer '+tokens.CONTROLLER_READ_TOKEN},body:JSON.stringify({head,passed:true,summary:'Independent review of the actual diff completed.'})};
 assert.equal((await api(req,deps,tokens)).status,401);
 req.headers.authorization='Bearer '+tokens.CONTROLLER_ADMIN_TOKEN;req.body=JSON.stringify({head:'c'.repeat(40),passed:true,summary:'Independent review of the actual diff completed.'});assert.equal((await api(req,deps,tokens)).status,409);assert.equal((await f.db.query('SELECT count(*)::int AS n FROM validations')).rows[0].n,0);await f.p.close();
});
test('independent review is permanently stored before acknowledgment even if wakeup fails',async()=>{
 const f=await fixture();const j=await f.ledger.create({key:'review-durable',kind:'issue_implementation',issue:7,source:{issue:7},spec:{}});
 const result=await api({url:'/api/jobs/'+j.id+'/review',method:'POST',headers:{authorization:'Bearer '+tokens.CONTROLLER_ADMIN_TOKEN},body:JSON.stringify({head,passed:true,summary:'Independent review of changed behavior and actual diff completed.'})},{ledger:f.ledger,github:{changes:async()=>({pr:{head}}),main:async()=>({sha:main})},send:async()=>{throw Error('queue unavailable');}},tokens);
 assert.equal(result.status,202);const row=(await f.db.query('SELECT * FROM validations WHERE job_id=$1',[j.id])).rows[0];assert.equal(row.passed,true);assert.equal(row.details.head,head);assert.equal(row.details.main,main);await f.p.close();
});
test('later failed review revokes earlier approval on unchanged commit',async()=>{
 const f=await fixture();const parent=await f.ledger.create({key:'review-parent',kind:'issue_implementation',source:{},spec:{}}),release=await f.ledger.create({key:'review-release',kind:'reconcile',source:{lane:'release_verifier',parent_job:parent.id,pr:7,head,main},spec:{}});
 await f.ledger.receipt(release.id,'independent_release_execution',{passed:true,head,main,checks:['targeted','worker','release']});
 const gh={repo:'owner/repo',request:async()=>({head:{sha:head},labels:[]}),main:async()=>({sha:main}),pages:async path=>path.includes('/files')?[{filename:'src/example.ts'}]:[]};
 const pipeline=new VerificationPipeline({ledger:f.ledger,github:gh,send:async()=>{},env:{}}),job={...release,status:'verified'};
 await f.ledger.validate(parent.id,'controller_independent_review',true,{head,main});assert.equal((await pipeline.inspect(job)).passed,true);
 await f.ledger.validate(parent.id,'controller_independent_review',false,{head,main});assert.equal((await pipeline.inspect(job)).passed,false);await f.p.close();
});

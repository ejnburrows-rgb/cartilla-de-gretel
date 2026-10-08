import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GitHub} from '../src/github.mjs';
import {VerificationPipeline} from '../src/verification.mjs';
test('merge is denied without issue-specific authorization and never enables GitHub auto-merge',async()=>{
 let calls=0;const p=new VerificationPipeline({ledger:{},github:{request:async()=>calls++},send:async()=>{},env:{}});
 assert.equal((await p.merge({issue_number:7,status:'verified'},{status:'verified'})).reason,'MERGE_NOT_AUTHORIZED_FOR_ISSUE');assert.equal(calls,0);
});
test('authorized issue still cannot merge without both verified jobs',async()=>{
 const p=new VerificationPipeline({ledger:{},github:{},send:async()=>{},env:{CONTROLLER_MERGE_ISSUES:'7'}});
 assert.equal((await p.merge({id:'parent',issue_number:7,status:'waiting'},{status:'verified',source:{parent_job:'parent'}})).reason,'VERIFICATION_REQUIRED');
});
test('stale release head blocks an authorized merge before any mutation',async()=>{
 let merges=0;const p=new VerificationPipeline({ledger:{},github:{mergePullRequest:async()=>merges++},send:async()=>{},env:{CONTROLLER_MERGE_ISSUES:'7'}});
 p.inspect=async()=>({passed:false,reason:'PR_HEAD_CHANGED_REVERIFY'});
 assert.equal((await p.merge({id:'parent',issue_number:7,status:'verified'},{status:'verified',source:{parent_job:'parent'}})).reason,'PR_HEAD_CHANGED_REVERIFY');assert.equal(merges,0);
});
test('GitHub merge requires exact reviewed SHA and never deploys or deletes',async()=>{
 const calls=[];const sha='a'.repeat(40);const github=new GitHub({repo:'owner/repo',token:'private-token',fetcher:async(url,init)=>{calls.push({url,method:init.method,body:JSON.parse(init.body)});return {ok:true,json:async()=>({merged:true,sha:'b'.repeat(40)})};}});
 assert.equal((await github.mergePullRequest(7,sha)).merged,true);assert.equal(calls.length,1);assert.equal(calls[0].method,'PUT');assert.equal(calls[0].body.sha,sha);assert.equal(calls[0].url,'https://api.github.com/repos/owner/repo/pulls/7/merge');
 await assert.rejects(github.mergePullRequest(7,'HEAD'),/INVALID_AUTHORIZED_MERGE/);assert.equal(calls.length,1);
});

test('proof record posts exact mandatory dual-review statement before merge',async()=>{
 const calls=[];const client=new GitHub({repo:'owner/repo',fetcher:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({id:73})};}});
 assert.equal(await client.proofComment(7,'DUAL REVIEW VERIFIED FOR THIS HEAD'),73);
 assert.equal(calls.length,1);assert.match(calls[0].url,/issues\/7\/comments$/);
 assert.equal(calls[0].options.method,'POST');
 assert.equal(JSON.parse(calls[0].options.body).body,'DUAL REVIEW VERIFIED FOR THIS HEAD');
 await assert.rejects(client.proofComment(7,'not a verified proof'),/INVALID_DUAL_REVIEW_PROOF/);
 assert.equal(calls.length,1);
});

test('authorized verified release cannot merge without independent exact-head execution receipt',async()=>{
 const main='a'.repeat(40),head='b'.repeat(40);
 let merged=0;
 const checks=[{name:'Independent tests',app_id:123,head_sha:head,status:'completed',conclusion:'success',started_at:'2026-10-08T01:00:00Z'},{name:'SonarCloud Code Analysis',app_id:12526,head_sha:head,status:'completed',conclusion:'success',started_at:'2026-10-08T01:00:00Z'}];
 const parent={id:'parent',status:'verified',issue_number:7,spec:{paths:['src/example.ts'],required_checks:['Independent tests']}};
 const release={id:'release',status:'verified',source:{parent_job:'parent',pr:9}};
 const github={
  repo:'owner/repo',main:async()=>({sha:main}),
  changes:async()=>({compare:{status:'ahead',ahead_by:1},pr:{number:9,head,body:'Fixes #7'},files:[{filename:'src/example.ts',status:'modified',additions:1,deletions:1}],checks}),
  request:async(path)=>path==='/issues/7'?{user:{login:'owner'},state:'open',labels:[]}:path==='/pulls/9'?{number:9,state:'open',draft:false,merged:false,head:{sha:head,repo:{full_name:'owner/repo'}},base:{ref:'main'},mergeable:true}:{status:'ahead'},
  pages:async()=>[],mergePullRequest:async()=>{merged++;return {merged:true};}
 };
 const pipeline=new VerificationPipeline({ledger:{db:{query:async()=>({rows:[]})}},github,send:async()=>{},env:{CONTROLLER_MERGE_ISSUES:'7',TRUSTED_CHECK_APP_IDS:'123,12526'}});
 pipeline.inspect=async()=>({passed:true,head,main,requirements:{checks:['targeted','worker','review','release']}});
 assert.equal((await pipeline.merge(parent,release)).reason,'EXACT_HEAD_RELEASE_EVIDENCE_REQUIRED');
 assert.equal(merged,0);
});

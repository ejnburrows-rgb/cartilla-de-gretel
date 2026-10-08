import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GitHub,instructionPaths} from '../src/github.mjs';
import {fixture} from './helpers.mjs';
test('GitHub quota denial persists reset and restarted clients avoid further network reads',async()=>{
 const f=await fixture();let calls=0;const reset=Math.floor(Date.now()/1000)+600;
 const fetcher=async()=>{calls++;return {ok:false,status:403,headers:new Headers({'x-ratelimit-remaining':'0','x-ratelimit-reset':String(reset)}),json:async()=>({message:'API rate limit exceeded'})};};
 const client=new GitHub({repo:'owner/repo',ledger:f.ledger,fetcher,sleeper:async()=>{}});
 await assert.rejects(client.main(),e=>e.message==='GITHUB_RATE_LIMITED'&&!!e.retryAt);
 await assert.rejects(new GitHub({repo:'owner/repo',ledger:f.ledger,fetcher,sleeper:async()=>{}}).main(),/GITHUB_RATE_LIMITED/);
 assert.equal(calls,1);assert.equal((await f.ledger.jobs())[0].owner_action,'Nothing');await f.p.close();
});
test('secondary quota observes retry-after without blind HTTP retries',async()=>{
 let calls=0;const client=new GitHub({repo:'owner/repo',fetcher:async()=>{calls++;return {ok:false,status:429,headers:new Headers({'retry-after':'120'}),json:async()=>({})};},sleeper:async()=>{}});
 await assert.rejects(client.main(),e=>e.message==='GITHUB_RATE_LIMITED'&&new Date(e.retryAt)>new Date(Date.now()+110000));assert.equal(calls,1);
});
test('permission denial is not falsely represented as an expiring quota',async()=>{
 let calls=0;const client=new GitHub({repo:'owner/repo',fetcher:async()=>{calls++;return {ok:false,status:403,headers:new Headers(),json:async()=>({message:'Resource not accessible'})};},sleeper:async()=>{}});
 await assert.rejects(client.main(),/GITHUB_HTTP_403/);assert.equal(calls,1);
});
test('exact-main immutable instructions are cached while issues and PRs remain fresh',async()=>{
 const f=await fixture(),sha='a'.repeat(40),texts=Object.fromEntries(instructionPaths.map(p=>[p,'Pinned instruction '+p]));
 await f.db.query('INSERT INTO project_snapshots(id,main_sha,data) VALUES($1,$2,$3)',['00000000-0000-4000-8000-000000000001',sha,JSON.stringify({instruction_texts:texts})]);
 const calls=[];const client=new GitHub({repo:'owner/repo',ledger:f.ledger,fetcher:async url=>{calls.push(url);return {ok:true,json:async()=>url.endsWith('/commits/main')?{sha,commit:{}}:[]};}});
 const snapshot=await client.snapshot();assert.deepEqual(snapshot.instructions,texts);assert.equal(calls.some(u=>u.includes('/contents/')),false);assert.equal(calls.some(u=>u.includes('/issues?')),true);assert.equal(calls.some(u=>u.includes('/pulls?')),true);await f.p.close();
});

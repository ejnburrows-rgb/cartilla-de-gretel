import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {GitHub} from '../src/github.mjs';
import {protectPool} from '../src/db.mjs';
import {CONTROLLER_RECONCILE_CRON,quotaAwarePoll} from '../src/functions.mjs';

test('GitHub quota pauses worker polling until the shared reset instead of failing each step',async()=>{
 const future=new Date(Date.now()+90000).toISOString();
 const result=await quotaAwarePoll(async()=>{const e=new Error('GITHUB_RATE_LIMITED');e.retryAt=future;throw e;});
 assert.deepEqual(result,{done:false,github_resume_at:future});
 await assert.rejects(quotaAwarePoll(async()=>{throw Error('REAL_WORKER_FAILURE');}),/REAL_WORKER_FAILURE/);
 assert.deepEqual(await quotaAwarePoll(async()=>({done:true,verified:true})),{done:true,verified:true});
});
test('idle PostgreSQL pool errors are handled instead of crashing the process',()=>{
  const pool=new EventEmitter();
  protectPool(pool,{error(){}});
  assert.ok(pool.listenerCount('error')>0);
  assert.doesNotThrow(()=>pool.emit('error',new Error('terminating connection due to administrator command')));
});

test('transient GitHub socket failure retries the same idempotent read',async()=>{
  let calls=0;
  const github=new GitHub({
    repo:'owner/repo',
    sleeper:async()=>{},
    fetcher:async()=>{
      calls++;
      if(calls===1)throw new TypeError('fetch failed');
      return {ok:true,json:async()=>({sha:'a'.repeat(40),html_url:'https://example.test/commit',commit:{committer:{date:'2026-10-08T00:00:00Z'}}})};
    }
  });
  const main=await github.main();
  assert.equal(main.sha,'a'.repeat(40));
  assert.equal(calls,2);
});

test('controller reconciliation runs every minute so a lost retry wakeup cannot strand work for ten minutes',()=>{
  assert.equal(CONTROLLER_RECONCILE_CRON,'* * * * *');
});


test('draft controller PR is promoted to ready through GitHub GraphQL before merge',async()=>{
  const calls=[];
  const github=new GitHub({repo:'owner/repo',token:'mock',sleeper:async()=>{},fetcher:async(url,init={})=>{
    calls.push({url,method:init.method??'GET',body:init.body});
    if(url.endsWith('/pulls/7'))return {ok:true,json:async()=>({draft:true,node_id:'PR_node'})};
    if(url==='https://api.github.com/graphql')return {ok:true,json:async()=>({data:{markPullRequestReadyForReview:{pullRequest:{isDraft:false}}}})};
    throw new Error('unexpected request');
  }});
  assert.equal(await github.ready(7),true);
  assert.deepEqual(calls.map(c=>c.method),['GET','POST']);
  assert.match(calls[1].body,/markPullRequestReadyForReview/);
});

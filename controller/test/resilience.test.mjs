import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {GitHub} from '../src/github.mjs';
import {protectPool} from '../src/db.mjs';
import {CONTROLLER_RECONCILE_CRON} from '../src/functions.mjs';

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

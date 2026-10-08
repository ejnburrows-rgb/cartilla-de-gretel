import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import handler from '../api/handler.mjs';
import {rawBody,signatureOK} from '../src/security.mjs';
test('Web Standard request preserves exact signed JSON bytes',async()=>{
 const body='{\n "repository": {"full_name":"owner/repo"}, "zen": "hello"\n}';
 const request=new Request('https://controller.test/api/github/webhook',{method:'POST',body,headers:{'Content-Type':'application/json'}});
 const raw=await rawBody(request);assert.equal(raw.toString(),body);
 assert.equal(signatureOK(raw,'sha256='+createHmac('sha256','test-secret').update(body).digest('hex'),'test-secret'),true);
});
test('Web Standard body reader enforces limit',async()=>{
 await assert.rejects(rawBody(new Request('https://controller.test',{method:'POST',body:'12345'}),4),/BODY_TOO_LARGE/);
});
test('Vercel Web Standard handler retains read-only auth and Inngest configuration gate',async()=>{
 const response=await handler.fetch(new Request('https://controller.test/api/jobs'));assert.equal(response.status,401);
 const old=process.env.INNGEST_SIGNING_KEY;delete process.env.INNGEST_SIGNING_KEY;
 try{const r=await handler.fetch(new Request('https://controller.test/api/inngest'));assert.equal(r.status,503);assert.equal((await r.json()).error,'INNGEST_NOT_CONFIGURED');}finally{if(old!==undefined)process.env.INNGEST_SIGNING_KEY=old;}
});

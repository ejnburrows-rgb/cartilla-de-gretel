import test from 'node:test';
import assert from 'node:assert/strict';
import {OpenHands} from '../src/openhands.mjs';

test('poll scopes reused-session telemetry to the current attempt and reads a bounded event window',async()=>{
 const urls=[];
 const fetcher=async(url)=>{
  urls.push(url);
  if(url.includes('/api/v1/app-conversations?ids='))return {ok:true,json:async()=>[{execution_status:'finished',sandbox_status:'RUNNING',updated_at:'2026-10-08T11:00:00Z'}]};
  if(url.endsWith('/events/count'))return {ok:true,json:async()=>120};
  if(url.includes('/events/search'))return {ok:true,json:async()=>({items:[
   {kind:'ObservationEvent',source:'environment',timestamp:'2026-10-08T11:00:03Z'},
   {kind:'ActionEvent',source:'agent',timestamp:'2026-10-08T10:45:00Z'}
  ]})};
  throw Error('unexpected '+url);
 };
 const client=new OpenHands({key:'test',fetcher});
 const result=await client.poll({external_id:'conv-1',dispatched_at:'2026-10-08T10:30:00.000Z'});
 const search=urls.find(url=>url.includes('/events/search'));
 assert.ok(search);
 assert.match(search,/limit=100/);
 assert.match(search,/timestamp__gte=2026-10-08T10%3A30%3A00\.000Z/);
 assert.equal(result.progress.latest_events.some(event=>event.source==='agent'),true);
});


test('paused sandbox transitions STARTING to RUNNING without a new conversation',async()=>{
 let resume=0,reads=0,messages=0,starts=0;
 const fetcher=async(url)=>{
  if(url.endsWith('/resume')){resume++;return {ok:true,json:async()=>({success:true})};}
  if(url.includes('/app-conversations?ids=')){reads++;return {ok:true,json:async()=>[{sandbox_status:reads<3?'STARTING':'RUNNING',execution_status:reads<3?'paused':'finished'}]};}
  if(url.endsWith('/send-message')){messages++;return {ok:true,json:async()=>({success:true})};}
  if(url.endsWith('/app-conversations')){starts++;return {ok:true,json:async()=>({id:'new'})};}
  throw Error('unexpected '+url);
 };
 const client=new OpenHands({key:'test',fetcher,sleeper:async()=>{}});
 const result=await client.continueSession({external_id:'original',sandbox_id:'sandbox-original',sandbox_status:'PAUSED'},'task');
 assert.equal(result.external_id,'original');
 assert.deepEqual({resume,reads,messages,starts},{resume:1,reads:3,messages:1,starts:0});
});

test('persistent STARTING remains unsent and recoverable rather than duplicating a session',async()=>{
 let messages=0,reads=0;
 const fetcher=async url=>{
  if(url.endsWith('/resume'))return {ok:true,json:async()=>({success:true})};
  if(url.includes('/app-conversations?ids=')){reads++;return {ok:true,json:async()=>[{sandbox_status:'STARTING',execution_status:'paused'}]};}
  if(url.endsWith('/send-message'))messages++;
  throw Error('unexpected '+url);
 };
 const client=new OpenHands({key:'test',fetcher,sleeper:async()=>{}});
 await assert.rejects(client.continueSession({external_id:'old',sandbox_id:'old-sandbox',sandbox_status:'PAUSED'},'task'),error=>error.message==='OPENHANDS_RESUME_PENDING'&&error.not_sent===true);
 assert.equal(messages,0);
 assert.equal(reads,8);
});

test('reusable STARTING sandbox is kept for the same conversation rather than rejected',async()=>{
 const client=new OpenHands({key:'test',fetcher:async()=>({ok:true,json:async()=>[{selected_repository:'owner/repo',sandbox_status:'STARTING',sandbox_id:'sandbox-old',execution_status:'paused'}]})});
 const session=await client.reusable('conversation-old','owner/repo');
 assert.equal(session?.external_id,'conversation-old');
 assert.equal(session?.sandbox_id,'sandbox-old');
});

test('already-STARTING session waits and never sends a second resume POST',async()=>{
 let resume=0,reads=0,messages=0;
 const fetcher=async url=>{
  if(url.endsWith('/resume')){resume++;return {ok:true,json:async()=>({success:true})};}
  if(url.includes('/app-conversations?ids=')){reads++;return {ok:true,json:async()=>[{sandbox_status:reads===1?'STARTING':'RUNNING',execution_status:reads===1?'paused':'finished'}]};}
  if(url.endsWith('/send-message')){messages++;return {ok:true,json:async()=>({success:true})};}
  throw Error('unexpected '+url);
 };
 const client=new OpenHands({key:'test',fetcher,sleeper:async()=>{}});
 const result=await client.continueSession({external_id:'old',sandbox_id:'sandbox-old',sandbox_status:'STARTING'},'task');
 assert.equal(result.external_id,'old');
 assert.deepEqual({resume,reads,messages},{resume:0,reads:2,messages:1});
});
